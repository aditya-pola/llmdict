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

### UI iteration (2026-04-11)

**Stacked card view** (replaced carousel):
- One card visible at center, others peek from sides with vertical title labels
- Mousewheel/edge hover/touch swipe to navigate (velocity-based accumulator)
- Click peeking cards to jump, arrow keys supported
- Card tilt on scroll (rotateY based on velocity, perspective 1200px)
- Stacked cards branch created, iterated, merged to main

**Floating header + home FAB:**
- Dark pill header: fixed top-center, backdrop-blur, search expands on focus
- Home FAB: black circle with house icon, fixed bottom-right, always visible
- Home card renamed to "Home" with icon, inverted white scheme

**Expandable home/category cards:**
- Show 8-item preview with overflow hidden, "click to see all" hint
- Click opens light overlay (white bg) with full scrollable list
- Category/home overlays use inverted color scheme

**LaTeX rendering fixed:**
- Root cause: linkifyText was inserting <span> tags inside $...$ blocks, splitting delimiters across DOM nodes
- Fix: protect math blocks with placeholders before linkification, restore after
- Hand-wrote proper LaTeX for 11 math-heavy entries
- Auto-converted 112 fields from Unicode to $...$ delimiters

**History mode:**
- Toggle button (floating pill, bottom-center) switches stack to visited-only cards
- "Find in carousel" button on each card in history mode
- Exits history mode on any link click or home button

**Graph view rewrite:**
- Light theme (#fafafa bg, 23 category colors)
- Category hub nodes: donut-style, always-visible labels, cluster centers
- Home node fixed at center, categories radiate outward
- Three edge types: home→category, category→term, term↔term
- Hover: same-category brightens, others dim, direct edges thicken
- Click category node → overlay with term list
- Consistent floating search bar, category legend with click-to-pan
- Zoom toward cursor position

### UI polish (continued)
- Graph/glossary toggle: circle buttons beside header bar on both pages
- Both pages show "LLM Glossary" as header title
- Full LaTeX sweep: 0 remaining bare Unicode math outside $...$ blocks
- Fixed linkifyText breaking LaTeX (protect $...$ blocks with placeholders before linkification)
- KaTeX sized up: 1.15em on cards, 1.2em in overlays, color #ccc

---

## 2026-04-11 — Content Quality Plan + Data Architecture Migration

### Quality audit
- 33/142 entries had empty explanation fields (entire categories: orgs, tools, datasets, formats, tokenizers)
- Tone inconsistency: some entries are compressed notes, some dump LaTeX on card face, some are well-written prose
- Compared against HuggingFace glossary: identified 10 terms to add

### Quality rubric established (docs/ui/... in plan)
- oneliner: 80-160 chars, plain English, no LaTeX
- explanation: 200-500 chars, prose, no formulas, self-contained walk-away text
- fundamentals: where math lives (LaTeX welcome)
- Every entry must have at least 1 external resource link

### Data architecture: one file per card
```
cards/
├── _categories.json          # defines valid categories (label + order)
├── fp32.json                 # one card per file
├── gptq.json
├── ...142 files
build.py                      # merges cards/ → site/data/glossary.json
.github/workflows/build-glossary.yml  # auto-runs on push to main
```

**Contributor workflow**: add/edit one JSON file in cards/, submit PR. GitHub Action auto-rebuilds glossary.json on merge. If new category needed, also edit _categories.json.

Build script validates: all cards must have `id` and a category that exists in _categories.json. Unknown categories are rejected with an error.

### Phase A: Fill 33 empty explanations — DONE
All 33 previously-empty cards now have 200-500 char prose explanations:
- Serving Tools (8): vLLM, TGI, llama.cpp, Ollama, LM Studio, ExLlamaV2, TensorRT-LLM, SGLang
- HF Organizations (12): Meta, Mistral, Qwen, Google, DeepSeek, Microsoft, NousResearch, TheBloke, bartowski, turboderp, mlx-community, mradermacher
- Datasets & Recipes (6): Hermes, Dolphin, Platypus, EvolInstruct, Orca, UltraChat
- Export Formats (4): ONNX, CoreML, OpenVINO, CTranslate2
- Tokenizers (3): SentencePiece, tiktoken, WordPiece

### Current status
- 142 entries, 0 empty explanations
- One-file-per-card architecture in place
- **Remaining content phases**: B (move math from card face), C (rewrite compressed notes), D (enrich thin tags), E (add 10 new HF entries), F (consistency pass)

---

## 2026-04-12 — Site pages, identity assets, dual license

### Site pages added (cards to the left of Home)

Restructured the carousel so several "system" cards sit to the left of Home in the main stack. Final left-to-right order: **Visitors → Contributing → Philosophy → Usage → Home → categories → terms**. `HOME_INDEX = 4` in `docs/js/app.js`; the home button, the `H` shortcut, and the initial `goTo` all land on it.

- **Visitor Map card** (idx 0). Replaces the standalone globe button in the page header. Card face is minimal ("click to view"). Click anywhere on the card opens the existing ClustrMaps overlay. Removed `.globe-toggle` button + its mobile positioning rules entirely.
- **Contributing card** (idx 1). Face items: Fork → Add → Validate → PR → Merge → link to `CONTRIBUTING.md`. Click expands a longer overlay covering the JSON-per-term workflow and writing rules summary.
- **Philosophy card** (idx 3, between Contributing and Usage). New info card expressing the project's thesis. Face items: Living, Open, Accessible (one short clause each). Overlay has seven sections — *What this is*, *Why this exists*, *A living document*, *Open by design*, *Resists going stale*, *Built as a reference*, *An invitation*. Tone is mature/declarative, no marketing language. All em dashes removed (replaced with commas, periods, semicolons, or colons throughout the card and the rendering helper).
- **Usage card** (idx 2). Restructured so face items pair a label with the actual button icon (or kbd) instead of spatial language ("top-left", "top-right" all removed). Order: Home, Graph, Browse, Search, Expand, History, Shortcuts. History body is "click trail." Search body is `press S, type, Enter`. Shortcuts row points at the `?` key. Inline SVGs in titles for Home and Graph mirror the actual buttons.

`createInfoCard` helper in `docs/js/cards.js` was extended with an icon SVG slot in the title and a click handler bridge so info cards open their `dataset.infoOverlay` HTML in the same `openOverlayRaw` pipeline as before. The Visitor card uses a separate `dataset.opensGlobe` flag so it opens the existing globe overlay instead.

### Home button moved to top-right with rotating ring

`.home-fab` relocated from bottom-right (48px) to top-right (44px). It now carries a **rotating colored ring** in the minimalist-reference style, implemented as:

- `background: conic-gradient(from var(--ring-angle), ...rainbow palette...)` on the button itself
- `@property --ring-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }`
- `animation: ringSpin 6s linear infinite` animating the angle (no transform on the element, so no compositing-layer flicker)
- `::before` pseudo with `inset: 4px` is the inner black face leaving a 4px ring visible
- SVG icon at `z-index: 2`

Earlier attempts using a rotating `::before` with `transform: rotate(...)` caused hover flicker because the hover `transform: scale(1.08)` overrode the GPU-promoted layer. Switched to animating the angle via `@property` instead. Hover/active now only animate `box-shadow`. Mobile size 38px, top: 12px right: 12px.

### Cards: no FOUC on load

`.card { opacity: 0; }` by default; `_layout()` in stack.js sets the correct opacity (1 active, 0.85 → 0.3 peeks, 0 hidden) once it runs. Eliminates the flash where every card piled up centered before being positioned.

### Visitor map enlarged

ClustrMaps overlay grown from 40×50 padding → 56×64. `.globe-card` is now `width: min(92vw, 1100px)`, `max-height: 92vh`. The map image stretches to fill (`width: 100% !important`).

**Bugfix**: ClustrMaps reads `parent().width()` at script load time. The overlay was hidden with `display: none`, so parent width was 0 and the map rendered tiny. Switched `.globe-overlay.hidden` from `display: none` to `visibility: hidden` so layout dimensions are real at load. Visitor dot color changed from grey `#666666` to orange `#ff7a00` via the `c=` URL param.

### Hero typing GIF

`scripts/make_hero_gif.py` (Pillow + imageio + numpy) generates `docs/hero.gif`. Cycles through `LLM Dictionary → Transformer Directory → AI Glossary → AI Cheatsheet → AI Field Guide → LLM Dictionary` (start and end on the canonical name). For each: types letter by letter, holds with blinking cursor, erases word by word. Final pass holds for 3.2 s with no erase, then a 1.4 s blank pause before the GIF restarts. Output is 125 frames / 18.9 s / ~117 KB. Embedded at the top of `README.md`.

### Social preview

`scripts/make_social_preview.py` generates `social-preview.png` at 1280×640 — black bg, favicon scaled up on the left, "LLM Dictionary" wordmark + "a living dictionary for a moving field" tagline on the right. Upload via repo Settings → Social preview. Favicons (`favicon.svg`, `favicon.png`) also copied to repo root for visibility in source listings.

### README + PHILOSOPHY.md

`README.md` rewritten:
- Hero GIF embedded at top
- Two-sentence vision paragraph immediately after the H1
- Link to new `PHILOSOPHY.md`
- URL spelled out as `https://aditya-pola.github.io/llmdict` (js.org rejected the request — will revisit when a custom domain lands; previously incorrect `llmdict.js.org` references all replaced)
- Contributing language warmed up
- Two-paragraph license section

`PHILOSOPHY.md` is the long-form essay covering the same content as the Philosophy card overlay, in markdown.

### Dual license

- `LICENSE-CONTENT` — full text of **CC BY-SA 4.0**, scoped to all files under `cards/`, the generated `docs/data/glossary.json`, and `PHILOSOPHY.md`. Forks must credit and re-share under the same license.
- `LICENSE-CODE` — full text of **MIT**, scoped to engine and tooling (everything under `docs/`, build/validate scripts, `scripts/`). Permissive reuse.
- README's License section names both with explicit scope.

### Performance pass (next)

Audit identified six high-leverage wins for the next pass:
1. Defer all script tags (currently six sync `<script>` blocks before `app.js`)
2. Idle the rAF physics loop in `stack.js` when velocities are near zero
3. Pre-build a search haystack in `data.js`, debounce search input
4. Lazy-load KaTeX (currently ~107 KB shipped on every page)
5. Soften `backdrop-filter: blur(16px)` on mobile
6. Lazy-render full HTML for term cards far from the active card (defer linkifier work)

Plus a UX item: keyboard shortcuts should close the active overlay first and then act, instead of being silently no-oped while an overlay is open.

DOM virtualization, code-splitting, and Web Worker for graph force simulation deferred to a later pass.

---

## 2026-04-12 (evening) — Performance pass, scrub, licensing, polish

### History scrub
Ran `git filter-repo` on all 60 commits to remove every mention of the reference site that had inspired the early visual design. Replaced phrasing in file blobs and commit messages (dialed.gg-inspired → minimalist-reference-inspired), deleted a historical `docs/ui/DIALED_FINDINGS.md` file from every commit it appeared in, force-pushed rewritten history to GitHub. All commit SHAs changed; backup-pre-scrub branch created before the rewrite and later deleted.

### Performance pass (committed)
Implemented the six audit items from the preceding plan:
- All six site `<script>` tags switched to `defer`; `<link rel="preload">` added for `data/glossary.json` so the fetch starts in parallel with script download.
- `stack.js` physics loop rewritten to idle: the rAF chain stops scheduling itself when accumulator, velocity, and tilt all settle to zero; `_kick()` restarts it on wheel, edge-hover, touch, and `goTo()`. Idle CPU at rest drops from continuous 60 Hz to effectively zero.
- `data.js` pre-lower-cases name/expansion/oneliner at load into a `_searchIndex` array; `search.js` input debounced 80 ms to coalesce rapid keystrokes.
- `cards.js` gained `ensureKatexLoaded()`: KaTeX CSS + JS + auto-render inject lazily the first time `renderMath()` is asked to process content containing a `$`. `<link>` and `<script>` removed from `index.html`. On the main page, zero KaTeX bytes are loaded until the user opens an overlay that has math. Also removed the `renderAllMath` polling block in `app.js` (dead code under the new lazy loader since card faces never contain math).
- `style.css` has a mobile-only `backdrop-filter: blur(6px) !important` override for the header and three overlays (down from the desktop 16 px), cutting a large chunk of mobile compositor work.
- Term cards beyond ±12 of `HOME_INDEX` are created in deferred mode: placeholder content (name + expansion + raw oneliner) only, entry stashed on a `WeakMap`. `Stack._layout` calls `Cards.populateTermCard(card)` for any card entering `MAX_PEEK + 3` range. The expensive linkifier work (one regex scan per term per card) is pushed off the first-paint path.

### Keyboard shortcuts work through overlays
Shortcuts (`H`, `S`, `G`, `R`, arrows) were previously no-oped when an overlay was open. Rewired via a new `withOverlayDismiss(action)` helper that calls `closeOverlay()` / `closeGlobe()` if either is open and then runs the action on the next frame. `Esc` still explicitly closes overlays; `?` still toggles the shortcuts overlay; `Enter` still requires no overlay to be open (since it is "expand current card").

### History persists across navigation
`history.js` now persists `_visited` to `sessionStorage` under the key `llmdict.history`. On init, it checks `performance.getEntriesByType('navigation')[0].type`: if `'reload'`, it clears the key and starts fresh; otherwise it hydrates from storage. Result: clicking Graph and coming back, or any cross-page nav, preserves the History bar; a true page reload still wipes it.

### Header buttons no longer flash
`.graph-pill` and `.contribute-btn` defaulted to `position: fixed` with no top/left, which painted them at the body's top-left corner before the `positionHeaderButtons()` JS moved them. CSS now marks them `opacity: 0` by default; JS sets the coordinates and adds a `.positioned` class which fades them in over 150 ms. No more dart-across-the-screen on load.

### Cards no FOUC (already in place, noted for completeness)
`.card { opacity: 0 }` in base styles; `_layout()` sets opacity per card (active=1, peeks=0.85→0.3, hidden=0) on first run, so the pile-up-then-spread flash never happens.

### Social preview regenerated
`scripts/make_social_preview.py` rewritten to render at 2× (2560×1280) and to draw the favicon "D" from primitives rather than upscaling the 32 px PNG. The pixel pattern matches `favicon.png` exactly: a 13×16 stair-stepped block D where the top/bottom caps are 9 cells wide and the connecting rows step out to 13 cells. The entire composition (icon + gap + text) is now measured up front and centered horizontally so the right margin matches the left.

### Hero typing GIF
`scripts/make_hero_gif.py`:
- Added `Collective Knowledge Resource Management` as the penultimate name in the cycle (acronym match for "CKRM" / the project's thesis). Sequence is now `LLM Dictionary → Transformer Directory → AI Glossary → AI Cheatsheet → AI Field Guide → Collective Knowledge Resource Management → LLM Dictionary`.
- Frame widened from 900 px to 1080 px to accommodate the 41-character phrase without overflow.
- Final pass holds 3.2 s and skips the erase, then a 1.4 s blank pause before the loop restarts. 173 frames / 23.8 s / 173 KB.

### License detection fixed
GitHub's licensee scans the repo root for `LICENSE*`; having both `LICENSE-CODE` and `LICENSE-CONTENT` caused the About sidebar to report "Unknown licenses found" and show two license tabs under the README. Two-step fix:
1. Renamed `LICENSE-CODE` → `LICENSE` (canonical name for the code license) and stripped the custom Scope header that was confusing the detector; scope info now lives after a `---` separator at the end of the file.
2. Moved `LICENSE-CONTENT` into `cards/LICENSE` — licensee only scans the root, so the content license is discoverable exactly where it applies without confusing the detector. README's License section now links to `LICENSE` and `cards/LICENSE` respectively.

### URL correction
`llmdict.js.org` was rejected by the js.org maintainers earlier in the project. Every remaining reference in `README.md` replaced with `https://aditya-pola.github.io/llmdict` (the actual GitHub Pages URL). The URL will be revisited when/if a custom domain lands.

### Demo video (manual upload)
User recorded a 60-second screen demo of the interface (search → expand → inline link → graph view → back → site pages) and drag-dropped it into the README editor on github.com. GitHub's upload produced a `github.com/user-attachments/...` URL that renders as an inline video player directly on the repo page. No file committed to the repo.

### Assets and scripts
- `docs/hero.gif` regenerated
- `social-preview.png` regenerated (now 2560×1280, 44 KB)
- `scripts/make_hero_gif.py` and `scripts/make_social_preview.py` both updated; both produce deterministic output.
