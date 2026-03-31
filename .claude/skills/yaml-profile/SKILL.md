---
name: yaml-profile
description: "Use when generating a new tool profile YAML file. Trigger: when asked to add a tool to the dataset, research a tool, or create a profile for any Claude Code or MCP tool."
---

# yaml-profile Skill

## Purpose
Generate a valid, complete AgentRadar tool profile YAML conforming to schema v1.0.

## BEFORE GENERATING ANYTHING
1. Read data/schema.yaml for exact field requirements
2. Read references/good-example.yaml to understand the expected quality
3. Research the tool at its source URL — do not invent any field values
4. If a field value cannot be confirmed from the source, set it to null

## GENERATION PROCESS
1. Visit the tool's source_url
2. Extract: name, category, pricing, license, last commit date (→ status)
3. Set scores: null (no evaluation yet — never invent scores)
4. Set score_confidence: null (same reason)
5. Set score_history: [] (empty array)
6. Set tags: 3–7 tags based on the tool's actual capabilities
7. Set versus_refs: [] (empty — filled later when versus pages are created)
8. Generate the id: lowercase, hyphen-separated, derived from source URL

## AFTER GENERATING
1. Run: python scripts/validate_yaml.py data/tools/[generated-file].yaml
2. Fix any validation errors
3. Only report DONE when validation passes with zero errors

## GOTCHAS (common failure points)
- scores must be null if there are fewer than 2 independent evaluations — never invent scores
- status must be computed from last_commit date: active <60d, stale 60–180d, archived >180d
- id must match the filename without .yaml extension
- category must be one of the 9 valid values in schema.yaml — check before setting
- versus_refs requires valid_until date on every entry — but start empty, don't add nulls
