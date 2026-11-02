"""Local OCR binaries. Missing tools are a fact, not a guessed document."""

from __future__ import annotations

import shutil
import subprocess


def _run(command: list[str], data: bytes, timeout: int) -> str | None:
    if shutil.which(command[0]) is None:
        return None
    try:
        completed = subprocess.run(
            command,
            input=data,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if completed.returncode != 0:
        return ""
    return completed.stdout.decode("utf-8", errors="replace")


def pdftotext(data: bytes) -> str | None:
    return _run(["pdftotext", "-layout", "-", "-"], data, 30)


def tesseract_bytes(data: bytes) -> str | None:
    return _run(["tesseract", "stdin", "stdout", "-l", "eng"], data, 60)


def extract_text(data: bytes, mime_type: str) -> tuple[str, str | None]:
    if mime_type == "application/pdf":
        text = pdftotext(data)
        if text is None:
            return "", "ocr_unavailable"
        if len(text.strip()) >= 40:
            return text, None
        rendered = tesseract_bytes(data)
        if rendered is None:
            return text, None if len(text.strip()) >= 40 else "ocr_unavailable"
        return rendered or text, None
    if mime_type in {"image/jpeg", "image/png", "image/webp"}:
        text = tesseract_bytes(data)
        if text is None:
            return "", "ocr_unavailable"
        return text, None
    return "", "unsupported_type"
