# Diff-scoped validation

Design note for a future optimisation. Not implemented; not needed at
current scale (260 cards, validator runs in <1 s).

## Motivation

At 5,000+ cards, or if a single validation check ever becomes expensive
(e.g., per-card language-model grading), running `validate.py` across
the whole `cards/` directory on every PR becomes wasteful. The work
rises linearly with corpus size while the useful information in a PR
is bounded by the number of files it touched. The same is true for
reviewer feedback: a log listing 40 warnings drowns out the one that
actually belongs to the changed file.

Rough threshold: revisit this if validation takes >5 s, or if the
corpus exceeds ~2,000 cards, or if a new check makes any single file's
validation meaningfully expensive.

## What can be diff-scoped

Per-file checks — each only looks at one JSON file:

- Valid JSON
- Required fields (`id`, `name`, `category`, `oneliner`, `explanation`)
- `id` matches filename
- Oneliner length (40 / 80 / 160 / 200)
- Explanation length (150 / 300 / 480 / 500)
- No LaTeX `$` in explanation
- First-sentence "not a paper citation" check
- Resource URL shape (`http` / `https` prefix, both `url` and `label` present)
- `confidence` is `high` or `medium`
- `verified_date` matches `YYYY-MM-DD`

## What must stay global

Consistency invariants — one card's validity depends on the rest of
the corpus:

- `related` link targets exist (a deleted or renamed card elsewhere
  breaks any card referencing it)
- `category` exists in `_categories.json` (editing that file
  invalidates every card using the removed category)
- No duplicate `id`s across the corpus (a new card could clash with an
  untouched one)
- Connectivity suggestions (the heuristic that surfaces missed
  cross-references needs a full name → id map)

**Implication:** you cannot actually skip the global pass. The best
you can do is run per-file checks only on the files the PR touched
and still run the global-invariant pass on the whole corpus.

## Suggested architecture

Split `validate.py` into three phases:

```python
def validate(focus_files=None):
    all_cards = load_all_cards()
    global_errors = check_global_invariants(all_cards)

    if focus_files:
        per_file_targets = [f for f in focus_files if is_card(f)]
    else:
        per_file_targets = all_card_files()

    per_file_errors = [check_per_file(f, all_cards) for f in per_file_targets]

    # Fail if any global error, or any per-file error in the focus set
    return global_errors, per_file_errors
```

CLI:

```
python3 validate.py                               # whole corpus (default)
python3 validate.py --focus cards/a.json b.json   # focused mode
```

### Trickier design decisions

- **Errors in files outside the focus set** (pre-existing issues on
  `main`): surface as warnings, not hard fails. Otherwise a PR adding
  one card can be blocked by an unrelated length issue that existed
  before. In practice these are rare if branch protections are
  enabled (see below), but the defensive stance keeps the system
  robust.
- **Deletions**: a deleted card can't be validated per-file, but its
  removal might break `related` pointers from other cards. The global
  invariant pass handles this if you rebuild `all_ids` from the
  post-merge state (which `git checkout <pr-head>` gives you).
- **`_categories.json` changed**: force whole-corpus mode. Any
  category add/remove invalidates the category check on every card.
- **`validate.py` or `build.py` changed**: force whole-corpus mode.
  The rules themselves are changing.
- **Renamed files**: git diff may report them as `R`; treat as new.

## Workflow changes

`.github/workflows/validate-cards.yml`:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0   # need base commit for diff
- uses: tj-actions/changed-files@v45
  id: changed
  with:
    files: |
      cards/*.json
- name: Validate
  run: |
    CHANGED="${{ steps.changed.outputs.all_changed_files }}"
    # Force whole-corpus if schema-relevant files changed
    if git diff --name-only origin/main...HEAD | \
         grep -qE '^(cards/_categories\.json|validate\.py|build\.py)$'; then
      python3 validate.py
    elif [ -n "$CHANGED" ]; then
      python3 validate.py --focus $CHANGED
    else
      python3 validate.py
    fi
```

## Related: why pre-existing errors can exist on main

Even with CI gating every PR, `main` can briefly or persistently drift
into a partially-invalid state through:

1. **Validator evolution.** Adding a new check instantly invalidates
   every existing card that violates it.
2. **Schema migrations.** A new required field invalidates every card
   not yet migrated.
3. **Warnings promoted to errors.** Same dynamic as (1).
4. **Admin bypass / direct pushes.** `git push` to `main` skips PR
   checks unless branch protections explicitly block it.
5. **Rule drift.** Editing `_categories.json` in one PR can strand
   cards that reference the changed-or-removed category if the two
   aren't landed together.

For this project, most of these are closed by turning on GitHub's
branch-protection rules on `main`:

- **Require status checks to pass before merging** (gate on
  `validate` workflow)
- **Require branches to be up to date before merging**
- **Restrict who can push to matching branches** (kill direct pushes)
- **Do not allow bypassing the above settings**

With that in place, the only residual case is validator evolution (1)
— a one-time cleanup cost when rules change, not a recurring tax.

## Alternative worth considering first

Instead of the full refactor, add a PR-comment-summary that highlights
errors in the files the PR touched, while keeping whole-corpus
validation unchanged:

```python
# after validation finishes
if focus_files:
    focused = [e for e in errors if e.file in focus_files]
    others = [e for e in errors if e.file not in focus_files]
    print(f"ERRORS IN YOUR FILES ({len(focused)}):")
    ...
    print(f"PRE-EXISTING ELSEWHERE ({len(others)}):")
    ...
```

Same validation surface, much better feedback clarity. About 30 min
of work, and buys most of the real developer-experience value of the
full refactor.

## Estimated effort for the full refactor

- Changed-files detection in workflow: 10 min
- `validate.py` split into global / per-file / focus CLI: 1 h
- Deletion + renames + schema-change edge cases: 30 min
- Workflow updates and docs (`CONTRIBUTING.md`): 15 min
- Test fixtures and a small test harness: 45 min

Total: about 2.5 hours of focused work. Revisit when the corpus or
the per-card check cost justifies it.
