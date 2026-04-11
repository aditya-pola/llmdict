# Unsloth × Gemma 4 — Model Name Glossary

*Fact-checked: 2026-04-10*

---

## How to Read a Model Name

```
unsloth / gemma-4 - {SIZE} {-it} {-QUANTIZATION_FORMAT}
   │         │         │       │           │
   │         │         │       │           └─ How it's compressed (Section 3)
   │         │         │       └─ Instruction-tuned or base (Section 2)
   │         │         └─ Model size variant (Section 1)
   │         └─ Model family + generation
   └─ HuggingFace organization (Section 5)
```

**Example:** `unsloth/gemma-4-26B-A4B-it-GGUF`
→ Unsloth's Gemma 4, 26B-param MoE (3.8B active), instruction-tuned, in GGUF format.

---

## 1. Model Size Variants

### E2B — 2.3 Billion Effective Parameters

| Detail | Value |
|--------|-------|
| **"E" stands for** | **Effective** — the compute-relevant parameter count, excluding per-layer embeddings (PLE) |
| Total parameters | 5.1B (effective 2.3B + PLE overhead) |
| Architecture | Dense (all parameters active per token) |
| Context window | 128K tokens |
| Modalities | Text, image, audio (≤30s), video (≤60s @ 1fps) → text output |
| Vision encoder | ~150M params |
| Audio encoder | ~300M params |

### E4B — 4.5 Billion Effective Parameters

| Detail | Value |
|--------|-------|
| Total parameters | 8B (effective 4.5B + PLE overhead) |
| Architecture | Dense |
| Context window | 128K tokens |
| Modalities | Text, image, audio (≤30s), video (≤60s @ 1fps) → text output |
| Vision encoder | ~150M params |
| Audio encoder | ~300M params |

### 26B-A4B — 25.2 Billion Total, 3.8 Billion Active

| Detail | Value |
|--------|-------|
| **"A" stands for** | **Active** — parameters used per token in the MoE routing |
| Total parameters | 25.2B |
| Active per token | 3.8B |
| Architecture | **Mixture-of-Experts (MoE)** — 128 experts + 1 shared expert, 8 active per token |
| Context window | 256K tokens |
| Modalities | Text, image, video (≤60s @ 1fps) → text output. **No audio.** |
| Vision encoder | ~550M params |

### 31B — 30.7 Billion Parameters (Dense)

| Detail | Value |
|--------|-------|
| Total parameters | 30.7B |
| Architecture | Dense (all parameters active per token) |
| Context window | 256K tokens |
| Modalities | Text, image, video (≤60s @ 1fps) → text output. **No audio.** |
| Vision encoder | ~550M params |

### Modality Matrix

| Modality | E2B | E4B | 26B-A4B | 31B |
|----------|:---:|:---:|:-------:|:---:|
| Text in/out | ✓ | ✓ | ✓ | ✓ |
| Image input | ✓ | ✓ | ✓ | ✓ |
| Audio input (≤30s) | ✓ | ✓ | ✗ | ✗ |
| Video input (≤60s) | ✓ | ✓ | ✓ | ✓ |

---

## 2. Training Stage Suffix

| Suffix | Meaning | Use case |
|--------|---------|----------|
| **-it** | **Instruction-Tuned** — fine-tuned for chat and instruction-following | Chat, assistants, Q&A, tool use |
| *(none)* | **Base** pretrained model — next-token prediction only, no chat formatting | Fine-tuning, research, embeddings |

---

## 3. Quantization Formats

### 3a. Repo-Level Formats

These appear in the HuggingFace repo name and determine which inference stack you use.

| Suffix | Full Name | What It Is | Run With |
|--------|-----------|------------|----------|
| *(none)* | Full precision (BF16/FP16) | Original weights in safetensors. No compression. | Transformers, vLLM, TGI |
| **-GGUF** | **GGML Universal File** | Single-file format for CPU/GPU inference. Each repo contains multiple quant levels (2-bit through 16-bit). | llama.cpp, Ollama, LM Studio, GPT4All |
| **-unsloth-bnb-4bit** | **Unsloth-optimized bitsandbytes 4-bit** | NF4 quantization stored as safetensors. Optimized for GPU fine-tuning with LoRA/QLoRA. | Transformers + Unsloth + PEFT |
| **-MLX-8bit** | **MLX 8-bit** | Standard 8-bit quantization in Apple's MLX format. | MLX on Apple Silicon Macs |
| **-UD-MLX-4bit** | **Unsloth Dynamic 4-bit for MLX** | Intelligent per-layer 4-bit quantization in MLX format. | MLX on Apple Silicon Macs |
| **-UD-MLX-3bit** | **Unsloth Dynamic 3-bit for MLX** | Most aggressive UD compression in MLX format. Only available for 26B-A4B and 31B. | MLX on Apple Silicon Macs |

### 3b. GGUF Sub-Quantization Types (Files Inside a -GGUF Repo)

Each `-GGUF` repo contains multiple files at different compression levels. The file names follow this pattern:

```
{model}-{QUANT_METHOD}{BIT}_{SIZE_TIER}.gguf
```

**Quantization method prefixes:**

| Prefix | Name | How It Works |
|--------|------|--------------|
| **Q** | **K-quant** (block quantization) | Hierarchical super-block structure (256 elements/block) with mixed-precision scales and mins per sub-block. The "K" does not stand for K-means — it's a custom method by llama.cpp contributor Iwan Kawrakow. |
| **IQ** | **Importance-weighted quantization** | Uses an importance matrix (imatrix) to weight parameters by sensitivity, then quantizes via codebook/lookup-table methods. More accurate than Q-quants at the same bit level but slower to generate. |
| **UD-** | **Unsloth Dynamic** | Varies precision per layer based on sensitivity analysis. Can prefix either Q or IQ methods. |

**Size tiers (quality vs. compression):**

| Tier | Meaning | Relative Quality |
|------|---------|-----------------|
| **_XXS** | Extra-extra-small | Lowest quality, smallest file |
| **_XS** | Extra-small | ↓ |
| **_S** | Small | ↓ |
| **_M** | Medium | Balanced |
| **_L** | Large | ↑ |
| **_XL** | Extra-large | Highest quality, largest file |

**Common file examples:**

| File Quant | Bits | Notes |
|------------|------|-------|
| Q4_K_M | 4-bit | K-quant, medium tier. Popular default for most users. |
| Q8_0 | 8-bit | High quality, ~2× size of Q4. |
| IQ4_XS | 4-bit | Importance-weighted 4-bit, extra-small tier. Better accuracy than Q4_K_S at similar size. |
| BF16 | 16-bit | BFloat16 full precision. Reference/baseline, not compressed. |
| MXFP4_MOE | 4-bit | **Microscaling FP4** — OCP standard (backed by AMD, NVIDIA, Microsoft). Uses E2M1 layout (1 sign, 2 exponent, 1 mantissa bit) with shared 8-bit block scaling factors. The `_MOE` suffix indicates it's optimized for Mixture-of-Experts layers. Only appears in 26B-A4B repos. |

---

## 4. Unsloth Dynamic (UD) — Deep Dive

**Unsloth Dynamic v2.0** is a proprietary quantization technique that assigns different precision levels to different layers based on their sensitivity to quantization error.

| Aspect | Detail |
|--------|--------|
| Core idea | Not all layers matter equally — attention layers near the start/end of the network are more sensitive. UD quantizes them at higher precision while compressing less-sensitive layers more aggressively. |
| Calibration | Uses 300K–1.5M tokens (varies by model size) to measure per-layer sensitivity. |
| Accuracy gain | 10–30% KL divergence reduction vs. uniform quantization across quant types. |
| Formats | Available for GGUF (as `UD-` prefix on quant files) and MLX (as `-UD-MLX-` in repo name). |
| Source | [Unsloth Dynamic v2.0 blog](https://unsloth.ai/blog/dynamic-v2) |

---

## 5. Organization Namespace

| Prefix | What It Is |
|--------|------------|
| **unsloth/** | [Unsloth AI](https://huggingface.co/unsloth) on HuggingFace — specializes in optimized quantization and fine-tuning of open-source LLMs. These are **re-quantized** versions of Google's official Gemma 4 models. |
| **google/** | Google's official base and instruction-tuned Gemma 4 uploads. The upstream source. |

---

## 6. What's Available (and What's Not)

### Coverage Matrix

| Size | Base 16-bit | IT 16-bit | GGUF | BnB-4bit (base) | BnB-4bit (IT) | MLX-8bit | UD-MLX-4bit | UD-MLX-3bit |
|------|:-----------:|:---------:|:----:|:----------------:|:--------------:|:--------:|:-----------:|:-----------:|
| E2B | ✓ | ✓ | ✓ (IT only) | ✓ | ✓ | ✓ | ✓ | ✗ |
| E4B | ✓ | ✓ | ✓ (IT only) | ✓ | ✓ | ✓ | ✓ | ✗ |
| 26B-A4B | ✓ | ✓ | ✓ (IT only) | ✗ | ✗ | ✓ | ✓ | ✓ |
| 31B | ✓ | ✓ | ✓ (IT only) | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notable gaps:**
- **No 26B-A4B bitsandbytes variants** — MoE architecture is less suited for bitsandbytes fine-tuning.
- **UD-MLX-3bit only for larger models** (26B-A4B and 31B) — 3-bit is too aggressive for smaller models.
- **GGUF repos only contain instruction-tuned variants** — base models are available in full precision only.

---

## 7. Quick Decision Guide

**"Which variant should I use?"**

| I want to... | Recommended |
|--------------|-------------|
| Run locally on CPU or modest GPU | `gemma-4-E4B-it-GGUF` → pick Q4_K_M file |
| Run on Apple Silicon Mac | `gemma-4-E4B-it-UD-MLX-4bit` |
| Get the best quality locally | `gemma-4-31B-it-GGUF` → pick Q8_0 or Q4_K_M |
| Fine-tune on a single GPU | `gemma-4-31B-it-unsloth-bnb-4bit` + LoRA |
| Process audio input | E2B or E4B variants only |
| Maximize tokens/second (MoE efficiency) | `gemma-4-26B-A4B-it-*` (only 3.8B active) |
| Research / build embeddings | Base models (no `-it` suffix), full precision |

---

## 8. Sources

1. **Google Gemma 4 model cards** — [google/gemma-4-E2B](https://huggingface.co/google/gemma-4-E2B), [E4B](https://huggingface.co/google/gemma-4-E4B), [26B-A4B-it](https://huggingface.co/google/gemma-4-26b-a4b-it), [31B-it](https://huggingface.co/google/gemma-4-31b-it)
2. **Unsloth GGUF model cards** — [26B-A4B-it-GGUF](https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF), [31B-it-GGUF](https://huggingface.co/unsloth/gemma-4-31B-it-GGUF)
3. **Unsloth Dynamic v2.0 blog** — [unsloth.ai/blog/dynamic-v2](https://unsloth.ai/blog/dynamic-v2)
4. **GGUF specification** — [ggml-org/ggml/docs/gguf.md](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md)
5. **llama.cpp K-quants** — [PR #1684](https://github.com/ggerganov/llama.cpp/pull/1684) by Iwan Kawrakow
6. **OCP Microscaling (MX) spec** — [opencompute.org](https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf) (MXFP4 standard)
7. **Google AI Gemma docs** — [ai.google.dev/gemma/docs/core](https://ai.google.dev/gemma/docs/core)

---

## Corrections from Original Research

| Term | Original Claim | Correction |
|------|---------------|------------|
| GGUF | "GPT-Generated Unified Format" | **GGML Universal File** (per gguf-py README) |
| Q-prefix | "Standard K-means quantization" | **K-quant block quantization** (not K-means; custom method) |
| IQ-prefix | "Importance-matrix based integer quantization" | **Importance-weighted quantization** (uses codebooks, not simple integers) |
| MXFP4 | "Mixed-precision FP4" | **Microscaling Floating Point 4-bit** (OCP standard, E2M1 layout) |
| UD KL reduction | "~7.5% KL divergence reduction" | 7.5% was specific to Q2_K_XL; broader claim is **10–30%** |
| Video support | Not mentioned | All 4 variants support **video input** (≤60s @ 1fps) |
