"""Image facts: dHash, EXIF GPS, screenshot and text-dense checks."""

from __future__ import annotations

import hashlib
import io

from PIL import Image

from trust_reader.photo_classifier import classify_scene

SCREENSHOT_MARKERS = ("screenshot", "screen shot", "snipping tool", "screencapture")
TEXT_DENSE_WORD_COUNT = 80


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dhash_hex(image: Image.Image) -> str:
    gray = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(gray.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            left = pixels[row * 9 + col]
            right = pixels[row * 9 + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
    return f"{bits:016x}"


def _ratio(value: object) -> float:
    if isinstance(value, tuple) and len(value) == 2 and value[1]:
        return float(value[0]) / float(value[1])
    return float(value)  # type: ignore[arg-type]


def gps_to_degrees(values: tuple[object, object, object], ref: str) -> float:
    degrees, minutes, seconds = (_ratio(values[0]), _ratio(values[1]), _ratio(values[2]))
    sign = -1 if ref.upper() in {"S", "W"} else 1
    return sign * (degrees + minutes / 60 + seconds / 3600)


def exif_gps(image: Image.Image) -> dict[str, float] | None:
    exif = image.getexif()
    gps = exif.get_ifd(0x8825)
    if not gps:
        return None
    lat_values = gps.get(2)
    lat_ref = gps.get(1)
    lng_values = gps.get(4)
    lng_ref = gps.get(3)
    if not lat_values or not lng_values or not lat_ref or not lng_ref:
        return None
    try:
        lat = gps_to_degrees(tuple(lat_values), str(lat_ref))
        lng = gps_to_degrees(tuple(lng_values), str(lng_ref))
    except (TypeError, ValueError, ZeroDivisionError):
        return None
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None
    return {"lat": round(lat, 6), "lng": round(lng, 6)}


def classify_image_text(text: str) -> tuple[str, str | None]:
    """Text rules that beat the scene check. None means the pixels decide."""
    normalized = " ".join(text.lower().split())
    if any(marker in normalized for marker in SCREENSHOT_MARKERS):
        return "no", "screenshot"
    words = [word for word in normalized.split(" ") if len(word) > 2]
    if len(words) >= TEXT_DENSE_WORD_COUNT:
        return "no", "text_dense"
    return "unknown", None


def image_fact(data: bytes, text: str, reader_error: str | None) -> dict:
    try:
        with Image.open(io.BytesIO(data)) as image:
            image.load()
            width, height = image.size
            digest = dhash_hex(image)
            gps = exif_gps(image)
            photo, reason = ("unknown", None) if reader_error else classify_image_text(text)
            if photo == "unknown":
                photo, reason = classify_scene(image)
    except Exception:
        return {
            "sha256": sha256_hex(data) if data else "",
            "dHashHex": None,
            "propertyPhoto": "unknown",
            "propertyPhotoReason": None,
            "exifGps": None,
            "width": None,
            "height": None,
            "readable": False,
            "readerError": reader_error or "unsupported_type",
        }
    return {
        "sha256": sha256_hex(data),
        "dHashHex": digest,
        "propertyPhoto": photo,
        "propertyPhotoReason": reason,
        "exifGps": gps,
        "width": width,
        "height": height,
        "readable": True,
        "readerError": None,
    }
