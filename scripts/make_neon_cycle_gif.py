#!/usr/bin/env python3
"""
Build a cycling GIF that hard-cuts through the 4 neon-variant
finalists for visual review.

Source: tmp/neon-previews/{slug}-800x200.png  (4 files)
Output: tmp/neon-previews/cycle.gif

Each variant holds for HOLD_SEC, then hard-cuts to the next. Loops.
"""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
PREV_DIR = REPO / "tmp" / "neon-previews"
OUT = PREV_DIR / "cycle.gif"

VARIANTS = [
    "01-hotblue-pinkshadow",
    "04-coral-mint",
    "05-yellow-magenta",
    "06-white-on-pink",
]
RES_TAG = "800x200"

HOLD_SEC = 1.42  # per variant


def main():
    sources = []
    for slug in VARIANTS:
        path = PREV_DIR / f"{slug}-{RES_TAG}.png"
        if not path.exists():
            raise SystemExit(f"missing variant: {path}")
        sources.append(Image.open(path).convert("P", palette=Image.ADAPTIVE))

    # Pillow GIF writer wants duration in MILLISECONDS, not seconds.
    duration_ms = int(HOLD_SEC * 1000)

    sources[0].save(
        OUT,
        format="GIF",
        save_all=True,
        append_images=sources[1:],
        duration=duration_ms,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"wrote {OUT.relative_to(REPO)} "
          f"({OUT.stat().st_size // 1024} KB, {len(sources)} frames, "
          f"{duration_ms} ms/frame, {HOLD_SEC * len(sources):.1f}s cycle)")


if __name__ == "__main__":
    sys.exit(main() or 0)
