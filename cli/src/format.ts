/**
 * format.ts — Human-readable output for the check command.
 *
 * All terminal color and layout logic lives here.
 * JSON output is handled in index.ts (pass-through JSON.stringify).
 */

import chalk from "chalk";
import type { CheckReport, CheckResult } from "./types.js";

const ICONS = {
  healthy: chalk.green("✓"),
  archived: chalk.red("✗"),
  stale: chalk.yellow("⚠"),
  upgrade: chalk.cyan("↑"),
  unmatched: chalk.gray("·"),
};

function formatResult(r: CheckResult): string {
  const icon = ICONS[r.status] ?? ICONS.unmatched;
  const label = r.matched?.name ?? r.detected.name;
  const alt = r.alternative
    ? `  ${chalk.dim("→")} ${chalk.cyan(r.alternative.name)} (active${
        r.alternative.composite ? `, score ${r.alternative.composite.toFixed(1)}` : ""
      })`
    : "";

  return `  ${icon}  ${chalk.bold(label)}\n     ${chalk.dim(r.message)}${alt ? "\n" + alt : ""}`;
}

function fixCommand(r: CheckResult): string | null {
  if (!r.alternative) return null;
  const src = r.alternative.source_url ?? "";
  if (r.detected.source === "mcp-config") {
    return `claude mcp add ${r.alternative.id}  # replaces ${r.detected.name}`;
  }
  if (r.detected.source === "package.json") {
    const pkg = r.alternative.name.toLowerCase().replace(/\s+/g, "-");
    return `npm install ${pkg}  # replaces ${r.detected.name}`;
  }
  return src ? `# Install: ${src}` : null;
}

export function printReport(report: CheckReport, fix: boolean): void {
  console.log();
  console.log(
    chalk.bold(`/radar check`) +
      chalk.dim(` — ${report.project} · ${report.checked_at.slice(0, 10)}`)
  );
  console.log();

  const issues = report.results.filter((r) =>
    ["archived", "stale", "upgrade"].includes(r.status)
  );
  const healthy = report.results.filter((r) => r.status === "healthy");
  const unmatched = report.results.filter((r) => r.status === "unmatched");

  if (issues.length > 0) {
    console.log(chalk.bold(`Issues (${issues.length}):`));
    issues.forEach((r) => console.log(formatResult(r)));
    console.log();
  }

  if (healthy.length > 0) {
    console.log(chalk.bold(`Healthy (${healthy.length}):`));
    healthy.forEach((r) => console.log(formatResult(r)));
    console.log();
  }

  if (unmatched.length > 0) {
    console.log(chalk.dim(`Not in dataset (${unmatched.length}): `) +
      chalk.dim(unmatched.map((r) => r.detected.name).join(", ")));
    console.log();
  }

  if (fix && issues.length > 0) {
    console.log(chalk.bold("Fix commands:"));
    issues.forEach((r) => {
      const cmd = fixCommand(r);
      if (cmd) console.log(chalk.cyan(`  $ ${cmd}`));
    });
    console.log();
  }

  if (report.exit_code === 0) {
    console.log(chalk.green("All checked tools are healthy."));
  } else {
    console.log(
      chalk.yellow(
        `${issues.length} issue(s) found. Run with --fix to see install commands.`
      )
    );
  }
  console.log();
}
