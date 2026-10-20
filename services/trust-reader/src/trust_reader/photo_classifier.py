"""Pinned scene check. Same pixels, same label. No weights and no network.

scene-1 says whether a file has the structure of a building or a plot.
It does not say the file is the building at the listing pin.
"""

from __future__ import annotations

from PIL import Image

CLASSIFIER_VERSION = "scene-1"
SIZE = 64
EDGE_DELTA = 24


def classify_scene(image: Image.Image) -> tuple[str, str]:
    small = image.convert("RGB").resize((SIZE, SIZE), Image.Resampling.BOX)
    pixels = list(small.getdata())
    count = len(pixels)
    luminance = [0.2126 * red + 0.7152 * green + 0.0722 * blue for red, green, blue in pixels]
    mean = sum(luminance) / count
    variance = sum((value - mean) ** 2 for value in luminance) / count
    edges = 0
    pairs = 0
    for y in range(SIZE):
        row = y * SIZE
        for x in range(SIZE - 1):
            pairs += 1
            if abs(luminance[row + x] - luminance[row + x + 1]) > EDGE_DELTA:
                edges += 1
        if y == SIZE - 1:
            continue
        for x in range(SIZE):
            pairs += 1
            if abs(luminance[row + x] - luminance[row + SIZE + x]) > EDGE_DELTA:
                edges += 1
    edge_fraction = edges / pairs
    white = sum(1 for red, green, blue in pixels if red > 230 and green > 230 and blue > 230) / count
    colorfulness = sum(max(red, green, blue) - min(red, green, blue) for red, green, blue in pixels) / count
    green_ratio = sum(1 for red, green, blue in pixels if green > red + 15 and green > blue + 15) / count

    if variance < 80 and edge_fraction < 0.04:
        return "no", "flat"
    if white > 0.72 and edge_fraction > 0.05:
        return "no", "document_page"
    if edge_fraction >= 0.025 and colorfulness >= 12 and variance >= 200:
        if green_ratio > 0.35:
            return "yes", "land"
        return "yes", "building"
    return "no", "not_a_scene"
