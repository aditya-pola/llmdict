#!/usr/bin/env python3
"""
Generate the GitHub social preview image at 2x resolution (2560x1280).

The favicon block is reproduced from primitives (rounded square + 'D' +
underline) so it stays sharp at any size — no upscaling of the 32x32
PNG. Output: social-preview.png at the repo root. Upload via repo
Settings -> Social preview.

Requires: pillow
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[1]
OUTPUT = REPO / "social-preview.png"

# 2x resolution. GitHub accepts up to a few MB at any aspect close to 2:1
# and downscales for display; oversampling here gives crisper text and
# icons on retina/HiDPI link-preview surfaces (Slack, Twitter/X, etc.).
W, H = 2560, 1280
BG = (0, 0, 0)
FG = (255, 255, 255)
MUTED = (160, 160, 160)
ICON_SIZE = 560        # square block
TITLE_PX = 192
TAG_PX = 72
TEXT_GAP = 48
ICON_TO_TEXT_GAP = 120

FONT_REGULAR_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Helvetica.ttc",
]
FONT_BOLD_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Helvetica.ttc",
]
# A heavier weight for the favicon glyph itself if available
FONT_HEAVY_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def draw_favicon_block(draw: ImageDraw.ImageDraw, x: int, y: int, size: int):
    """Reproduce favicon.svg from primitives at arbitrary size.
    Source SVG (32x32):
        <rect width=32 height=32 rx=6 fill=#000/>
        <text x=16 y=23 ... font-size=20 fill=#fff>D</text>
        <rect x=6 y=26 width=20 height=1.5 rx=0.75 fill=rgba(255,255,255,0.25)/>
    Scale all values by (size / 32).
    """
    s = size / 32.0
    radius = int(round(6 * s))

    # Black rounded square
    draw.rounded_rectangle(
        (x, y, x + size, y + size),
        radius=radius,
        fill=(0, 0, 0),
    )

    # Block-style 'D' replicated pixel-for-pixel from favicon.png. The
    # shape is a stair-stepped block: 2 rows of width 9 cap the top,
    # then a row of width 13 steps right (the "curve"), then a hollow
    # body with two 4-wide vertical bars, mirrored at the bottom.
    # 13 columns x 16 rows. No font, no curves — pure rectangles.
    pattern = [
        "#########....",
        "#########....",
        "#############",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "####.....####",
        "#############",
        "#########....",
        "#########....",
    ]
    cols = max(len(row) for row in pattern)   # 13
    rows = len(pattern)                        # 16

    # Target the D to occupy roughly the same vertical area as the SVG
    # original (font-size 20 inside a 32-tall block) -> 20 SVG units tall.
    # Cell size in pixels:
    cell = (20 * s) / rows
    d_w = cell * cols
    d_h = cell * rows
    # Center the D inside the favicon block. The SVG version has the
    # baseline at y=23 (i.e. slightly low of true center), keep that feel
    # by offsetting the D slightly downward.
    d_x = x + (size - d_w) / 2
    d_y = y + (size - d_h) / 2 + (1.0 * s)  # 1 SVG unit lower than center

    for r, row in enumerate(pattern):
        for c, ch in enumerate(row):
            if ch != '#':
                continue
            cx0 = d_x + c * cell
            cy0 = d_y + r * cell
            # Draw each cell as a crisp rectangle. Use floor/ceil-friendly
            # rounding so adjacent cells touch without gaps.
            draw.rectangle(
                (round(cx0), round(cy0),
                 round(cx0 + cell), round(cy0 + cell)),
                fill=(255, 255, 255),
            )

    # Thin underline, SVG x=6 y=26 w=20 h=1.5, faded white
    bar_x0 = x + int(round(6 * s))
    bar_x1 = x + int(round((6 + 20) * s))
    bar_y0 = y + int(round(26 * s))
    bar_y1 = y + int(round((26 + 1.5) * s))
    bar_radius = max(1, int(round(0.75 * s)))
    draw.rounded_rectangle(
        (bar_x0, bar_y0, bar_x1, bar_y1),
        radius=bar_radius,
        fill=(255, 255, 255, 64),  # ~25% alpha
    )


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    # Pre-measure text so we can center the whole composition
    # (icon + gap + text block) horizontally as one unit.
    title_font = load_font(FONT_BOLD_PATHS, TITLE_PX)
    tag_font = load_font(FONT_REGULAR_PATHS, TAG_PX)

    title = "LLM Dictionary"
    tagline = "a living dictionary for a moving field"

    t_bbox = title_font.getbbox(title)
    title_w = t_bbox[2] - t_bbox[0]
    title_h = t_bbox[3] - t_bbox[1]
    g_bbox = tag_font.getbbox(tagline)
    tag_w = g_bbox[2] - g_bbox[0]
    tag_h = g_bbox[3] - g_bbox[1]

    text_block_w = max(title_w, tag_w)
    composition_w = ICON_SIZE + ICON_TO_TEXT_GAP + text_block_w
    icon_x = (W - composition_w) // 2

    # Favicon block, vertically centered
    icon_y = (H - ICON_SIZE) // 2
    draw_favicon_block(draw, icon_x, icon_y, ICON_SIZE)

    # Wordmark + tagline immediately to the right of the icon
    text_x = icon_x + ICON_SIZE + ICON_TO_TEXT_GAP
    block_h = title_h + TEXT_GAP + tag_h
    title_y = (H - block_h) // 2 - t_bbox[1]
    tag_y = title_y + title_h + TEXT_GAP - g_bbox[1] + t_bbox[1]

    draw.text((text_x, title_y), title, font=title_font, fill=FG)
    draw.text((text_x, tag_y), tagline, font=tag_font, fill=MUTED)

    img.save(OUTPUT, format="PNG", optimize=True)
    print(f"wrote {OUTPUT} ({W}x{H})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
