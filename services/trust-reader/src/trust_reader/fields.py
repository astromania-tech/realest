"""Deterministic document facts from already-extracted text."""

from __future__ import annotations

import re

DOCUMENT_PHRASES: list[tuple[str, str]] = [
    ("certificate of occupancy", "certificate_of_occupancy"),
    ("c of o", "certificate_of_occupancy"),
    ("cofo", "certificate_of_occupancy"),
    ("deed of assignment", "deed_of_assignment"),
    ("survey plan", "survey_plan"),
    ("surveyor", "survey_plan"),
    ("power of attorney", "power_of_attorney"),
    ("lease agreement", "lease_agreement"),
    ("tenancy agreement", "lease_agreement"),
    ("title deed", "title_deed"),
    ("allocation letter", "allocation_letter"),
    ("building permit", "building_permit"),
    ("proof of payment", "proof_of_payment"),
    ("purchase receipt", "purchase_receipt"),
]

TITLE_TYPES = {
    "title_deed",
    "certificate_of_occupancy",
    "deed_of_assignment",
}
SURVEY_TYPES = {"survey", "survey_plan"}

HOLDER_PATTERNS = [
    re.compile(r"(?:name of holder|holder|assignee|lessee|granted to)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{2,80})", re.I),
    re.compile(r"in favour of\s+([A-Za-z][A-Za-z .'-]{2,80})", re.I),
]
PLOT_PATTERNS = [
    re.compile(r"\bplot\s*(?:no\.?|number)?\s*[:#]?\s*([A-Za-z0-9][A-Za-z0-9/-]{1,30})", re.I),
    re.compile(r"\b(?:file|title|plan)\s*(?:no\.?|number)\s*[:#]?\s*([A-Za-z0-9][A-Za-z0-9/-]{2,30})", re.I),
]
LOCATION_PATTERNS = [
    re.compile(r"(?:location|situate(?:d)? at|property address)\s*[:\-]\s*(.{4,120})", re.I),
]
DATE_PATTERN = re.compile(
    r"\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{4}-\d{2}-\d{2})\b",
    re.I,
)


def normalize(value: str) -> str:
    lowered = value.lower()
    cleaned = re.sub(r"[^a-z0-9\s]", " ", lowered)
    return re.sub(r"\s+", " ", cleaned).strip()


def detect_document_type(text: str) -> str:
    normalized = normalize(text)
    best_at = None
    best_type = "unknown"
    for phrase, document_type in DOCUMENT_PHRASES:
        at = normalized.find(phrase)
        if at == -1:
            continue
        if best_at is None or at < best_at:
            best_at = at
            best_type = document_type
    return best_type


def type_matches(claimed: str, detected: str) -> bool:
    if not claimed or detected == "unknown":
        return False
    if claimed == detected:
        return True
    if claimed == "title_deed" and detected in TITLE_TYPES:
        return True
    if claimed in SURVEY_TYPES and detected in SURVEY_TYPES:
        return True
    return False


def _first_group(patterns: list[re.Pattern[str]], text: str) -> str | None:
    for pattern in patterns:
        match = pattern.search(text)
        if match:
            value = re.sub(r"\s+", " ", match.group(1)).strip(" .,-")
            if value:
                return value[:120]
    return None


def extract_fields(text: str) -> dict[str, str | None]:
    return {
        "holderName": _first_group(HOLDER_PATTERNS, text),
        "plotOrTitleNumber": _first_group(PLOT_PATTERNS, text),
        "locationText": _first_group(LOCATION_PATTERNS, text),
        "issueDate": DATE_PATTERN.search(text).group(1) if DATE_PATTERN.search(text) else None,
    }


def document_fact(text: str, claimed_type: str, reader_error: str | None) -> dict:
    excerpt = re.sub(r"\s+", " ", text).strip()[:2000]
    detected = detect_document_type(text) if excerpt else "unknown"
    readable = reader_error is None and len(excerpt) >= 40 and detected != "unknown"
    return {
        "detectedType": detected,
        "claimedType": claimed_type,
        "typeMatch": readable and type_matches(claimed_type, detected),
        "fields": extract_fields(text) if readable else {
            "holderName": None,
            "plotOrTitleNumber": None,
            "locationText": None,
            "issueDate": None,
        },
        "textExcerpt": excerpt,
        "readable": readable,
        "readerError": reader_error if reader_error else (None if readable else "low_text"),
    }
