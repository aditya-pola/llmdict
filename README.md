# LLM Dictionary

![](docs/hero.gif)

A living dictionary of the language that has grown up around large language models and the work of training, adapting, and serving them. The intent is for it to be maintained over a long horizon, with a contribution path quiet enough that fixing or adding an entry is roughly the work of writing the entry down.

See [PHILOSOPHY.md](PHILOSOPHY.md) for the full intent.

<https://aditya-pola.github.io/llmdict>

## What's Inside

254 cards across 20 categories:

| Category | Cards | Examples |
|----------|-------|---------|
| Precision Formats | 8 | fp16, bf16, fp8, int4, nf4 |
| Quantization | 26 | GPTQ, AWQ, EXL2, SmoothQuant, PTQ, QAT |
| Formats | 10 | GGUF, safetensors, ONNX, K-quants |
| Attention & Memory | 13 | MHA, GQA, MLA, Flash Attention, KV cache, PagedAttention |
| Position Encodings | 8 | RoPE, ALiBi, YaRN, NTK |
| Layer Types | 17 | FFN, SwiGLU, ViT, Mamba, diffusion models |
| Sampling & Decoding | 7 | temperature, top-p, top-k, structured output |
| Scaling & Serving | 36 | MoE, inference, speculative decoding, RAG, benchmarks |
| Training Pipeline | 17 | pre-training, SFT, RLHF, DPO, GRPO, scaling laws |
| Fine-Tuning | 8 | LoRA, QLoRA, DoRA, PEFT |
| Safety & Alignment | 6 | hallucination, prompt injection, constitutional AI |
| Prompting | 4 | prompt engineering, system prompt, few-shot, zero-shot |
| Embeddings & Retrieval | 3 | embeddings, vector databases, FAISS |
| Model Naming | 25 | B/T/A/E size conventions, -instruct, -Coder, chat templates |
| HF Organizations | 13 | Meta, Mistral, Qwen, Google, DeepSeek |
| Serving Tools | 20 | vLLM, TGI, llama.cpp, Ollama, Triton, Ray |
| Tokenizers | 4 | BPE, SentencePiece, tiktoken |
| Datasets & Recipes | 9 | Hermes, Dolphin, synthetic data, data mixing |
| Agents & Tool Use | 8 | agentic AI, function calling, MCP, DSPy, ReAct |

## Features

- Stacked card interface with inertia scroll and tilt physics
- Click any card to expand for deeper content (fundamentals, formulas, papers)
- Inline linked terms — click to navigate between cards
- Search (Cmd+K or S key)
- Graph view showing all 254 terms as connected nodes
- History mode to review visited cards
- KaTeX rendering for mathematical notation
- Keyboard shortcuts (press ? to see all)
- 170+ resource links to Raschka, Alammar, Weng, Wolfe, Karpathy, 3B1B, HuggingFace docs

## Contributing

Contributions are warmly welcome. A pull request that adds a single JSON file under `cards/` is the whole workflow. Validation runs automatically and reports what to adjust. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide, schema, writing rubric, and quality checklist.

```
cards/
├── _categories.json    # category definitions
├── your-new-term.json  # one file per card
├── ...254 card files
```

A GitHub Action automatically rebuilds the site when cards are added or edited.

## Tech Stack

- Vanilla HTML/CSS/JS (no build step, no framework)
- Card data stored as individual JSON files
- KaTeX for math rendering
- Canvas-based force-directed graph
- Deployable on GitHub Pages

## License

This repository is dual-licensed:

- **Dictionary content** (every JSON file under `cards/`, the generated `docs/data/glossary.json`, and the prose in `PHILOSOPHY.md`) is licensed under **[Creative Commons Attribution-ShareAlike 4.0](LICENSE-CONTENT)**. Reuse and adapt freely; credit *LLM Dictionary* and share derivative content under the same license.
- **Engine and tooling** (the contents of `docs/`, the build and validation scripts, anything under `scripts/`) is licensed under the **[MIT License](LICENSE-CODE)**. Reuse freely with attribution.

