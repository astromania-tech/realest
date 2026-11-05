"""Premium slots. Off until a later contract version turns one on."""

EXPANSIONS = [
    {
        "id": "registry_crosscheck",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "This version stores a person's registry file confirmation. LAND_REGISTRY_URL is not called until a later connection.",
    },
    {
        "id": "identity_match",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "NIN or face match is a premium slot. No vendor is selected.",
    },
    {
        "id": "property_photo_classifier",
        "status": "on",
        "affectsDecision": True,
        "note": "scene-1 rejects a blank, a document page, and a file with no scene. A building or plot label is not the building at the pin.",
    },
    {
        "id": "premium_recheck",
        "status": "unavailable",
        "affectsDecision": False,
        "note": "A paid re-read uses this same fact contract. It does not create a second badge.",
    },
]
