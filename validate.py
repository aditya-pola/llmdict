#!/usr/bin/env python3
"""
Validate all card files against the quality rubric.
Run by GitHub Action on every PR touching cards/.
Exit code 1 if any card fails validation.
"""
import json, os, sys, re

CARDS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cards')
CATEGORIES_FILE = os.path.join(CARDS_DIR, '_categories.json')

def validate():
    with open(CATEGORIES_FILE) as f:
        valid_categories = set(json.load(f).keys())

    # Collect all card IDs first (for related link validation)
    all_ids = set()
    for fname in os.listdir(CARDS_DIR):
        if fname.endswith('.json') and not fname.startswith('_'):
            all_ids.add(fname[:-5])

    errors = []
    warnings = []
    cards_checked = 0

    for fname in sorted(os.listdir(CARDS_DIR)):
        if not fname.endswith('.json') or fname.startswith('_'):
            continue

        fpath = os.path.join(CARDS_DIR, fname)
        card_id = fname[:-5]
        cards_checked += 1

        # Parse JSON
        try:
            with open(fpath) as f:
                card = json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f'{fname}: Invalid JSON — {e}')
            continue

        # --- Required fields ---
        for field in ['id', 'name', 'expansion', 'category', 'oneliner', 'explanation']:
            if not card.get(field):
                errors.append(f'{fname}: Missing required field "{field}"')

        # --- ID matches filename ---
        if card.get('id') and card['id'] != card_id:
            errors.append(f'{fname}: "id" is "{card["id"]}" but filename says "{card_id}"')

        # --- Category exists ---
        cat = card.get('category', '')
        if cat and cat not in valid_categories:
            errors.append(f'{fname}: Unknown category "{cat}" — add it to _categories.json first')

        # --- Oneliner length (80-160 target, 40-200 allowed) ---
        oneliner = card.get('oneliner', '')
        if len(oneliner) < 40:
            errors.append(f'{fname}: oneliner too short ({len(oneliner)} chars, min 40)')
        elif len(oneliner) > 200:
            errors.append(f'{fname}: oneliner too long ({len(oneliner)} chars, max 200)')
        elif len(oneliner) < 80 or len(oneliner) > 160:
            warnings.append(f'{fname}: oneliner is {len(oneliner)} chars (ideal: 80-160)')

        # --- Explanation length (300-480 target, 150-500 allowed) ---
        explanation = card.get('explanation', '')
        if len(explanation) < 150:
            errors.append(f'{fname}: explanation too short ({len(explanation)} chars, min 150)')
        elif len(explanation) > 500:
            errors.append(f'{fname}: explanation too long ({len(explanation)} chars, max 500)')
        elif len(explanation) < 300 or len(explanation) > 480:
            warnings.append(f'{fname}: explanation is {len(explanation)} chars (ideal: 300-480)')

        # --- No LaTeX in explanation ---
        if '$' in explanation:
            errors.append(f'{fname}: explanation contains LaTeX ($) — move formulas to fundamentals')

        # --- First sentence check ---
        if explanation:
            first_sentence = explanation.split('.')[0]
            if re.match(r'^(Introduced|Proposed|From|Designed) (by|in)', first_sentence):
                errors.append(f'{fname}: explanation opens with a paper citation — lead with what it IS')

        # --- Related links exist ---
        related = card.get('related', [])
        if not related:
            warnings.append(f'{fname}: no "related" entries — consider adding at least 1')
        for rid in related:
            if rid not in all_ids:
                errors.append(f'{fname}: related link "{rid}" does not exist as a card')

        # --- Resources ---
        resources = card.get('resources', [])
        if not resources:
            warnings.append(f'{fname}: no "resources" links — consider adding at least 1')
        for r in resources:
            if not r.get('url') or not r.get('label'):
                errors.append(f'{fname}: resource entry missing "url" or "label"')
            elif r['url'].startswith('http') is False and r['url'].startswith('//') is False:
                errors.append(f'{fname}: resource URL looks invalid: {r["url"]}')

        # --- Confidence ---
        conf = card.get('confidence', '')
        if conf and conf not in ('high', 'medium'):
            warnings.append(f'{fname}: confidence should be "high" or "medium", got "{conf}"')

        # --- Verified date format ---
        vdate = card.get('verified_date', '')
        if vdate and not re.match(r'^\d{4}-\d{2}-\d{2}$', vdate):
            warnings.append(f'{fname}: verified_date should be YYYY-MM-DD format, got "{vdate}"')

    # --- Connectivity check: do new/edited cards mention existing terms they should link to? ---
    # Load all cards for cross-referencing
    all_cards = {}
    for fname in sorted(os.listdir(CARDS_DIR)):
        if not fname.endswith('.json') or fname.startswith('_'): continue
        with open(os.path.join(CARDS_DIR, fname)) as f:
            try: all_cards[fname[:-5]] = json.load(f)
            except: pass

    # Build name→id lookup
    name_to_id = {}
    for cid, c in all_cards.items():
        name_lower = c.get('name', '').lower()
        if len(name_lower) >= 3:
            name_to_id[name_lower] = cid

    # For each card, check if explanation mentions other card names not in related
    for cid, c in all_cards.items():
        explanation = c.get('explanation', '')
        current_related = set(c.get('related', []))
        missing_links = []

        for name, target_id in name_to_id.items():
            if target_id == cid: continue
            if target_id in current_related: continue
            if len(name) < 4: continue  # skip very short names to avoid false positives
            # Case-insensitive word boundary match
            if re.search(r'\b' + re.escape(name) + r'\b', explanation, re.IGNORECASE):
                missing_links.append(target_id)

        if missing_links:
            warnings.append(f'{cid}.json: explanation mentions [{", ".join(missing_links[:5])}] but they are not in "related" — consider adding them')

    # --- Report ---
    print(f'Validated {cards_checked} cards\n')

    if warnings:
        print(f'WARNINGS ({len(warnings)}):')
        for w in warnings:
            print(f'  ⚠ {w}')
        print()

    if errors:
        print(f'ERRORS ({len(errors)}):')
        for e in errors:
            print(f'  ✗ {e}')
        print(f'\n{len(errors)} error(s) found. Fix them before merging.')
        sys.exit(1)
    else:
        print(f'✓ All {cards_checked} cards pass validation.')

if __name__ == '__main__':
    validate()
