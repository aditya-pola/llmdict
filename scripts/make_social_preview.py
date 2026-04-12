#!/usr/bin/env python3
"""
Generate the GitHub social preview image (1280x640).

Black background, the favicon scaled up on the left, the project name and
a one-line tagline to its right. Output: social-preview.png at the repo
root. Upload via repo Settings -> Social preview.

Requires: pillow
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[1]
FAVICON = REPO / "favicon.png"
OUTPUT = REPO / "social-preview.png"

W, H = 1280, 640
BG = (0, 0, 0)
FG = (255, 255, 255)
MUTED = (160, 160, 160)

FONT_REGULAR_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Helvetica.ttc",
]
FONT_BOLD_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Helvetica.ttc",
]


def load_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Favicon on the left, scaled to ~280px square
    icon_size = 280
    icon_x = 120
    icon_y = (H - icon_size) // 2
    if FAVICON.exists():
        icon = Image.open(FAVICON).convert("RGBA")
        icon = icon.resize((icon_size, icon_size), Image.LANCZOS)
        img.paste(icon, (icon_x, icon_y), icon)
    else:
        # Fallback: black rounded square with white "L"
        draw.rounded_rectangle(
            (icon_x, icon_y, icon_x + icon_size, icon_y + icon_size),
            radius=24, outline=FG, width=4,
        )

    # Wordmark and tagline to the right of the icon
    title_font = load_font(FONT_BOLD_PATHS, 96)
    tag_font = load_font(FONT_REGULAR_PATHS, 36)

    text_x = icon_x + icon_size + 60
    title = "LLM Dictionary"
    tagline = "a living dictionary for a moving field"

    title_bbox = title_font.getbbox(title)
    title_h = title_bbox[3] - title_bbox[1]
    tag_bbox = tag_font.getbbox(tagline)
    tag_h = tag_bbox[3] - tag_bbox[1]
    gap = 24
    block_h = title_h + gap + tag_h
    title_y = (H - block_h) // 2 - title_bbox[1]
    tag_y = title_y + title_h + gap - tag_bbox[1] + title_bbox[1]

    draw.text((text_x, title_y), title, font=title_font, fill=FG)
    draw.text((text_x, tag_y), tagline, font=tag_font, fill=MUTED)

    img.save(OUTPUT, format="PNG", optimize=True)
    print(f"wrote {OUTPUT} ({W}x{H})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
