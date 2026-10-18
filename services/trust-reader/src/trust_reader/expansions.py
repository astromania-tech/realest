"""Premium slots. Off until a later contract version turns one on."""

EXPANSIONS = [
    {
        "id": "registry_crosscheck",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "No state land-registry API is selected. A later contract can add one without changing who writes the badge.",
    },
    {
        "id": "identity_match",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "NIN or face match is a premium slot. No vendor is selected.",
    },
    {
        "id": "property_photo_classifier",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "The field visit confirms the building. This slot stays off until a pinned local model exists.",
    },
    {
        "id": "premium_recheck",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "A paid re-read uses this same fact contract. It does not create a second badge.",
    },
]
