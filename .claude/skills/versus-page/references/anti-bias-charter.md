# Anti-Bias Charter for Versus Pages
# Every versus page author must read this before writing.

## The Seven Rules (all mandatory)

1. Tool authors cannot author, vote on, or dispute evaluations of their own tools.
   Structural enforcement: CoI-flagged evaluations excluded at API layer.

2. Score changes >±0.5 require 3+ independent data points before update is published.
   Structural enforcement: score computation script rejects if delta >0.5 and count <3.

3. All tools in a category run identical benchmark tasks. No custom tasks per tool.
   Structural enforcement: benchmark task IDs are category-scoped.

4. Benchmark task changes require a 14-day public RFC + full category re-evaluation.

5. Confidence level [HIGH/MED/LOW] is shown on every score, always.
   Structural enforcement: API returns confidence alongside every score value.

6. Score history is permanently public. Append-only. Never deleted.

7. Every versus page carries a valid_until date. Expired pages show REVIEW PENDING banner.

## The Honest Test
Before publishing any versus page, ask:
- Would the losing tool's author consider this comparison fair?
- Is the "Neither when" bullet genuinely useful (not a throwaway)?
- Are all score differences explained, not just stated?
- Would you recommend this comparison to a developer you respect?

If any answer is NO, revise before publishing.
