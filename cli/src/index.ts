#!/usr/bin/env node
/**
 * AgentRadar CLI — entry point
 *
 * Usage:
 *   agentRadar check [--json] [--fix]
 *   agentRadar scan [--json]
 *   agentRadar suggest "<need>" [--json]
 */

import { program } from "commander";
import chalk from "chalk";
import * as path from "node:path";
import * as fs from "node:fs";
import { detectInstalledTools } from "./detect.js";
import { fetchIndex } from "./fetch.js";
import { runCheck } from "./check.js";
import { runScan, runSuggest } from "./scan.js";
import { printReport } from "./format.js";
import { runWatch, runConfigSet } from "./watch.js";
import type { RankResult } from "./types.js";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8")
) as { version: string };

program
  .name("agentRadar")
  .description("Discover, evaluate, and maintain agentic developer tools")
  .version(pkg.version);

// ── check ──────────────────────────────────────────────────────────────────

program
  .command("check")
  .description("Audit installed tools — flag archived, stale, or upgradeable")
  .option("--json", "Output machine-readable JSON (for CI parsers)")
  .option(
    "--fix",
    "Print install commands for recommended replacements (no side effects)"
  )
  .action(async (opts: { json?: boolean; fix?: boolean }) => {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);

    try {
      const [detected, index] = await Promise.all([
        Promise.resolve(detectInstalledTools(cwd)),
        fetchIndex(),
      ]);

      if (detected.length === 0) {
        console.error("No installed tools detected. Nothing to check.");
        process.exit(0);
      }

      const report = runCheck(detected, index.tools, projectName);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printReport(report, opts.fix ?? false);
      }

      process.exit(report.exit_code);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(2);
    }
  });

// ── scan ───────────────────────────────────────────────────────────────────

program
  .command("scan")
  .description("Read your project — find tool gaps and get recommendations")
  .option("--json", "Output machine-readable JSON")
  .action(async (opts: { json?: boolean }) => {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);

    try {
      const [detected, index] = await Promise.all([
        Promise.resolve(detectInstalledTools(cwd)),
        fetchIndex(),
      ]);

      const report = runScan(detected, index.tools, projectName);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log();
      console.log(
        chalk.bold("/radar scan") +
          chalk.dim(` — ${projectName} · ${report.scanned_at.slice(0, 10)}`)
      );
      console.log();

      if (report.covered_categories.length > 0) {
        console.log(
          chalk.dim("Covered: ") + report.covered_categories.join(", ")
        );
      }
      if (report.gap_categories.length > 0) {
        console.log(
          chalk.dim("Gaps:    ") + report.gap_categories.join(", ")
        );
      }
      console.log();

      if (report.recommendations.length === 0) {
        console.log(
          chalk.green(
            "Your project looks well-covered. Run `agentRadar check` to audit for stale tools."
          )
        );
      } else {
        console.log(chalk.bold("Recommendations:"));
        printRankResults(report.recommendations);
      }
      console.log();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(2);
    }
  });

// ── suggest ────────────────────────────────────────────────────────────────

program
  .command("suggest <need>")
  .description('Context-aware match — e.g. agentRadar suggest "browser testing"')
  .option("--json", "Output machine-readable JSON")
  .action(async (need: string, opts: { json?: boolean }) => {
    const cwd = process.cwd();

    try {
      const [detected, index] = await Promise.all([
        Promise.resolve(detectInstalledTools(cwd)),
        fetchIndex(),
      ]);

      const results = runSuggest(need, detected, index.tools);

      if (opts.json) {
        console.log(JSON.stringify({ need, results }, null, 2));
        return;
      }

      console.log();
      console.log(
        chalk.bold("/radar suggest") + chalk.dim(` "${need}"`)
      );
      console.log();

      if (results.length === 0) {
        console.log(chalk.dim("No matches found for that need."));
      } else {
        printRankResults(results);
        // Surface versus page if top two are close (within 1 point)
        const [first, second] = results;
        if (
          first &&
          second &&
          Math.abs(first.score - second.score) <= 1 &&
          (first.tool.versus_refs.length > 0 || second.tool.versus_refs.length > 0)
        ) {
          const versusId =
            first.tool.versus_refs[0] ?? second.tool.versus_refs[0];
          console.log(
            chalk.dim(`\nThese two are close. See: agentRadar show ${versusId}`)
          );
        }
      }
      console.log();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(2);
    }
  });

// ── watch ──────────────────────────────────────────────────────────────────

program
  .command("watch <tool-id>")
  .description("Subscribe to status change notifications for a tool (Pro)")
  .action(async (toolId: string) => {
    await runWatch(toolId).catch((err) => {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(2);
    });
  });

// ── config ─────────────────────────────────────────────────────────────────

const configCmd = program.command("config").description("Manage agentRadar configuration");
configCmd
  .command("set <key> <value>")
  .description("Set a config value (e.g. api_key, api_base)")
  .action((key: string, value: string) => {
    runConfigSet(key, value);
  });

// ── shared output helper ───────────────────────────────────────────────────

function printRankResults(results: RankResult[]): void {
  for (const r of results) {
    const statusLabel =
      r.tool.status === "stale"
        ? chalk.yellow(" [STALE]")
        : r.tool.status === "archived"
        ? chalk.red(" [ARCHIVED]")
        : "";

    const scoreLabel =
      r.tool.composite !== null && r.tool.eval_count >= 2
        ? chalk.dim(` · score ${r.tool.composite.toFixed(1)} (${r.tool.confidence})`)
        : "";

    console.log(
      `  ${chalk.bold(r.tool.name)}${statusLabel}${scoreLabel}`
    );
    console.log(
      `  ${chalk.dim(r.match_reason)} · ${chalk.cyan(r.tool.category)} · ${r.tool.pricing}`
    );
    console.log();
  }
}

program.parse();
