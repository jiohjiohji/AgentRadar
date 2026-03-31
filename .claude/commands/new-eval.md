# /new-eval command
# Usage: /new-eval [tool-id]
# Processes a community evaluation and creates a validated eval record

1. Load the eval-report skill
2. Ask for the evaluation details if not provided
3. Check conflict of interest before processing
4. Generate the evaluation YAML using the skill
5. Run validation: python scripts/validate_evaluation.py
6. Trigger score recomputation: python scripts/compute_scores.py [tool-id]
7. Report: PASS with file path, or FAIL with specific errors
