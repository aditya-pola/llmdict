#!/usr/bin/env python3
"""
Generate a pack of POP-style URL banner images for review.

Cursive/script font, bold colored fill, contrasting drop shadow.
Some variants get a thick outline (border) for the comic-pop look.

Output goes to tmp/neon-previews/ (gitignored), one PNG per variant
at two resolutions plus a transparent-bg version. Run:

    python3 scripts/make_neon_link.py

Pillow only, no system deps. Fonts vendored under assets/fonts/.
"""
from __future__ import annotations

import os
import random
import sys
from dataclasses import dataclass, field
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO = Path(__file__).resolve().parents[1]
OUT_DIR = REPO / "tmp" / "neon-previews"
FONT_DIR = REPO / "assets" / "fonts"

TEXT = "llmdict.is-cool.dev"

# Vendored cursive/script fonts (downloaded from Google Fonts, SIL OFL)
FONTS = {
    "pacifico":     FONT_DIR / "Pacifico-Regular.ttf",
    "lobster":      FONT_DIR / "Lobster-Regular.ttf",
    "kaushan":      FONT_DIR / "KaushanScript-Regular.ttf",
    "caveat":       FONT_DIR / "Caveat-Bold.ttf",
}

RESOLUTIONS = [
    (1600, 400),
    (800, 200),
    (400, 100),
]


# ---------------------------------------------------------------------------
# Variants
# ---------------------------------------------------------------------------

@dataclass
class Variant:
    slug: str
    label: str
    font: str                          # key into FONTS
    fill: tuple                        # text fill RGB
    shadow: tuple                      # drop-shadow RGB
    bg: tuple = (255, 240, 245)        # default bg: warm cream
    outline: tuple | None = None       # if set: border RGB
    outline_width_pct: float = 0.018   # outline width as fraction of height
    shadow_offset_pct: tuple = (0.02, 0.04)  # (x, y) offset as fraction of height
    shadow_blur_pct: float = 0.0       # 0 = hard-edged shadow; >0 = blurred
    angle_deg: float = 0.0             # rotation in degrees (0 = upright)


VARIANTS = [
    # 1: hot blue text, hot pink hard shadow, no outline
    Variant("01-hotblue-pinkshadow",
            "Hot blue text, hot pink hard shadow",
            font="pacifico",
            fill=(8, 105, 255),
            shadow=(255, 16, 176),
            bg=(255, 248, 240),
            outline=None,
            shadow_offset_pct=(0.025, 0.05),
            shadow_blur_pct=0.0),

    # 4: coral on mint, soft 60s diner palette
    Variant("04-coral-mint",
            "Coral on mint, white outline",
            font="pacifico",
            fill=(255, 90, 95),
            shadow=(40, 50, 60),
            bg=(190, 240, 230),
            outline=(255, 255, 255),
            outline_width_pct=0.020,
            shadow_offset_pct=(0.018, 0.045),
            shadow_blur_pct=0.0),

    # 5: yellow on magenta, high-vibration pop
    Variant("05-yellow-magenta",
            "Yellow on magenta, black outline",
            font="kaushan",
            fill=(255, 232, 0),
            shadow=(0, 0, 0),
            bg=(220, 60, 160),
            outline=(0, 0, 0),
            outline_width_pct=0.020,
            shadow_offset_pct=(0.020, 0.045),
            shadow_blur_pct=0.0),

    # 6: white script on hot pink
    Variant("06-white-on-pink",
            "White script on hot pink",
            font="pacifico",
            fill=(255, 255, 255),
            shadow=(80, 0, 60),
            bg=(255, 16, 140),
            outline=(80, 0, 60),
            outline_width_pct=0.018,
            shadow_offset_pct=(0.018, 0.040),
            shadow_blur_pct=0.0),
]


# ---------------------------------------------------------------------------
# Drawing
# ---------------------------------------------------------------------------

def load_font(key, size):
    path = FONTS[key]
    if not path.exists():
        raise SystemExit(f"missing font: {path} (run the curl install in plan)")
    return ImageFont.truetype(str(path), size)


def measure(font, text):
    bbox = font.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox


def fit_font(key, target_text_h, max_w):
    """Pick the largest font size whose rendered text fits in (max_w, ~target_text_h)."""
    size = target_text_h
    while size > 8:
        font = load_font(key, size)
        tw, th, _ = measure(font, TEXT)
        if tw <= max_w and th <= target_text_h * 1.25:
            return font, (tw, th)
        size -= 4
    return load_font(key, size), measure(font, TEXT)[:2]


def text_image(canvas_size, text, font, fill_rgba, anchor=(0, 0)):
    """Render text on a transparent canvas. anchor is (x, y) of top-left of bbox."""
    layer = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.text(anchor, text, font=font, fill=fill_rgba)
    return layer


def stroke_outline(text_layer_alpha, width):
    """Take an alpha mask and grow it by `width` pixels in every direction.
    Returns a new alpha mask suitable for an outline ring."""
    if width <= 0:
        return None
    # MaxFilter-based dilation; round to odd kernel size
    k = max(3, int(width * 2) | 1)
    grown = text_layer_alpha.filter(ImageFilter.MaxFilter(k))
    return grown


def render_variant(width, height, v: Variant, transparent_bg=False):
    """Render one variant at (width, height). Returns RGB(A) image."""
    # 2x oversampling for crispness
    W, H = width * 2, height * 2

    # Pick font size: text occupies ~45% of canvas height, leave 6% padding each side
    pad = int(W * 0.05)
    avail_w = W - 2 * pad
    target_h = int(H * 0.50)
    font, (tw, th) = fit_font(v.font, target_h, avail_w)
    bbox = font.getbbox(TEXT)

    # Where to place the text (centered)
    x = (W - tw) // 2 - bbox[0]
    y = (H - th) // 2 - bbox[1]

    # Background
    bg_alpha = 0 if transparent_bg else 255
    base = Image.new("RGBA", (W, H), (*v.bg, bg_alpha))

    # SHADOW LAYER: render text in shadow color, offset, optionally blur
    sx_off = int(H * v.shadow_offset_pct[0])
    sy_off = int(H * v.shadow_offset_pct[1])
    shadow_layer = text_image((W, H), TEXT, font, (*v.shadow, 255), anchor=(x + sx_off, y + sy_off))
    if v.shadow_blur_pct > 0:
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=H * v.shadow_blur_pct))
    base = Image.alpha_composite(base, shadow_layer)

    # OUTLINE LAYER: dilated text mask, filled with outline color
    if v.outline is not None:
        text_alpha = text_image((W, H), TEXT, font, (255, 255, 255, 255), anchor=(x, y)).split()[-1]
        ow = max(2, int(H * v.outline_width_pct))
        outline_alpha = stroke_outline(text_alpha, ow)
        outline_layer = Image.new("RGBA", (W, H), (*v.outline, 0))
        outline_layer.putalpha(outline_alpha)
        base = Image.alpha_composite(base, outline_layer)

    # MAIN TEXT LAYER on top
    text_layer = text_image((W, H), TEXT, font, (*v.fill, 255), anchor=(x, y))
    base = Image.alpha_composite(base, text_layer)

    # Subtle rotation for personality
    if abs(v.angle_deg) > 0.1:
        base = base.rotate(v.angle_deg, resample=Image.BICUBIC, expand=False,
                           fillcolor=(*v.bg, bg_alpha))

    # Subtle grain
    base = Image.alpha_composite(base, _grain(W, H, strength=8))

    final = base.resize((width, height), Image.LANCZOS)
    return final if transparent_bg else final.convert("RGB")


def _grain(W, H, strength=8):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    rng = random.Random(42)
    n_dots = (W * H) // 1200
    for _ in range(n_dots):
        x = rng.randint(0, W - 1)
        y = rng.randint(0, H - 1)
        a = rng.randint(0, strength)
        c = rng.choice([(255, 255, 255, a), (0, 0, 0, a // 2)])
        draw.point((x, y), fill=c)
    return layer


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Wipe previous previews
    for f in OUT_DIR.glob("*.png"):
        f.unlink()

    print(f"Generating {len(VARIANTS)} variants x {len(RESOLUTIONS)} sizes (+ 1 transparent each)\n")
    for v in VARIANTS:
        for (w, h) in RESOLUTIONS:
            img = render_variant(w, h, v, transparent_bg=False)
            path = OUT_DIR / f"{v.slug}-{w}x{h}.png"
            img.save(path, format="PNG", optimize=True)
            print(f"  {path.relative_to(REPO)} ({path.stat().st_size // 1024} KB) — {v.label}")

        img = render_variant(*RESOLUTIONS[0], v, transparent_bg=True)
        path = OUT_DIR / f"{v.slug}-{RESOLUTIONS[0][0]}x{RESOLUTIONS[0][1]}-transparent.png"
        img.save(path, format="PNG", optimize=True)
        print(f"  {path.relative_to(REPO)} ({path.stat().st_size // 1024} KB) — transparent\n")

    print(f"Done. Open the previews in {OUT_DIR.relative_to(REPO)}/")


if __name__ == "__main__":
    sys.exit(main() or 0)
