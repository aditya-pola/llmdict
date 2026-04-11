#!/usr/bin/env python3
"""
Build glossary.json from individual card files in cards/
Run automatically by GitHub Action on push to main.

Categories are defined in cards/_categories.json.
To add a new category, edit that file.
"""
import json, os, sys

CARDS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cards')
CATEGORIES_FILE = os.path.join(CARDS_DIR, '_categories.json')
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'docs', 'data', 'glossary.json')

def build():
    # Load categories
    with open(CATEGORIES_FILE) as f:
        cat_defs = json.load(f)

    entries = {}
    categories = {cid: {'id': cid, 'label': c['label'], 'order': c['order'], 'entries': []}
                  for cid, c in cat_defs.items()}
    errors = []

    for fname in sorted(os.listdir(CARDS_DIR)):
        if not fname.endswith('.json') or fname.startswith('_'):
            continue
        fpath = os.path.join(CARDS_DIR, fname)
        try:
            with open(fpath) as f:
                card = json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f'{fname}: invalid JSON — {e}')
            continue

        eid = card.get('id')
        if not eid:
            errors.append(f'{fname}: missing "id" field')
            continue

        cat = card.get('category', '')
        if cat not in cat_defs:
            errors.append(f'{fname}: unknown category "{cat}" — add it to cards/_categories.json first')
            continue

        categories[cat]['entries'].append(eid)
        entries[eid] = card

    if errors:
        print(f'BUILD ERRORS ({len(errors)}):')
        for e in errors:
            print(f'  {e}')
        sys.exit(1)

    # Remove empty categories, sort by order
    sorted_cats = sorted(
        [c for c in categories.values() if c['entries']],
        key=lambda c: c['order']
    )

    output = {'categories': sorted_cats, 'entries': entries}

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f'Built {OUTPUT}: {len(entries)} cards, {len(sorted_cats)} categories')

    # Update README badge counts
    readme_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'README.md')
    if os.path.exists(readme_path):
        import re
        with open(readme_path) as f:
            readme = f.read()
        # Replace "N terms" and "N cards" patterns
        readme = re.sub(r'\b\d+ terms\b', f'{len(entries)} terms', readme, count=1)
        readme = re.sub(r'\b\d+ cards across\b', f'{len(entries)} cards across', readme, count=1)
        with open(readme_path, 'w') as f:
            f.write(readme)
        print(f'Updated README.md counts to {len(entries)}')

if __name__ == '__main__':
    build()
