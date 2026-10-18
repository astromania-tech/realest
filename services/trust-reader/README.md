# RealEST trust reader

This process reads a listing file and returns facts. It does not set `live` or `verified`. `lib/trust/policy.ts` applies the rules.

Production is the container. The image installs Tesseract and Poppler, so the Next.js app does not need those binaries.

```bash
docker build -t realest-trust-reader services/trust-reader
docker run --rm -p 4078:4078 -e TRUST_READER_TOKEN="$TRUST_READER_TOKEN" realest-trust-reader
```

Set `TRUST_READER_URL` to that service and the same `TRUST_READER_TOKEN` on the Next.js app. The reader refuses to listen on a non-loopback address without the token.

Local tests use a virtualenv. They do not replace the container.

```bash
python3 -m venv services/trust-reader/.venv
services/trust-reader/.venv/bin/pip install -r services/trust-reader/requirements.txt
npm run test:trust-reader
```

## What the service uses

| Piece | Role |
|---|---|
| This container | The production reader. OCR binaries are inside the image. |
| Pillow | Image open, dHash, EXIF. Pinned in `requirements.txt`. |
| Tesseract English data | Installed by the image. |
| Poppler `pdftotext` | Installed by the image. |
| Postgres and PostGIS | Already in RealEST. This service does not connect. |
| Supabase Storage | Already in RealEST. The app sends file bytes. |

A hosted vision API is not used. Title files stay on this service.

## Premium slots

Each slot is `unavailable` and `affectsDecision: false`.

- `registry_crosscheck`
- `identity_match`
- `property_photo_classifier`
- `premium_recheck`

Turning one on is a contract version bump and a rule change in `lib/trust/policy.ts`.
