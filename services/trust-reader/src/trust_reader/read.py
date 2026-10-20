"""Assemble a v1 fact envelope. This module never returns a listing status."""

from __future__ import annotations

import base64
import binascii

from trust_reader import CONTRACT_VERSION, READER_NAME
from trust_reader.expansions import EXPANSIONS
from trust_reader.fields import document_fact
from trust_reader.image_facts import image_fact
from trust_reader.ocr import extract_text

MAX_BYTES = 20 * 1024 * 1024


def envelope(kind: str, document: dict | None, image: dict | None) -> dict:
    return {
        "reader": READER_NAME,
        "contractVersion": CONTRACT_VERSION,
        "kind": kind,
        "document": document,
        "image": image,
        "expansions": EXPANSIONS,
        "limitations": [
            "Cannot certify a Nigerian land-registry original.",
            "Pass is not a field this reader returns.",
            "scene-1 can reject a non-scene. It cannot certify the building at the pin.",
        ],
    }


def read_base64(payload: dict) -> dict:
    kind = payload.get("kind")
    mime_type = payload.get("mimeType") or ""
    claimed = payload.get("claimedDocumentType") or ""
    raw = payload.get("contentBase64") or ""
    if kind not in {"document", "image"} or not isinstance(raw, str) or not raw:
        return envelope(kind if isinstance(kind, str) else "document", None, None) | {
            "document": document_fact("", claimed, "unsupported_type") if kind != "image" else None,
            "image": image_fact(b"", "", "unsupported_type") if kind == "image" else None,
        }
    try:
        data = base64.b64decode(raw, validate=True)
    except (binascii.Error, ValueError):
        error = "unsupported_type"
        data = b""
        if kind == "document":
            return envelope("document", document_fact("", claimed, error), None)
        return envelope("image", None, image_fact(b"", "", error))
    if len(data) > MAX_BYTES:
        error = "file_too_large"
        if kind == "document":
            return envelope("document", document_fact("", claimed, error), None)
        return envelope("image", None, image_fact(data[:0], "", error))
    text, reader_error = extract_text(data, mime_type)
    if kind == "document":
        return envelope("document", document_fact(text, claimed, reader_error), None)
    return envelope("image", None, image_fact(data, text, reader_error))
