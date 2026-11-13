# Contributing to RealEST

## Running locally

**Prerequisites:** Node.js 20+. Most scripts run directly and use environment variables from your shell or local environment files. Scripts ending in `:local` load secrets through [Doppler](https://docs.doppler.com/docs/install-cli).

```bash
# 1. Install dependencies
git clone https://github.com/x17green/realest.git
cd realest
npm install

# 2. Run directly with your local environment
npm run dev
```

To load the team's Doppler secrets instead, install and log in to Doppler once per machine:

```bash
brew install dopplerhq/cli/doppler   # macOS
# Linux: https://docs.doppler.com/docs/install-cli
doppler login

# Select the realest-ng / develop config from doppler.yaml
doppler setup

# Doppler-backed equivalent
npm run dev:local
```

### Mode shortcuts

```bash
npm run dev:demo         # full app with auth enabled
npm run dev:coming-soon  # waitlist-only landing page
npm run dev:full-site    # complete site
```

Append `:local` to these mode shortcuts to run them with Doppler, for example `npm run dev:demo:local`.

### GitHub Codespaces

Add a Codespace secret named `DOPPLER_TOKEN` (scoped to this repo) in your GitHub settings with a Doppler Service Token for the `develop` config. The devcontainer installs Doppler automatically on creation. Use the `:local` script variants to load these secrets.

---

## Workflow

1. Keep changes focused and commit them in logical batches.
2. Run `npm run lint` and `npm run typecheck` before opening a pull request.
3. For API route changes, update the OpenAPI spec with the canonical generator command:

```bash
node scripts/generate-api-spec.ts
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
- `node scripts/generate-api-spec.ts` for API changes
- Update README or docs when the workflow changes