// src/utils/resumePdfGenerator.ts
import { jsPDF } from 'jspdf';

export interface ResumePdfData {
  name?: string;
  location?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  summary?: string;
  education?: string;
  style?: 'modern' | 'classic' | 'minimal';
  compactMode?: boolean;
  selectedProjects?: any[];
  selectedExperiences?: any[];
  selectedSkills?: any[];
}

interface FormattedWord {
  text: string;
  bold: boolean;
  isSpace: boolean;
}

/**
 * Tokenizes text containing markdown **bold** or __bold__ into runs.
 */
function parseMarkdownTokens(text: string): { text: string; bold: boolean }[] {
  if (!text) return [];
  const tokens: { text: string; bold: boolean }[] = [];
  const regex = /(\*\*|__)(.*?)\1/gs;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    tokens.push({ text: match[2], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), bold: false });
  }
  return tokens;
}

/**
 * Wraps rich-text tokens to fit within a specified maximum width in points.
 */
function wrapFormattedTokens(
  doc: jsPDF,
  tokens: { text: string; bold: boolean }[],
  maxWidth: number,
  fontFamily: string,
  fontSize: number
): FormattedWord[][] {
  doc.setFontSize(fontSize);
  const words: FormattedWord[] = [];

  for (const token of tokens) {
    // Split by whitespace preserving spaces
    const parts = token.text.split(/(\s+)/);
    for (const p of parts) {
      if (p.length > 0) {
        words.push({ text: p, bold: token.bold, isSpace: /^\s+$/.test(p) });
      }
    }
  }

  const lines: FormattedWord[][] = [];
  let currentLine: FormattedWord[] = [];
  let currentWidth = 0;

  for (const w of words) {
    doc.setFont(fontFamily, w.bold ? 'bold' : 'normal');
    const wWidth = doc.getTextWidth(w.text);
    if (w.isSpace && currentLine.length === 0) {
      continue; // Skip leading whitespace on new line
    }
    if (currentWidth + wWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [];
      currentWidth = 0;
      if (w.isSpace) continue;
    }
    currentLine.push(w);
    currentWidth += wWidth;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Renders wrapped formatted words at the target coordinates, advancing Y by lineHeight.
 */
function renderWrappedTokens(
  doc: jsPDF,
  startX: number,
  startY: number,
  lines: FormattedWord[][],
  lineHeight: number,
  fontFamily: string,
  fontSize: number,
  color: [number, number, number] = [17, 24, 39]
): number {
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);
  let y = startY;

  for (const line of lines) {
    let x = startX;
    for (const w of line) {
      doc.setFont(fontFamily, w.bold ? 'bold' : 'normal');
      doc.text(w.text, x, y);
      x += doc.getTextWidth(w.text);
    }
    y += lineHeight;
  }

  return y;
}

function ensureHttp(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Generates a native vector PDF with fully selectable, ATS-highlightable text,
 * clickable links, crisp vector lines, and precise Letter dimensions.
 */
export async function downloadResumeDirectPdf(data: ResumePdfData, filename?: string) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    orientation: 'portrait'
  });

  const isCompact = Boolean(data.compactMode);
  const style = data.style || 'modern';

  // Fonts available out-of-the-box in standard PDF engines:
  // - modern: Helvetica
  // - classic: Times
  // - minimal: Courier / Helvetica
  let fontFamily = 'helvetica';
  if (style === 'classic') {
    fontFamily = 'times';
  }

  const pageWidth = 612; // 8.5in in pt
  const pageHeight = 792; // 11in in pt
  const marginX = isCompact ? 32 : 38;
  const contentWidth = pageWidth - marginX * 2;

  let y = isCompact ? 28 : 36;

  // Header Color scheme
  let primaryColor: [number, number, number] = [37, 99, 235]; // Blue
  let titleColor: [number, number, number] = [30, 58, 138];
  let lineColor: [number, number, number] = [147, 197, 253];

  if (style === 'classic') {
    primaryColor = [17, 24, 39];
    titleColor = [17, 24, 39];
    lineColor = [68, 68, 68];
  } else if (style === 'minimal') {
    primaryColor = [71, 85, 105];
    titleColor = [51, 65, 85];
    lineColor = [203, 213, 225];
  }

  // Candidate Name
  const name = (data.name || 'RYAN CUCCURULLO').toUpperCase();
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(isCompact ? 16 : 18);
  doc.setTextColor(15, 23, 42);
  const nameWidth = doc.getTextWidth(name);
  doc.text(name, (pageWidth - nameWidth) / 2, y + (isCompact ? 14 : 16));
  y += isCompact ? 22 : 26;

  // Contact line (Location • Phone • Email)
  const contactParts = [data.location, data.phone, data.email].filter(Boolean) as string[];
  if (contactParts.length > 0) {
    const contactText = contactParts.join('  •  ');
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    const cWidth = doc.getTextWidth(contactText);
    doc.text(contactText, (pageWidth - cWidth) / 2, y + 8);
    y += 12;
  }

  // Links line (LinkedIn • GitHub • Portfolio)
  const links: { label: string; url: string }[] = [];
  if (data.linkedin) links.push({ label: 'LinkedIn', url: ensureHttp(data.linkedin) });
  if (data.github) links.push({ label: 'GitHub', url: ensureHttp(data.github) });
  if (data.portfolio) links.push({ label: 'Portfolio', url: ensureHttp(data.portfolio) });

  if (links.length > 0) {
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8.5);

    // Calculate total width of links with separators
    const sep = '  •  ';
    const sepWidth = doc.getTextWidth(sep);
    let totalLinksWidth = 0;
    links.forEach((link, idx) => {
      totalLinksWidth += doc.getTextWidth(link.label);
      if (idx < links.length - 1) totalLinksWidth += sepWidth;
    });

    let linkX = (pageWidth - totalLinksWidth) / 2;
    const linkY = y + 8;

    links.forEach((link, idx) => {
      doc.setTextColor(29, 78, 216);
      doc.text(link.label, linkX, linkY);
      const lWidth = doc.getTextWidth(link.label);
      doc.link(linkX, linkY - 7, lWidth, 9, { url: link.url });

      // Underline link
      doc.setDrawColor(29, 78, 216);
      doc.setLineWidth(0.5);
      doc.line(linkX, linkY + 1.5, linkX + lWidth, linkY + 1.5);

      linkX += lWidth;

      if (idx < links.length - 1) {
        doc.setTextColor(100, 116, 139);
        doc.text(sep, linkX, linkY);
        linkX += sepWidth;
      }
    });

    y += 14;
  }

  // Header separator line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(style === 'minimal' ? 1 : 1.5);
  doc.line(marginX, y + 2, pageWidth - marginX, y + 2);
  y += isCompact ? 10 : 14;

  // Helper for Section Titles
  function drawSectionTitle(title: string) {
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    doc.text(title.toUpperCase(), marginX, y + 8);

    doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
    doc.setLineWidth(0.75);
    doc.line(marginX, y + 11, pageWidth - marginX, y + 11);
    y += isCompact ? 16 : 18;
  }

  // 1. Professional Summary
  const summaryBullets = (data.summary || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (summaryBullets.length > 0) {
    drawSectionTitle('Professional Summary');
    const bulletFontSize = isCompact ? 8.2 : 8.8;
    const bulletLineHeight = isCompact ? 10.5 : 11.5;

    for (const b of summaryBullets) {
      const tokens = parseMarkdownTokens(b);
      const isSingleParagraph = summaryBullets.length === 1;

      if (isSingleParagraph) {
        const wrapped = wrapFormattedTokens(doc, tokens, contentWidth, fontFamily, bulletFontSize);
        y = renderWrappedTokens(doc, marginX, y + 6, wrapped, bulletLineHeight, fontFamily, bulletFontSize);
      } else {
        // Bullet point
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(bulletFontSize);
        doc.setTextColor(55, 65, 81);
        doc.text('•', marginX + 3, y + 6);

        const wrapped = wrapFormattedTokens(doc, tokens, contentWidth - 14, fontFamily, bulletFontSize);
        y = renderWrappedTokens(doc, marginX + 14, y + 6, wrapped, bulletLineHeight, fontFamily, bulletFontSize);
      }
      y += isCompact ? 1.5 : 2.5;
    }
    y += isCompact ? 2 : 4;
  }

  // 2. Technical Skills
  const groupedSkills: Record<string, string[]> = {};
  (data.selectedSkills || []).forEach((s) => {
    const cat = s.category || 'General';
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(s.name);
  });

  if (Object.keys(groupedSkills).length > 0) {
    drawSectionTitle('Technical Skills');
    const skillFontSize = isCompact ? 8 : 8.5;
    const skillLineHeight = isCompact ? 10.5 : 11.5;

    for (const [cat, skillList] of Object.entries(groupedSkills)) {
      const lineText = `**${cat}:** ${skillList.join(', ')}`;
      const tokens = parseMarkdownTokens(lineText);
      const wrapped = wrapFormattedTokens(doc, tokens, contentWidth, fontFamily, skillFontSize);
      y = renderWrappedTokens(doc, marginX, y + 6, wrapped, skillLineHeight, fontFamily, skillFontSize);
      y += isCompact ? 1 : 2;
    }
    y += isCompact ? 2 : 4;
  }

  // 3. Professional Experience
  const experiences = data.selectedExperiences || [];
  if (experiences.length > 0) {
    drawSectionTitle('Professional Experience');
    const expFontSize = isCompact ? 8.2 : 8.8;
    const expLineHeight = isCompact ? 10.5 : 11.5;

    for (const exp of experiences) {
      // Header: Company — Role | Dates
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(expFontSize + 0.5);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.company || '', marginX, y + 6);
      const compWidth = doc.getTextWidth(exp.company || '');

      doc.setFont(fontFamily, 'normal');
      doc.setTextColor(75, 85, 99);
      const roleText = ` — ${exp.role || ''}`;
      doc.text(roleText, marginX + compWidth, y + 6);

      const dateStr = `${exp.start_date || ''} – ${exp.end_date || 'Present'}`;
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(expFontSize);
      doc.setTextColor(100, 116, 139);
      const dWidth = doc.getTextWidth(dateStr);
      doc.text(dateStr, pageWidth - marginX - dWidth, y + 6);
      y += isCompact ? 11 : 12;

      // Bullets
      const expBullets = (exp.description || '')
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter(Boolean);

      for (const bullet of expBullets) {
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(expFontSize);
        doc.setTextColor(55, 65, 81);
        doc.text('•', marginX + 3, y + 6);

        const tokens = parseMarkdownTokens(bullet);
        const wrapped = wrapFormattedTokens(doc, tokens, contentWidth - 14, fontFamily, expFontSize);
        y = renderWrappedTokens(doc, marginX + 14, y + 6, wrapped, expLineHeight, fontFamily, expFontSize);
        y += isCompact ? 1.5 : 2;
      }
      y += isCompact ? 2 : 3;
    }
  }

  // 4. Selected Projects
  const projects = data.selectedProjects || [];
  if (projects.length > 0) {
    drawSectionTitle('Selected Projects');
    const projFontSize = isCompact ? 8.2 : 8.8;
    const projLineHeight = isCompact ? 10.5 : 11.5;

    for (const proj of projects) {
      // Header: Title — Tech Stack | GitHub Link
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(projFontSize + 0.5);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.title || '', marginX, y + 6);
      const titleW = doc.getTextWidth(proj.title || '');

      if (proj.tech_stack) {
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(projFontSize - 0.5);
        doc.setTextColor(100, 116, 139);
        doc.text(` — ${proj.tech_stack}`, marginX + titleW, y + 6);
      }

      if (proj.github_url) {
        const ghText = 'GitHub';
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(projFontSize - 0.5);
        doc.setTextColor(29, 78, 216);
        const ghW = doc.getTextWidth(ghText);
        const ghX = pageWidth - marginX - ghW;
        doc.text(ghText, ghX, y + 6);
        doc.link(ghX, y - 1, ghW, 9, { url: ensureHttp(proj.github_url) });

        doc.setDrawColor(29, 78, 216);
        doc.setLineWidth(0.5);
        doc.line(ghX, y + 7.5, ghX + ghW, y + 7.5);
      }
      y += isCompact ? 11 : 12;

      // Project bullets
      const bullets = Array.isArray(proj.bullets) && proj.bullets.length > 0
        ? proj.bullets
        : (proj.summary || proj.content || '')
            .split(/\r?\n/)
            .map((l: string) => l.trim())
            .filter(Boolean);

      for (const bullet of bullets) {
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(projFontSize);
        doc.setTextColor(55, 65, 81);
        doc.text('•', marginX + 3, y + 6);

        const tokens = parseMarkdownTokens(bullet);
        const wrapped = wrapFormattedTokens(doc, tokens, contentWidth - 14, fontFamily, projFontSize);
        y = renderWrappedTokens(doc, marginX + 14, y + 6, wrapped, projLineHeight, fontFamily, projFontSize);
        y += isCompact ? 1.5 : 2;
      }
      y += isCompact ? 2 : 3;
    }
  }

  // 5. Education
  if (data.education) {
    drawSectionTitle('Education');
    const eduFontSize = isCompact ? 8.2 : 8.8;
    const eduLineHeight = isCompact ? 10.5 : 11.5;

    const eduLines = data.education
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of eduLines) {
      const tokens = parseMarkdownTokens(line);
      const wrapped = wrapFormattedTokens(doc, tokens, contentWidth, fontFamily, eduFontSize);
      y = renderWrappedTokens(doc, marginX, y + 6, wrapped, eduLineHeight, fontFamily, eduFontSize);
      y += 1.5;
    }
  }

  const finalFilename = filename || `${(data.name || 'Resume').replace(/\s+/g, '_')}.pdf`;
  doc.save(finalFilename);
}

/**
 * Generates a native vector PDF for tailored Cover Letters.
 */
export async function downloadCoverLetterDirectPdf(
  candidate: { name?: string; location?: string; phone?: string; email?: string; linkedin?: string },
  coverLetterText: string,
  filename?: string
) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    orientation: 'portrait'
  });

  const fontFamily = 'helvetica';
  const marginX = 48;
  const contentWidth = 612 - marginX * 2;
  let y = 48;

  // Header
  const name = (candidate.name || 'RYAN CUCCURULLO').toUpperCase();
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(name, marginX, y + 16);
  y += 24;

  const contactList = [candidate.location, candidate.phone, candidate.email, candidate.linkedin].filter(Boolean);
  if (contactList.length > 0) {
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(contactList.join('  •  '), marginX, y + 8);
    y += 16;
  }

  // Divider
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.5);
  doc.line(marginX, y + 4, 612 - marginX, y + 4);
  y += 26;

  // Body paragraphs
  const paragraphs = coverLetterText.split(/\r?\n\r?\n/);
  const bodyFontSize = 10;
  const bodyLineHeight = 14;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const tokens = parseMarkdownTokens(trimmed);
    const wrapped = wrapFormattedTokens(doc, tokens, contentWidth, fontFamily, bodyFontSize);
    y = renderWrappedTokens(doc, marginX, y + 8, wrapped, bodyLineHeight, fontFamily, bodyFontSize);
    y += 10;
  }

  const finalFilename = filename || `${(candidate.name || 'Cover_Letter').replace(/\s+/g, '_')}_Cover_Letter.pdf`;
  doc.save(finalFilename);
}
