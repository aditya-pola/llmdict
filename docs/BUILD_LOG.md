# Build Log

Chronological record of what was done, what was verified, and what changed.

---

## 2026-04-10 — Project kickoff

### Session 1: Gemma 4 / Unsloth glossary

**What happened:**
- Started from `research.md` containing 28 Unsloth Gemma 4 repos and a draft glossary
- Fact-checked all terms against primary sources (Google model cards, llama.cpp repo, Unsloth blog)
- Created `docs/glossary.md` with verified definitions
- Removed `research.md` (all content migrated)

**Corrections made:**
| Term | Was | Now | Source |
|------|-----|-----|--------|
| GGUF | "GPT-Generated Unified Format" | **GGML Universal File** | gguf-py README |
| Q-prefix | "K-means quantization" | **K-quant block quantization** | llama.cpp PR #1684 |
| IQ-prefix | "integer quantization" | **Importance-weighted quantization** (codebooks) | llama.cpp docs |
| MXFP4 | "Mixed-precision FP4" | **Microscaling FP4** (OCP standard) | OCP spec |
| UD KL claim | "~7.5% reduction" | 7.5% is Q2_K_XL-specific; broad range 10-30% | Unsloth blog |
| Video support | Not mentioned | All 4 variants support video (≤60s @ 1fps) | Google model cards |

**Confirmed correct:** E=Effective, A=Active, all param counts, modality matrix, context lengths.

### Session 1 continued: Scope expansion

**What happened:**
- Surveyed ~100+ additional terms across the broader LLM ecosystem
- Organized into 5 phases for incremental research + verification
- Created PLAN.md and BUILD_LOG.md
- Existing `glossary.md` preserved as Phase 0 reference (Gemma-specific)

**Next step:** Phase 1 — Quantization & Precision (research + verification + data entry)

---

## 2026-04-10 — Phase 1: Quantization & Precision

### Research

**What happened:**
- Launched two parallel research agents:
  1. **Fundamentals agent** — precision formats (fp32, fp16, bf16, fp8, int8, int4, nf4, E2M1) and core concepts (quantization operation, W4A16/W8A8, calibration, granularity, dynamic/static, PTQ/QAT, dequantization, size↔memory)
  2. **Methods agent** — quantization methods (GPTQ, AWQ, EXL2, bnb, HQQ, AQLM, QuIP#, EETQ, Quanto, Marlin, imatrix, UD, SpinQuant, QAT-Google) and file formats (GGUF, safetensors, GGML) and GGUF sub-types (K-quants, IQ-quants, UD-prefix, MXFP4_MOE)

**Raw research saved to:**
- `docs/data/phase1_fundamentals_raw.md` (665 lines, 55K chars)
- `docs/data/phase1_methods_raw.md` (736 lines, 63K chars)

### Data entry

**What happened:**
- Converted all verified research into structured JSON: `docs/data/phase1_quantization.json`
- **36 entries** across 5 subcategories:
  - precision-formats (8): fp32, fp16, bf16, fp8, int8, int4, nf4, E2M1
  - core-concepts (9): quantization, W4A16, W8A8, calibration, per-group, PTQ, QAT, dequantization, size↔memory
  - quantization-methods (14): GPTQ, AWQ, EXL2, bnb, HQQ, AQLM, QuIP#, EETQ, Quanto, Marlin, imatrix, UD, SpinQuant
  - file-formats (3): GGUF, safetensors, GGML
  - gguf-quantization (3): K-quants, IQ-quants, MXFP4_MOE

**All entries include:** id, name, expansion, category, oneliner, explanation, fundamentals, seen_in, related, sources, confidence, verified_date.

### Quality notes
- All precision format entries include bit layouts, value formulas, and what-is-lost analysis
- All method entries include algorithmic fundamentals, where-seen-in, and inference stacks
- Sources traced to arxiv papers, official repos, and specs
- Confidence: 35 high, 1 medium (MXFP4_MOE — newer format, less documented)

**Next step:** Phase 2a — Attention Variants

---

## 2026-04-10 — Phase 2a: Attention Variants

**What happened:**
- Researched 9 attention-related terms with full depth (mechanics, tensor shapes, memory formulas, papers)
- Structured into `docs/data/phase2a_attention.json`

**Entries (9):**
MHA, MQA, GQA, MLA, SWA, SDPA, Flash Attention (FA/FA2/FA3), KV Cache, PagedAttention

**Key content highlights:**
- Concrete tensor shape examples (hidden_dim=4096, n_heads=32, head_dim=128)
- KV cache memory formulas with real numbers for Llama 2 7B/70B, Mistral 7B, Falcon 40B
- Cross-reference table: which variants reduce cache/compute/require training changes
- Flash Attention: IO complexity analysis, version comparison table (FA1/FA2/FA3 TFLOPS)
- PagedAttention: fragmentation analysis with concrete throughput comparison

**All 9 entries high confidence, sourced to original papers.**

**Next step:** Phase 2b — Position Encodings

---

## 2026-04-10 — Phase 2b: Position Encodings

**What happened:**
- Researched 8 position encoding terms with full math (rotation matrices, frequency formulas, scaling equations)
- Structured into `docs/data/phase2b_position_encodings.json`

**Entries (8):**
RoPE, ALiBi, NTK-aware RoPE Scaling, YaRN, ABF, Position Interpolation (PI), Sinusoidal PE, Learned PE

**Key content highlights:**
- RoPE: full rotation matrix, complex number form, theta formula, wavelength analysis
- Context extension methods compared: PI vs NTK vs YaRN vs ABF — what each preserves/damages
- ABF concrete numbers: LLaMA 3 (500K), Qwen2 (1M), Code Llama (1M)
- Summary comparison table: year, type, params, length limit, extrapolation behavior, key models
- HuggingFace config field mappings for each method

**All 8 entries high confidence.**

**Next step:** Phase 2c — Layer Types & Norms

---

## 2026-04-10 — Phase 2c: Layer Types & Norms

**What happened:**
- Researched 8 layer/norm/activation terms with full formulas and concrete dimension examples
- Structured into `docs/data/phase2c_layers_norms.json`

**Entries (8):**
FFN/MLP, SwiGLU, GeGLU, RMSNorm, LayerNorm, Pre-Norm vs Post-Norm, PLE (Per-Layer Embeddings), Residual Connection

**Key content highlights:**
- FFN param count breakdown: 67% of layer params in gated variants, with LLaMA 7B concrete numbers
- SwiGLU: full three-matrix formulation, the "2/3 of 4x" rule for d_ff
- RMSNorm vs LayerNorm: formula comparison, what's removed, computational savings
- Pre-Norm timeline: Post-Norm (2017) → Pre-Norm+LN (2019) → Pre-Norm+RMSNorm (2023+)
- PLE: Gemma-specific, explains total vs effective parameter gap
- Residual connection: gradient flow math showing why it prevents vanishing gradients

**All 8 entries high confidence.**

**Next step:** Phase 2d — Scaling Patterns

---

## 2026-04-10 — Phase 2d: Scaling Patterns

**What happened:**
- Researched 8 scaling/inference terms with concrete model configs and algorithm details
- Structured into `docs/data/phase2d_scaling.json`

**Entries (8):**
MoE, Dense Models, Knowledge Distillation, Speculative Decoding, Expert Routing/Gating, Continuous Batching, TP vs PP, Model Merging

**Key content highlights:**
- MoE: real param counts for Mixtral 8x7B (46.7B/12.9B), DeepSeek-V3 (671B/37B), routing math
- Speculative decoding: full rejection sampling algorithm, expected tokens formula, acceptance rate math
- Expert routing: top-k gating, DeepSeek shared+routed design, bias-based load balancing
- TP vs PP: column-parallel/row-parallel mechanics, bubble fraction formula, when-to-use guide
- Model merging: SLERP, TIES (trim/elect/merge), DARE (drop/rescale) algorithms

**All 8 entries high confidence.**

**Phase 2 complete.** Next: Phase 3 — Training & Alignment

---

## 2026-04-10 — Phase 3: Training & Alignment + Fine-Tuning Methods

**What happened:**
- Two parallel research agents: training pipeline (8 terms) + fine-tuning methods (7 terms)
- Combined into single file: `docs/data/phase3_training_finetuning.json`
- **New field: `foundational_papers`** — structured citations with title, authors, venue, arxiv ID

**Entries (15):**
- Training pipeline (8): Pre-training, CPT, SFT, RLHF, DPO, ORPO, KTO, SimPO
- Fine-tuning methods (7): LoRA, QLoRA, DoRA, IA3, PEFT, Full Fine-Tuning, Adapters

**Foundational papers: 40 citations** including:
- Vaswani 2017 (Transformer), Brown 2020 (GPT-3), Hoffmann 2022 (Chinchilla)
- Ouyang 2022 (InstructGPT), Christiano 2017 (RLHF origins), Schulman 2017 (PPO)
- Rafailov 2023 (DPO), Hu 2022 (LoRA), Dettmers 2023 (QLoRA)
- Kahneman & Tversky 1979 (prospect theory — KTO's foundation)

**Key content highlights:**
- Full training pipeline: pre-training → CPT → SFT → alignment (RLHF/DPO/ORPO/KTO/SimPO)
- Compute cost progression table: pre-training (100%) → SFT (0.1%) → RLHF (5-20%) → DPO (1-5%)
- Models-in-memory comparison: RLHF=4, DPO=2, ORPO=1, SimPO=1
- LoRA concrete params: LLaMA 7B r=16 all-linear = 40M (0.6%), memory 14.8GB vs 84GB full FT
- QLoRA memory breakdown: 65B model fits in 40-44GB via NF4+double quant

**All 15 entries high confidence. Model merging (SLERP/TIES/DARE) already covered in Phase 2d — no duplication.**

**Next step:** Phase 4 — Model Families & Naming

---

## 2026-04-10 — Phases 4 & 5: Naming Conventions + Ecosystem (parallel)

**What happened:**
- Two parallel subagents: Phase 4 (naming conventions) + Phase 5 (ecosystem/infrastructure)
- Phase 4: `docs/data/phase4_naming.json` — 23 entries
- Phase 5: `docs/data/phase5_ecosystem.json` — 34 entries
- 14 foundational paper citations across both

**Phase 4 entries (23) — Model Naming:**
- Size conventions (6): B, T, A, E, K/M, x
- Training tags (4): -base/-pt, -it/-instruct/-chat, alignment tags, -hf
- Capability tags (7): -Coder, -VL/-Vision, -Math, -Embed, -Guard, -MRL, -Reward
- Scale/family/adapter tags (6): scale variants, Scout/Maverick, -MoE, -Long, -merged/-unmerged, -ft/-lora

**Phase 5 entries (34) — Ecosystem:**
- HF organizations (12): 5 quantizers (TheBloke, bartowski, turboderp, mlx-community, Mradermacher) + 7 model creators (Meta, Mistral, Qwen, Google, DeepSeek, Microsoft, NousResearch)
- Serving tools (8): vLLM, TGI, llama.cpp, Ollama, LM Studio, ExLlamaV2, TensorRT-LLM, SGLang
- Export formats (4): ONNX, CoreML, OpenVINO, CTranslate2
- Tokenizers (4): BPE, SentencePiece, tiktoken, WordPiece
- Datasets/recipes (6): Hermes, Dolphin, Platypus, EvolInstruct, Orca, UltraChat/UltraFeedback

**Phases 1-5 complete. Data collection finished.**

**Next step:** Phase 6 — UI Build

---

## 2026-04-10 — Papers & Resources Backfill

**What happened:**
- Audited all 141 entries for external links (papers, repos, docs, specs)
- Backfilled `foundational_papers` field into Phases 1, 2a-2d (56 citations added)
- Backfilled `resources` field (URLs to repos, blog posts, HF profiles, specs) into 61 entries (75 links)
- Final audit: zero entries without at least one external link

**Totals after backfill:** 141 entries, 110 paper citations, 75 resource links.

---

## 2026-04-11 — Phase 6: UI Build (v1)

### Design decisions (docs/ui/DECISIONS.md)
- Horizontal card carousel ("the cabinet") — centered row of cards, not full-width
- Card hierarchy: Home → Category cards → Term cards, interleaved in logical order
- Card content: "walk away" explanation + click-to-expand overlay for depth
- Inline linked terms in all card text (clickable, scrolls carousel)
- History reel underneath, graph view as separate page
- Visual: minimalist-reference-inspired (black cards, white page, Inter 500, tight tracking)

### minimalist-reference source analysis (docs/ui/UI_FINDINGS.md)
- Downloaded and analyzed full site source (HTML inline styles + file.js)
- Extracted exact CSS values: card shadow, typography scale, color palette, animations
- Documented 8 high-priority patterns: spring pop-in, button feedback, text color scale, hover gating, touch swipe, transition debounce

### Site built (site/)
```
site/
├── index.html          # Main carousel page (KaTeX loaded for math)
├── graph.html          # Force-directed graph view with overlay on node click
├── css/style.css       # Full design system
├── js/
│   ├── data.js         # Data loading, search, relationship mapping
│   ├── cards.js        # Card rendering, linkification, overlay content, math rendering
│   ├── carousel.js     # Horizontal scroll, edge hover, mousewheel, touch swipe, pop-in
│   ├── history.js      # History reel tracking
│   ├── search.js       # Instant fuzzy search dropdown (Cmd+K)
│   └── app.js          # Main wiring, event delegation, navigation, hash routing
└── data/
    └── glossary.json   # Merged: 142 entries, 23 categories
```

### New entry added
- **Inference Engine** — added to Phase 2d (scaling-patterns), with 3 foundational papers and 4 resource links. Total now 142 entries.

### Key implementation details
- Cards: black (#000) on white page, border-radius 16px, minimalist-reference double-layer shadow
- Category cards: inverted (white card, dark text) to signal navigation vs content
- Pop-in: spring animation via `cubic-bezier(0.34, 1.56, 0.64, 1)`, scale + rotate
- Typography: Inter weight 500 everywhere, Playfair Display 700 for dictionary headwords, letter-spacing = size × -0.02
- Hover gated with `@media (hover: hover)` to prevent ghost hover on touch
- Mousewheel → horizontal scroll (listener on document)
- Edge hover zones (100px) with rAF-based auto-scroll
- Smooth scroll-to-card via JS rAF with cubic ease-out (not CSS scroll-behavior)
- KaTeX loaded from CDN for inline $...$ and display $$...$$ math
- Graph: canvas-based force-directed, pan/zoom, node click → overlay (no redirect)

### Issues fixed
- Removed `scroll-snap-type: x mandatory` — was fighting manual scrollLeft changes
- Removed `scroll-behavior: smooth` from CSS — moved to JS for programmatic scrolls only
- Card hover: clear animation after pop-in so CSS transition takes over
- Overlay: renders math on open via Cards.renderMath()

### Current status
- Serving locally at http://localhost:8891
- Edge hover scroll and mousewheel scroll fixed (scroll-snap removed)
- Ready for GitHub Pages deployment after further iteration
