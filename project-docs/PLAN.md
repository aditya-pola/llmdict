# LLM Glossary — Plan

## Vision

A comprehensive, browsable glossary of every abbreviation, term, and concept a practitioner encounters in the LLM ecosystem — from model names on HuggingFace to the underlying math. Structured as linked entries with progressive depth: skim the one-liner, or drill down to how quantization actually works at the bit level.

## Principles

1. **Incremental** — build phase by phase, each phase produces usable output
2. **Fact-checked** — every entry verified against primary sources before inclusion
3. **Layered depth** — each term has: abbreviation → expansion → one-liner → explanation → fundamentals
4. **Linked** — terms reference each other (wiki-style), forming a navigable graph
5. **Single source of truth** — structured data files feed whatever UI we build later

## Data Format

Each term lives as a structured entry in a category JSON file under `docs/data/`.
Schema per entry:

```json
{
  "id": "gptq",
  "name": "GPTQ",
  "expansion": "GPT-Quantized",
  "category": "quantization-formats",
  "oneliner": "Post-training weight quantization using approximate second-order information.",
  "explanation": "Longer paragraph explaining what it does and why it matters.",
  "fundamentals": "Deep dive — the actual math/operation, for those who want to understand the mechanics.",
  "seen_in": ["model-name", "repo-name"],
  "related": ["awq", "exl2", "quantization"],
  "sources": ["https://arxiv.org/abs/2210.17323"],
  "confidence": "high",
  "verified_date": "2026-04-10"
}
```

## Phases

### Phase 1: Quantization & Precision ← START HERE
The most confusing and practically important category. Covers:
- What quantization IS (fundamentals)
- Precision formats: fp32, fp16, bf16, fp8, int8, int4, nf4
- File/container formats: GGUF, safetensors, GGML (legacy)
- Quantization methods: GPTQ, AWQ, EXL2, BnB, HQQ, AQLM, QuIP#, EETQ, Quanto
- Quant naming: Q4_K_M, IQ4_XS, W4A16, W8A8, etc.
- Specialized: UD (Unsloth Dynamic), imatrix, Marlin kernels, MXFP4
- Runtime tags: which format runs where

### Phase 2: Architecture Concepts
- Attention variants: MHA, MQA, GQA, MLA, SWA, SDPA, Flash Attention
- Position encodings: RoPE, ALiBi, NTK, YaRN, ABF, PI
- Layer types: FFN/MLP, SwiGLU, RMSNorm, PLE
- Scaling patterns: MoE, dense, distillation
- KV cache, PagedAttention, speculative decoding

### Phase 3: Training & Alignment
- Pre-training, SFT, RLHF, DPO, ORPO, KTO, SimPO, CPT
- Fine-tuning methods: LoRA, QLoRA, DoRA, IA3, PEFT, full-ft
- Merging: SLERP, TIES, DARE, frankenmerge, SOLAR
- Tags: -merged, -unmerged, -adapter, -ft

### Phase 4: Model Families & Naming
- Size conventions: B, T, A (active), E (effective), context markers
- Capability suffixes: -Coder, -VL, -Vision, -Math, -Embed, -Guard, -MRL
- Scale variants: -Lite, -Mini, -Small, -Pro, -Turbo, -Max, -Ultra
- Release tags: -preview, -dev, -rc, -hf, -original
- Family-specific: Scout/Maverick (Llama 4), PLE (Gemma 4)

### Phase 5: Ecosystem & Infrastructure
- Orgs: TheBloke, bartowski, turboderp, mlx-community, Mradermacher, QuantFactory
- Serving: vLLM, TGI, llama.cpp, Ollama, LM Studio, ExLlamaV2, TensorRT-LLM
- Export formats: ONNX, CoreML, OpenVINO, ct2
- Tokenizers: BPE, SPM, tiktoken
- Dataset/recipe names: Hermes, Dolphin, Platypus, EvolInstruct

### Phase 6: UI Build
- Decide format (static site, interactive app, etc.)
- Build from data files
- Search, browse by category, follow links between terms

## Status

| Phase | Status | Entries | Last updated |
|-------|--------|---------|-------------|
| 1. Quantization & Precision | **Complete** | 36 | 2026-04-10 |
| 2a. Attention Variants | **Complete** | 9 | 2026-04-10 |
| 2b. Position Encodings | **Complete** | 8 | 2026-04-10 |
| 2c. Layer Types & Norms | **Complete** | 8 | 2026-04-10 |
| 2d. Scaling Patterns | **Complete** | 8 | 2026-04-10 |
| 3. Training & Alignment | **Complete** | 15 | 2026-04-10 |
| 4. Model Families & Naming | **Complete** | 23 | 2026-04-10 |
| 5. Ecosystem & Infrastructure | **Complete** | 34 | 2026-04-10 |
| 6. UI Build | Not started | — | — |
