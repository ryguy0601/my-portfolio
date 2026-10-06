// src/services/smartEditorService.ts

export interface SmartEditorOptions {
  enableAutoList?: boolean;
  enablePairs?: boolean;
  enableSelectionWrap?: boolean;
  enableSmartTab?: boolean;
  enableShortcuts?: boolean;
  indentSize?: number;
  onUpdate?: (value: string) => void;
}

export interface ListMatch {
  indent: string;
  prefix: string;
  type: 'bullet' | 'task' | 'numbered' | 'quote' | 'indent';
  nextPrefix: string;
  isEmpty: boolean;
}

// Characters that can wrap a selection
const WRAP_MAP: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
  '"': '"',
  "'": "'",
  '`': '`',
  '*': '*',
  '_': '_',
  '~': '~',
  '$': '$',
};

// Opening characters that auto-pair when NO text is selected
const AUTO_PAIR_MAP: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

// Closing characters that overtype instead of duplicating
const CLOSING_CHARS = new Set([')', ']', '}', '>', '"', "'", '`']);

/**
 * Service providing modern IDE-like smart typing behaviors for text editors:
 * - Smart list continuation (- item -> Enter -> - next)
 * - Task list continuation (- [ ] item -> Enter -> - [ ])
 * - Numbered list auto-increment (1. item -> Enter -> 2.)
 * - Blockquote continuation (> quote -> Enter -> >)
 * - Auto-exit empty list items on double Enter (clears prefix)
 * - Smart Tab / Shift+Tab block indentation & list promotion/demotion
 * - Auto-closing brackets and quotes with overtype support
 * - Selection wrapping with formatting tokens (*, _, `, [, ", etc.)
 * - Paired character deletion on Backspace
 * - Formatting shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+E)
 */
export class SmartEditorService {
  /**
   * Analyzes a single line of text to determine if it is a list, quote, or indented block.
   */
  static analyzeListLine(line: string): ListMatch | null {
    // 1. Task List: e.g. "  - [ ] text", "  * [x] text", "  + [ ] "
    const taskMatch = line.match(/^(\s*)([-*+])\s+\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const [, indent, bullet, , content] = taskMatch;
      const isEmpty = !content.trim();
      return {
        indent,
        prefix: `${indent}${bullet} [ ] `,
        type: 'task',
        nextPrefix: `${indent}${bullet} [ ] `,
        isEmpty,
      };
    }

    // 2. Unordered Bullet List: e.g. "  - text", "  * text", "  + text"
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (bulletMatch) {
      const [, indent, bullet, content] = bulletMatch;
      const isEmpty = !content.trim();
      return {
        indent,
        prefix: `${indent}${bullet} `,
        type: 'bullet',
        nextPrefix: `${indent}${bullet} `,
        isEmpty,
      };
    }

    // 3. Numbered List: e.g. "  1. text", "  2) text"
    const numberedMatch = line.match(/^(\s*)(\d+)([.)])\s+(.*)$/);
    if (numberedMatch) {
      const [, indent, numStr, delimiter, content] = numberedMatch;
      const num = parseInt(numStr, 10);
      const isEmpty = !content.trim();
      return {
        indent,
        prefix: `${indent}${numStr}${delimiter} `,
        type: 'numbered',
        nextPrefix: `${indent}${num + 1}${delimiter} `,
        isEmpty,
      };
    }

    // 4. Blockquote: e.g. "> text", ">> text"
    const quoteMatch = line.match(/^(\s*)(>+)\s*(.*)$/);
    if (quoteMatch) {
      const [, indent, quotes, content] = quoteMatch;
      const isEmpty = !content.trim();
      return {
        indent,
        prefix: `${indent}${quotes} `,
        type: 'quote',
        nextPrefix: `${indent}${quotes} `,
        isEmpty,
      };
    }

    // 5. Empty line with indentation: auto-exit indentation
    if (/^(\s{2,}|\t+)$/.test(line)) {
      return {
        indent: line,
        prefix: line,
        type: 'indent',
        nextPrefix: '',
        isEmpty: true,
      };
    }

    // 6. Preserved Indentation for code blocks or indented prose
    const indentMatch = line.match(/^(\s{2,}|\t+)(.*)$/);
    if (indentMatch) {
      const [, indent, content] = indentMatch;
      if (content.trim()) {
        return {
          indent,
          prefix: indent,
          type: 'indent',
          nextPrefix: indent,
          isEmpty: false,
        };
      }
    }

    return null;
  }

  /**
   * Helper to set text and dispatch input events so previews and character counts update.
   * Leverages execCommand where possible for browser native undo/redo preservation.
   */
  static applyTextChange(
    textarea: HTMLTextAreaElement,
    replacement: string,
    selectStart: number,
    selectEnd: number,
    newCursorStart: number,
    newCursorEnd = newCursorStart,
    onUpdate?: (val: string) => void
  ): void {
    textarea.focus();
    textarea.setSelectionRange(selectStart, selectEnd);

    let insertedWithExec = false;
    try {
      insertedWithExec = document.execCommand('insertText', false, replacement);
    } catch {
      insertedWithExec = false;
    }

    if (!insertedWithExec) {
      textarea.setRangeText(replacement, selectStart, selectEnd, 'end');
    }

    textarea.setSelectionRange(newCursorStart, newCursorEnd);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    if (onUpdate) onUpdate(textarea.value);
  }

  /**
   * Handles the 'Enter' key: auto-continuation of lists and auto-exiting empty list items.
   * Returns true if the event was handled and default was prevented.
   */
  static handleEnter(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
    onUpdate?: (val: string) => void
  ): boolean {
    if (e.shiftKey) return false; // Allow soft breaks with Shift+Enter

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // Determine current line boundaries
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;

    const currentLine = value.substring(lineStart, lineEnd);
    const beforeCursorOnLine = value.substring(lineStart, start);

    const listInfo = this.analyzeListLine(currentLine);
    if (!listInfo) return false;

    // Case A: The list item is EMPTY (e.g. user pressed Enter on "- " or "1. ")
    // Auto-exit the list by deleting the prefix from the current line.
    if (listInfo.isEmpty || beforeCursorOnLine.trim() === listInfo.prefix.trim()) {
      e.preventDefault();
      this.applyTextChange(
        textarea,
        '',
        lineStart,
        lineEnd,
        lineStart,
        lineStart,
        onUpdate
      );
      return true;
    }

    // Case B: In the middle of an existing list item or at the end
    e.preventDefault();

    const insertText = `\n${listInfo.nextPrefix}`;
    this.applyTextChange(
      textarea,
      insertText,
      start,
      end,
      start + insertText.length,
      start + insertText.length,
      onUpdate
    );
    return true;
  }

  /**
   * Handles Tab and Shift+Tab for indenting and dedenting lists or blocks of text.
   */
  static handleTab(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
    shiftKey: boolean,
    indentSize = 2,
    onUpdate?: (val: string) => void
  ): boolean {
    e.preventDefault();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const indentStr = ' '.repeat(indentSize);

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;

    const currentLine = value.substring(lineStart, lineEnd);
    const isList = Boolean(this.analyzeListLine(currentLine));
    const hasMultiLineSelection = value.substring(start, end).includes('\n');

    // Case A: Simple single-line cursor not in a list -> insert indent spaces
    if (!hasMultiLineSelection && !shiftKey && !isList) {
      this.applyTextChange(
        textarea,
        indentStr,
        start,
        end,
        start + indentSize,
        start + indentSize,
        onUpdate
      );
      return true;
    }

    // Case B: Block or List item indent / dedent
    const blockStart = lineStart;
    const blockEnd = lineEnd;
    const lines = value.substring(blockStart, blockEnd).split('\n');

    let adjustedStart = start;
    let adjustedEnd = end;

    const modifiedLines = lines.map((line, index) => {
      if (shiftKey) {
        // Dedent: remove up to indentSize spaces or a tab
        if (line.startsWith('\t')) {
          if (index === 0) adjustedStart = Math.max(blockStart, adjustedStart - 1);
          adjustedEnd = Math.max(blockStart, adjustedEnd - 1);
          return line.substring(1);
        }
        const spaceMatch = line.match(/^ +/);
        if (spaceMatch) {
          const spacesToRemove = Math.min(spaceMatch[0].length, indentSize);
          if (index === 0) adjustedStart = Math.max(blockStart, adjustedStart - spacesToRemove);
          adjustedEnd = Math.max(blockStart, adjustedEnd - spacesToRemove);
          return line.substring(spacesToRemove);
        }
        return line;
      } else {
        // Indent: add indentStr
        if (index === 0) adjustedStart += indentSize;
        adjustedEnd += indentSize;
        return indentStr + line;
      }
    });

    const newBlockText = modifiedLines.join('\n');
    this.applyTextChange(
      textarea,
      newBlockText,
      blockStart,
      blockEnd,
      adjustedStart,
      adjustedEnd,
      onUpdate
    );
    return true;
  }

  /**
   * Handles character typing:
   * 1. If text is selected, wraps it in pairs (e.g. `*`, `_`, `[`, `"`, `` ` ``).
   * 2. If no text selected, auto-closes pairs `()`, `[]`, `{}`, `""`, etc.
   * 3. Overtypes closing bracket if cursor is already right in front of it.
   */
  static handleCharInput(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
    onUpdate?: (val: string) => void
  ): boolean {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;

    const key = e.key;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // Feature A: Selection Wrapping
    if (start !== end && WRAP_MAP[key]) {
      e.preventDefault();
      const openChar = key;
      const closeChar = WRAP_MAP[key];
      const selected = value.substring(start, end);
      const replacement = `${openChar}${selected}${closeChar}`;
      this.applyTextChange(
        textarea,
        replacement,
        start,
        end,
        start + 1,
        start + 1 + selected.length,
        onUpdate
      );
      return true;
    }

    // Feature B: Overtype closing character
    if (start === end && CLOSING_CHARS.has(key)) {
      if (value[start] === key) {
        e.preventDefault();
        textarea.setSelectionRange(start + 1, start + 1);
        return true;
      }
    }

    // Feature C: Auto-closing pairs when typing opening characters (without selection)
    if (start === end && AUTO_PAIR_MAP[key]) {
      // Don't auto-pair quotes if preceded by a letter/word character (e.g. contractions like don't)
      if (key === '"' || key === "'" || key === '`') {
        const prevChar = value[start - 1];
        if (prevChar && /\w/.test(prevChar)) return false;
      }

      // Don't auto-pair if immediately preceding a word character
      const nextChar = value[start];
      if (nextChar && /\w/.test(nextChar)) return false;

      e.preventDefault();
      const openChar = key;
      const closeChar = AUTO_PAIR_MAP[key];
      const replacement = `${openChar}${closeChar}`;
      this.applyTextChange(
        textarea,
        replacement,
        start,
        end,
        start + 1,
        start + 1,
        onUpdate
      );
      return true;
    }

    return false;
  }

  /**
   * Handles Backspace: if cursor is between a matched pair like `(|)`, deletes both.
   */
  static handleBackspace(
    textarea: HTMLTextAreaElement,
    e: KeyboardEvent,
    onUpdate?: (val: string) => void
  ): boolean {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) return false;

    const value = textarea.value;
    const prevChar = value[start - 1];
    const nextChar = value[start];

    if (prevChar && nextChar && (AUTO_PAIR_MAP[prevChar] === nextChar || WRAP_MAP[prevChar] === nextChar)) {
      e.preventDefault();
      this.applyTextChange(
        textarea,
        '',
        start - 1,
        start + 1,
        start - 1,
        start - 1,
        onUpdate
      );
      return true;
    }

    return false;
  }

  /**
   * Inserts formatting tokens (e.g. bold, italic, code) around selection or at cursor.
   */
  static insertFormatting(
    textarea: HTMLTextAreaElement,
    before: string,
    after = '',
    defaultText = '',
    onUpdate?: (val: string) => void
  ): void {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const textToInsert = selected || defaultText;
    const replacement = `${before}${textToInsert}${after}`;

    const newStart = !selected && defaultText ? start + before.length : start + replacement.length;
    const newEnd = !selected && defaultText ? start + before.length + defaultText.length : start + replacement.length;

    this.applyTextChange(
      textarea,
      replacement,
      start,
      end,
      newStart,
      newEnd,
      onUpdate
    );
    textarea.focus();
  }

  /**
   * Attaches all smart editing behaviors to a textarea element.
   * Returns a cleanup function to remove listeners.
   */
  static attach(
    textarea: HTMLTextAreaElement,
    options: SmartEditorOptions = {}
  ): () => void {
    const {
      enableAutoList = true,
      enablePairs = true,
      enableSelectionWrap = true,
      enableSmartTab = true,
      enableShortcuts = true,
      indentSize = 2,
      onUpdate,
    } = options;

    const handleKeydown = (e: KeyboardEvent) => {
      // 1. Formatting shortcuts
      if (enableShortcuts && (e.ctrlKey || e.metaKey)) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          this.insertFormatting(textarea, '**', '**', 'bold text', onUpdate);
          return;
        }
        if (key === 'i') {
          e.preventDefault();
          this.insertFormatting(textarea, '*', '*', 'italic text', onUpdate);
          return;
        }
        if (key === 'k') {
          e.preventDefault();
          this.insertFormatting(textarea, '[', '](https://)', 'Link text', onUpdate);
          return;
        }
        if (key === 'e') {
          e.preventDefault();
          this.insertFormatting(textarea, '`', '`', 'code', onUpdate);
          return;
        }
      }

      // 2. Smart Enter
      if (e.key === 'Enter' && enableAutoList) {
        if (this.handleEnter(textarea, e, onUpdate)) return;
      }

      // 3. Smart Tab
      if (e.key === 'Tab' && enableSmartTab) {
        if (this.handleTab(textarea, e, e.shiftKey, indentSize, onUpdate)) return;
      }

      // 4. Smart Backspace
      if (e.key === 'Backspace' && enablePairs) {
        if (this.handleBackspace(textarea, e, onUpdate)) return;
      }

      // 5. Smart Character / Auto-closing & Wrapping
      if ((enablePairs || enableSelectionWrap) && e.key.length === 1) {
        if (this.handleCharInput(textarea, e, onUpdate)) return;
      }
    };

    textarea.addEventListener('keydown', handleKeydown);

    return () => {
      textarea.removeEventListener('keydown', handleKeydown);
    };
  }
}

export const smartEditorService = new SmartEditorService();
