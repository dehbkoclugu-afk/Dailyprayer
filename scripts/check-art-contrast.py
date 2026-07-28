#!/usr/bin/env python3
"""Measure WCAG contrast after the app's real artwork scrims are composited."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "src/assets/art"
AA = 4.5


def rgb(value: str) -> tuple[int, int, int]:
    value = value.removeprefix("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def mix(a: float, b: float, amount: float) -> float:
    return a + (b - a) * amount


def composite(bottom: tuple[int, int, int], top: tuple[int, int, int], alpha: float):
    return tuple(round(mix(bottom[i], top[i], alpha)) for i in range(3))


def luminance(color: tuple[int, int, int]) -> float:
    channels = []
    for channel in color:
        value = channel / 255
        channels.append(value / 12.92 if value <= 0.03928 else ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    light, dark = sorted((luminance(a), luminance(b)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def minimum(
    asset: str,
    region: tuple[float, float, float, float],
    foreground: str,
    foreground_alpha: float,
    overlay,
) -> float:
    image = Image.open(ART / asset).convert("RGB")
    width, height = image.size
    left, top, right, bottom = (
        round(region[0] * width),
        round(region[1] * height),
        round(region[2] * width),
        round(region[3] * height),
    )
    fg = rgb(foreground)
    worst = float("inf")
    # Sampling every fourth pixel measures the real variants while keeping this
    # release check quick enough to run locally and in CI.
    for y in range(top, bottom, 4):
        for x in range(left, right, 4):
            background = overlay(image.getpixel((x, y)), x / width, y / height)
            rendered_fg = composite(background, fg, foreground_alpha)
            worst = min(worst, contrast(rendered_fg, background))
    return worst


def vertical(start, end, alpha_start, alpha_end):
    start, end = rgb(start), rgb(end)

    def apply(pixel, _x, y):
        color = tuple(round(mix(start[i], end[i], y)) for i in range(3))
        return composite(pixel, color, mix(alpha_start, alpha_end, y))

    return apply


def ritual(pixel, x, _y):
    if x <= 0.5:
        alpha = mix(0.94, 0.86, x / 0.5)
    else:
        alpha = mix(0.86, 0.74, (x - 0.5) / 0.5)
    return composite(pixel, (22, 15, 8), alpha)


def plan(start, end):
    start, end = rgb(start), rgb(end)

    def apply(pixel, x, y):
        amount = (x + y) / 2
        color = tuple(round(mix(start[i], end[i], amount)) for i in range(3))
        return composite(pixel, color, mix(0.90, 0.98, amount))

    return apply


checks = []
for asset in (
    "A5-verse-peace.webp",
    "A5-verse-strength.webp",
    "A5-verse-trust.webp",
    "A5-verse-rest.webp",
    "A5-verse-hope.webp",
    "A5-verse-guidance.webp",
    "A5-verse-joy.webp",
    "A5-verse-love.webp",
):
    checks.append((asset, minimum(asset, (0, 0, 1, 1), "#F2EEE6", 1, vertical("#17102E", "#0E1220", 0.82, 0.97))))
    checks.append((asset, minimum(asset, (0, 0, 1, 1), "#E4B85B", 1, vertical("#17102E", "#0E1220", 0.82, 0.97))))

for asset in ("A18-ritual-reading.webp", "A19-ritual-prayer.webp", "A20-ritual-gratitude.webp"):
    checks.append((asset, minimum(asset, (0, 0, 0.78, 1), "#F2EEE6", 0.94, ritual)))

checks.append((
    "A10-tonight-night.webp",
    minimum("A10-tonight-night.webp", (0, 0.5, 1, 1), "#F2EEE6", 1, vertical("#1E1A3A", "#0A0C18", 0.62, 0.96)),
))

for asset, start in (
    ("A13-plan-cover.webp", "#2B4C7E"),
    ("A13-gratitude7.webp", "#7A5C2E"),
    ("A13-psalms30.webp", "#54346E"),
    ("A13-gospels90.webp", "#2E5E4E"),
    ("A13-bible365.webp", "#8A4B2E"),
):
    checks.append((asset, minimum(asset, (0, 0.5, 1, 1), "#F2EEE6", 0.94, plan(start, "#0E1220"))))

failed = [(asset, value) for asset, value in checks if value < AA]
for asset, value in checks:
    print(f"{asset}: {value:.2f}:1")
if failed:
    raise SystemExit("below 4.5:1: " + ", ".join(f"{asset} ({value:.2f})" for asset, value in failed))
