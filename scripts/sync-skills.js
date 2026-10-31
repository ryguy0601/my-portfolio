#!/usr/bin/env node
// scripts/sync-skills.js
// Automatically syncs the repository's .agents/skills/ into the machine's global ~/.gemini/config/skills/
// so any updates pulled from Git on any computer immediately propagate globally across all projects.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const repoSkillsDir = path.join(repoRoot, '.agents', 'skills');

const homeDir = os.homedir();
const globalSkillsDir = path.join(homeDir, '.gemini', 'config', 'skills');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(repoSkillsDir)) {
    if (!fs.existsSync(globalSkillsDir)) {
      fs.mkdirSync(globalSkillsDir, { recursive: true });
    }
    const skillFolders = fs.readdirSync(repoSkillsDir);
    for (const folder of skillFolders) {
      const srcSkill = path.join(repoSkillsDir, folder);
      const destSkill = path.join(globalSkillsDir, folder);
      copyRecursive(srcSkill, destSkill);
      console.log(`[sync-skills] Synced skill '${folder}' to global config: ${destSkill}`);
    }
  }
} catch (err) {
  console.warn('[sync-skills] Note: Could not sync skills globally:', err.message);
}
