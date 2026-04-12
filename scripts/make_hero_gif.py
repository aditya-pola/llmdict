#!/usr/bin/env python3
"""
Generate the hero typing GIF for the README.

Cycles through a small set of names for the project, typing each letter
by letter, then erasing word by word, then typing the next. The first
and last name in the loop is "LLM Dictionary" so that, paused at any
moment in the cycle's natural rest position, the GIF reads as the
project's actual name.

Output: docs/hero.gif

Requires: pillow, imageio
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio.v2 as imageio
import numpy as np

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

NAMES = [
    "LLM Dictionary",
    "Transformer Directory",
    "AI Glossary",
    "AI Cheatsheet",
    "AI Field Guide",
    "LLM Dictionary",   # loop returns to the canonical name
]

WIDTH, HEIGHT = 900, 140
BG = (0, 0, 0)
FG = (255, 255, 255)
PROMPT_FG = (120, 120, 120)
CURSOR = "\u2588"  # full block

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Menlo.ttc",
]
FONT_SIZE = 38

PROMPT = "$ "

# Frame durations in seconds (will be converted to GIF centi-second units)
TYPE_DELAY     = 0.07   # per character while typing
HOLD_AFTER     = 1.40   # at the fully-typed name
ERASE_DELAY    = 0.18   # per word while erasing
HOLD_BLANK     = 0.30   # blank frame between names
CURSOR_BLINK   = 0.45   # half-period of the blinking cursor (during holds)
END_HOLD       = 3.20   # extra hold on the canonical name at end of loop
LOOP_PAUSE     = 1.40   # blank pause before the GIF restarts

OUTPUT = Path(__file__).resolve().parents[1] / "docs" / "hero.gif"

# ---------------------------------------------------------------------------
# Drawing
# ---------------------------------------------------------------------------

def load_font() -> ImageFont.FreeTypeFont:
    for path in FONT_PATHS:
        if os.path.exists(path):
            return ImageFont.truetype(path, FONT_SIZE)
    return ImageFont.load_default()


def render_frame(font: ImageFont.FreeTypeFont, text: str, cursor_on: bool) -> Image.Image:
    """Render a single frame: prompt + text + (optional) cursor."""
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Vertically center the text
    bbox = font.getbbox("Mg")
    text_h = bbox[3] - bbox[1]
    y = (HEIGHT - text_h) // 2 - bbox[1]
    x = 32

    draw.text((x, y), PROMPT, font=font, fill=PROMPT_FG)
    prompt_w = font.getlength(PROMPT)

    draw.text((x + prompt_w, y), text, font=font, fill=FG)

    if cursor_on:
        text_w = font.getlength(text)
        draw.text((x + prompt_w + text_w, y), CURSOR, font=font, fill=FG)

    return img


# ---------------------------------------------------------------------------
# Frame sequencing
# ---------------------------------------------------------------------------

def frames_for_name(font: ImageFont.FreeTypeFont, name: str, hold: float = HOLD_AFTER, erase: bool = True):
    """Yield (image, duration) for one cycle of a name. By default: type,
    hold with a blinking cursor, then erase word by word. If ``erase`` is
    False, the cycle ends at the held state (used for the final name in
    the loop, where we want the canonical name to linger)."""
    # Type
    for i in range(1, len(name) + 1):
        partial = name[:i]
        yield render_frame(font, partial, cursor_on=True), TYPE_DELAY

    # Hold with a blinking cursor
    blink_cycles = max(1, int(hold / (CURSOR_BLINK * 2)))
    for _ in range(blink_cycles):
        yield render_frame(font, name, cursor_on=True), CURSOR_BLINK
        yield render_frame(font, name, cursor_on=False), CURSOR_BLINK

    if erase:
        words = name.split(" ")
        while words:
            words.pop()
            partial = " ".join(words)
            yield render_frame(font, partial, cursor_on=True), ERASE_DELAY


def build_animation(font: ImageFont.FreeTypeFont):
    images = []
    durations = []
    last = len(NAMES) - 1
    for idx, name in enumerate(NAMES):
        if idx == last:
            # Final pass on the canonical name: type, hold longer, do not erase.
            for img, dur in frames_for_name(font, name, hold=END_HOLD, erase=False):
                images.append(img)
                durations.append(dur)
            # End the loop on a blank canvas so the restart from "L" is clean
            # and the viewer notices the pause between cycles.
            images.append(render_frame(font, "", cursor_on=True))
            durations.append(LOOP_PAUSE)
        else:
            for img, dur in frames_for_name(font, name):
                images.append(img)
                durations.append(dur)
            # Brief blank pause between names
            images.append(render_frame(font, "", cursor_on=True))
            durations.append(HOLD_BLANK)
            images.append(render_frame(font, "", cursor_on=False))
            durations.append(HOLD_BLANK / 2)
    return images, durations


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    font = load_font()
    images, durations = build_animation(font)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    frames_np = [np.array(img.convert("RGB")) for img in images]

    imageio.mimsave(
        OUTPUT,
        frames_np,
        format="GIF",
        duration=durations,
        loop=0,        # loop forever
    )

    print(f"wrote {OUTPUT}  ({len(images)} frames, {sum(durations):.1f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
