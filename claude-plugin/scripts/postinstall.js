#!/usr/bin/env node
/**
 * postinstall.js — Copy radar.md to ~/.claude/commands/ after npm install.
 *
 * Claude Code loads slash commands from:
 *   - ~/.claude/commands/  (global, available in all sessions)
 *   - .claude/commands/    (project-local, takes precedence)
 *
 * This script installs to the global location so /radar is available everywhere.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const SOURCE = path.join(__dirname, "..", "commands", "radar.md");
const COMMANDS_DIR = process.env.CLAUDE_COMMANDS_DIR
  ? path.resolve(process.env.CLAUDE_COMMANDS_DIR)
  : path.join(os.homedir(), ".claude", "commands");
const DEST = path.join(COMMANDS_DIR, "radar.md");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  try {
    ensureDir(COMMANDS_DIR);
    fs.copyFileSync(SOURCE, DEST);
    console.log(`✓ AgentRadar /radar command installed → ${DEST}`);
    console.log("  Open Claude Code and type /radar to get started.");
  } catch (err) {
    // Non-fatal: users can install manually by copying commands/radar.md
    console.warn(`⚠ Could not auto-install /radar command: ${err.message}`);
    console.warn(`  Manual install: copy commands/radar.md to ${COMMANDS_DIR}/radar.md`);
  }
}

main();
