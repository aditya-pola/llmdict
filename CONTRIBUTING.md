# Contributing a Card

This glossary is built from individual JSON files in the `cards/` directory. Each file is one glossary entry. To add or edit a term, you only need to touch one file.

---

## Quick Start

1. Fork the repo
2. Create `cards/your-term.json` (see schema below)
3. If your term needs a new category, add it to `cards/_categories.json`
4. Submit a PR — the build runs automatically on merge

---

## Card Schema

```json
{
  "id": "your-term",
  "name": "Your Term",
  "expansion": "What the acronym expands to (or a short subtitle)",
  "category": "one-of-the-existing-categories",
  "oneliner": "80-160 chars. One sentence. Plain English.",
  "explanation": "300-480 chars. The walk-away text. See writing rules below.",
  "fundamentals": "150-800 chars. Where math and implementation details live.",
  "related": ["other-card-id", "another-card-id"],
  "seen_in": ["model-config", "model-name", "code", "documentation"],
  "foundational_papers": [
    {
      "title": "Full Paper Title",
      "authors": "First Author et al.",
      "venue": "Conference Year",
      "arxiv": "XXXX.XXXXX"
    }
  ],
  "resources": [
    {
      "label": "Descriptive link text",
      "url": "https://..."
    }
  ],
  "confidence": "high",
  "verified_date": "YYYY-MM-DD"
}
```

### Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Lowercase kebab-case. Must match filename (without `.json`). |
| `name` | Yes | Display name as it appears on the card. |
| `expansion` | Yes | Full expansion of an acronym, or a short subtitle. |
| `category` | Yes | Must exist in `cards/_categories.json`. |
| `oneliner` | Yes | 80-160 characters. |
| `explanation` | Yes | 300-480 characters. |
| `fundamentals` | Encouraged | For technical entries. Omit for orgs/tools/tags if not applicable. |
| `related` | Yes | At least 1 related card ID. Check that the IDs exist. |
| `resources` | Yes | At least 1 external link (GitHub, docs, HF page, blog post). |
| `foundational_papers` | When applicable | For techniques with a defining paper. Not needed for tools/orgs. |
| `confidence` | Yes | `"high"` or `"medium"`. |
| `verified_date` | Yes | Date you wrote or last verified the content. |

---

## Writing Rules

### The Explanation Field (card face)

This is the ONLY text most users will read. It must work standalone.

**The First Sentence Test:** Your very first sentence must answer "What is this?" in plain language that someone who has NEVER seen this term can understand.

**DO:**
- Write complete sentences in readable prose
- Start with: "[Name] is [what it is in plain language]."
- Use concrete numbers: "A 7B model at fp16 = 14 GB"
- Name real models: "Used in Llama 3, Mixtral, Qwen 2.5"
- State the key tradeoff: "Faster but requires more memory"
- Keep between 300-480 characters

**DON'T:**
- Use LaTeX or math notation — save that for `fundamentals`
- Use compressed note syntax — "B init to 0" should be "B is initialized to zero"
- Open with a paper citation — "Introduced by X (2023)" as a first sentence is banned
- Open with what OTHER things are — "DPO needs paired data. KTO doesn't." should be "KTO is [what it is]."
- List 3+ technique names without first explaining the concept
- Assume the reader saw the oneliner
- Exceed 480 characters

**Template for technical concepts:**
```
[Name] is [what it is — one plain sentence].
[Why it exists / what problem it solves].
[How it works in plain English — no formulas].
[Key tradeoff or where you see it: specific models or tools].
```

**Template for tools / organizations:**
```
[Name] is [what it is and who makes it].
[Its role in the ecosystem / what it's known for].
[Key differentiator vs alternatives].
[Practical detail: formats, use case, adoption].
```

**Template for naming tags:**
```
[What the tag means when you see it in a model name].
[What it implies about the model's training or capabilities].
[Naming variants across families with examples].
[Common confusion or things to watch for].
```

### The Fundamentals Field (expanded view)

This is where technical depth lives. LaTeX is welcome (`$...$` for inline, `$$...$$` for display). Include:
- Formulas, loss functions, bit layouts
- Tensor shapes with concrete dimensions
- Algorithm steps
- Memory/compute calculations

### The Oneliner Field (search results)

- One sentence, 80-160 characters
- Plain English, no LaTeX
- Answers "What is this?" at a glance

### The Related Field

- Include every card ID that your explanation mentions by name
- Include conceptual neighbors (alternatives, prerequisites, components)
- Check that every ID you list actually exists as a card file
- The linkification system will automatically make mentioned terms clickable

---

## Categories

Categories are defined in `cards/_categories.json`. Each has:
- `label`: display name
- `order`: sort order (lower = appears first)

### Existing Categories

| ID | Label | What goes here |
|----|-------|---------------|
| `precision-formats` | Precision Formats | fp32, fp16, bf16, fp8, int8, int4, nf4, E2M1 |
| `quantization-basics` | Quantization Basics | Core concepts: what quantization is, calibration, PTQ vs QAT |
| `quantization-methods` | Quantization Methods | Specific methods: GPTQ, AWQ, EXL2, etc. |
| `formats` | Formats | File formats: GGUF, safetensors, ONNX, K-quants, IQ-quants |
| `attention-variants` | Attention & Memory | MHA, GQA, MLA, Flash Attention, KV cache, PagedAttention |
| `position-encodings` | Position Encodings | RoPE, ALiBi, YaRN, NTK, sinusoidal, learned |
| `layer-types` | Layer Types | FFN, SwiGLU, model head, backbone, seq2seq |
| `scaling-patterns` | Scaling & Serving | MoE, inference, speculative decoding, TP/PP, ZeRO |
| `training-pipeline` | Training Pipeline | Pre-training, SFT, RLHF, DPO, ORPO, KTO |
| `fine-tuning-methods` | Fine-Tuning Methods | LoRA, QLoRA, DoRA, IA3, PEFT, full fine-tuning |
| `model-naming` | Model Naming | Size conventions, training tags, capability tags |
| `hf-organizations` | HF Organizations | Meta, Mistral, Qwen, Google, community quantizers |
| `serving-tools` | Serving Tools | vLLM, TGI, llama.cpp, Ollama, LM Studio |
| `tokenizers` | Tokenizers | BPE, SentencePiece, tiktoken, WordPiece |
| `datasets-recipes` | Datasets & Recipes | Hermes, Dolphin, Platypus, UltraChat, etc. |

### Adding a New Category

If your term doesn't fit any existing category:

1. Edit `cards/_categories.json`
2. Add your category with a label and order number
3. Use the new category ID in your card's `category` field

The build script rejects unknown categories — you must add it to `_categories.json` first.

---

## Automated Checks

The build script (`build.py`) validates:
- Every card has an `id` field
- Every card's `category` exists in `_categories.json`
- Valid JSON syntax

The GitHub Action runs `build.py` on every push to `main` that touches `cards/`. If it fails, the merge is blocked.

---

## Quality Checklist

Before submitting, verify:

- [ ] `id` matches the filename (without `.json`)
- [ ] First sentence of `explanation` answers "What is this?" in plain language
- [ ] `explanation` is 300-480 characters
- [ ] No LaTeX (`$`) in `explanation` — move formulas to `fundamentals`
- [ ] No paper citations as the opening sentence
- [ ] `oneliner` is 80-160 characters
- [ ] At least 1 entry in `related` (and the IDs exist as card files)
- [ ] At least 1 entry in `resources` with a working URL
- [ ] `category` exists in `_categories.json`
- [ ] `verified_date` is set to today's date
