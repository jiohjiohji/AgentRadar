# AgentRadar

Discover, compare, and evaluate Claude Code and MCP agentic workflow tools.

## Repository Layout

```
AgentRadar/
├── AGENTS.md                 # Agent constitution — routing, constraints, decisions
├── CLAUDE.md                 # Claude Code session context
├── TASK.md                   # Active task ticket
├── RULES.md                  # Post-task iteration gate
├── DECISIONS.md              # Architectural decisions log
├── requirements.txt          # Python dependencies
│
├── data/                     # THE PRODUCT — Git-native YAML dataset
│   ├── schema.yaml           # 12-field tool profile schema v1.0
│   ├── tools/                # Tool profile YAMLs
│   ├── evaluations/          # Community evaluation YAMLs
│   ├── versus/               # Head-to-head comparison pages
│   ├── benchmarks/           # Benchmark definitions
│   └── digests/              # Generated digest content
│
├── core/                     # Python: crawlers, score computation, digest generator
├── api/                      # Cloudflare Worker: reads YAML → returns JSON
├── cli/                      # TypeScript CLI (npm install -g agentRadar)
├── web/                      # Static site: GitHub Pages + Pagefind search
├── claude-plugin/            # Claude Code /radar slash command plugin
│
├── scripts/                  # Validation and utility scripts
│   ├── validate_yaml.py      # Tool profile schema validator
│   ├── validate_evaluation.py# Evaluation report validator
│   └── validate_versus.py    # Versus page validator
│
├── tests/                    # Python test suite (pytest)
├── tasks/completed/          # Archived task records
├── docs/                     # Planning and specification documents
│
├── .claude/                  # Claude Code configuration
│   ├── commands/             # Slash commands (/new-tool, /iterate, etc.)
│   └── skills/               # Reusable agent skills
│
└── .github/                  # GitHub configuration
    ├── workflows/            # CI/CD (agnix, YAML validation, tests)
    └── ISSUE_TEMPLATE/       # Community submission forms
```

## Stack

- **Data**: Git YAML (no database)
- **API**: Cloudflare Workers
- **Search**: Pagefind (browser-side)
- **CLI**: TypeScript + Commander.js
- **Tests**: pytest (Python) + vitest (TypeScript)
