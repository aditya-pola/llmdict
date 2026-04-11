# UI/UX Ideas & Inspiration

Collecting ideas for the glossary interface before committing to a direction.

---

## Interaction Patterns Worth Considering

### "Decode a Model Name"
A text input where you paste a HuggingFace model name like:
```
unsloth/gemma-4-26B-A4B-it-GGUF
```
And it breaks it apart visually:
```
[unsloth/]  [gemma-4]  [-26B]  [-A4B]  [-it]  [-GGUF]
   org       family     size   active  instruct  format
```
Each segment is clickable → takes you to its glossary entry.

### "What Should I Use?" Decision Trees
Interactive flowcharts:
- "Which quantization format?" → asks about hardware, use case → recommends
- "Which serving tool?" → asks about GPU, scale, features → recommends
- "LoRA vs QLoRA vs full FT?" → asks about GPU memory, data size → recommends

### Progressive Depth Cards
Each term is a card:
- **Collapsed**: name + one-liner (fits in a list/grid view)
- **Click once**: expansion + explanation (the "I want to understand" level)
- **Click deeper**: fundamentals + math (the "I want to implement" level)
- **Papers tab**: citations + resource links (the "I want to read more" level)

### Relationship Explorer
- Click any term → its `related` terms light up
- Optional: force-directed graph showing the full 141-entry relationship network
- Color-coded by category

### Smart Search
- Fuzzy search across all fields (name, expansion, explanation)
- Filter chips: by category, by phase, by "has paper"
- Search results show one-liner previews

---

## Technology Options

| Option | Pros | Cons |
|--------|------|------|
| **Single HTML + vanilla JS** | Zero dependencies, offline, portable | Manual work, limited interactivity |
| **Svelte/SvelteKit** | Small bundle, fast, good DX | Build step, more complex |
| **React + Vite** | Ecosystem, components | Heavier bundle |
| **MkDocs Material** | Markdown-native, search built-in, beautiful | Less custom interactivity |
| **Docusaurus** | React-based docs, search, versioning | Heavier, more opinionated |
| **Astro** | Static-first, island architecture, fast | Newer, smaller ecosystem |

---

## Reference Sites (for inspiration)
- https://ml-glossary.readthedocs.io/ — ML glossary (simple, searchable)
- https://developers.google.com/machine-learning/glossary — Google ML glossary
- https://explainpaper.com/ — paper explanations with progressive depth
- https://jalammar.github.io/ — visual ML explanations (Jay Alammar)
- Obsidian-style knowledge graphs — linked notes with graph view
