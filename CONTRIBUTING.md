# Contributing to RealEST

## Workflow

1. Keep changes focused and commit them in logical batches.
2. Run `npm run lint` and `npm run typecheck` before opening a pull request.
3. For API route changes, update the OpenAPI spec with the canonical generator command:

```bash
node scripts/generate-api-spec.mjs
```

4. Do not hand-edit `lib/openapi/generated.json`. Regenerate it from the source routes instead.
5. If your change affects docs or API behavior, update the relevant markdown under `docs/` and the route metadata together.

## API Documentation Rules

- Every route change that affects request or response shapes should be reflected in the generated OpenAPI output.
- Regenerate the spec after API changes and verify the output is clean before committing.
- Keep generated artifacts out of manual commits unless they were regenerated in the same change.

## Pull Request Checklist

- `npm run lint`
- `npm run typecheck`
- `node scripts/generate-api-spec.mjs` for API changes
- Update README or docs when the workflow changes