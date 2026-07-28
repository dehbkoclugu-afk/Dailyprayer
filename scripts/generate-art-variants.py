#!/usr/bin/env python3
"""Generate 1x/2x card artwork without upscaling source images."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parents[1] / "assets" / "art"
for source in ROOT.rglob("*.webp"):
    if source.stem.endswith(("-card", "-card@2x")):
        continue
    with Image.open(source) as image:
        for suffix, width in (("-card", 480), ("-card@2x", 960)):
            if image.width <= width:
                continue
            height = round(image.height * width / image.width)
            image.resize((width, height), Image.Resampling.LANCZOS).save(
                source.with_name(f"{source.stem}{suffix}.webp"), "WEBP", quality=82
            )
