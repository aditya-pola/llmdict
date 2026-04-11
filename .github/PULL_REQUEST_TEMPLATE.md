## What does this PR do?
<!-- Briefly describe what cards you added/edited and why -->


## Checklist

### For new cards
- [ ] Card file is in `cards/` with filename matching the `id` field
- [ ] `id` is lowercase kebab-case
- [ ] `category` exists in `cards/_categories.json`
- [ ] `oneliner` is 80-160 characters (ideal), 40-200 allowed (automated check)
- [ ] `explanation` is 300-480 characters (ideal), 150-500 allowed (automated check)
- [ ] `explanation` starts with a plain-language "what is this" sentence (automated check)
- [ ] No LaTeX (`$`) in `explanation` — formulas go in `fundamentals` only (automated check)
- [ ] `related` contains only existing card IDs (automated check)
- [ ] `resources` contains at least 1 external link with `url` and `label`
- [ ] `verified_date` is set to today in YYYY-MM-DD format
- [ ] I have read the [Contributing Guide](../CONTRIBUTING.md)

> **Automated checks run on every PR.** The PR will fail if any card has invalid JSON, unknown categories, broken related links, wrong field lengths, or LaTeX in the explanation.

### For card edits
- [ ] Changes follow the [quality rubric](../CONTRIBUTING.md#writing-rules)
- [ ] No broken `related` links introduced

### For new categories
- [ ] Added to `cards/_categories.json` with label and order
- [ ] At least one card uses the new category
