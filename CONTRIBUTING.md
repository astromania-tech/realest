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

### Vercel deployment notifications

The `Vercel Deployment Notifications` workflow reports successful Preview/Production deployments to `#realest-releases`. For failed builds, it retrieves all build events available from Vercel, redacts common credential patterns, and uploads the JSON log to `#realest-incidents`. If log retrieval or upload fails, it sends a fallback incident message. Messages intentionally do not include Vercel deployment URLs.

To enable notifications:

1. In Vercel project Git settings, confirm Vercel's `repository_dispatch` events are enabled for the connected GitHub repository. The notification workflow must first exist on the repository's default branch before those events can trigger it.
2. Add these GitHub Actions repository or environment secrets:
   - `VERCEL_PROJECT_ID`: ID of the Vercel project to monitor.
   - `VERCEL_TEAM_ID`: Vercel team ID that owns the project.
   - `VERCEL_TOKEN`: Vercel token with access to read this project's deployment build events.
   - `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`: Slack app OAuth credentials.
   - `SLACK_REFRESH_TOKEN`: Rotating bot OAuth refresh token for an installation that grants `files:write`.
   - `GH_ACTIONS_SECRETS_TOKEN`: Fine-grained GitHub token with Actions secrets read/write access to this repository. The workflow uses it to save Slack's rotated refresh token as the `SLACK_REFRESH_TOKEN` secret.
   - `SLACK_CHANNEL_INCIDENTS`: Slack channel ID for `#realest-incidents`; invite the bot to this channel.
   - `SLACK_WEBHOOK_INCIDENTS`: Existing incident webhook, used if log collection or upload fails.
   - `SLACK_WEBHOOK_RELEASES`: Existing release webhook for concise success notices.
3. Vercel dispatches the project's `ready`, `success`, `error`, and `failed` events to GitHub. Preview-ready and production-success events send a status notice; failure/error events refresh the Slack OAuth token, persist the rotated refresh token to GitHub Actions secrets, and attach the available build log.

The handler accepts Vercel's webhook-style payload and reads the deployment ID from `payload.deployment.id`. It also supports the earlier flat payload format, where the deployment ID is in `client_payload.id`. Slack token rotation must be enabled for the app, and the refresh token must belong to the installed bot with `files:write` granted.

#### Slack OAuth installation and scope updates

The OAuth setup endpoints run only on the production app domain. They require a signed-in RealEST admin and verify the Slack workspace before changing a GitHub secret.

1. In Slack API app settings, add `files:write` under **OAuth & Permissions → Bot Token Scopes**.
2. Register this exact redirect URL under **OAuth & Permissions → Redirect URLs**:
   `https://app.realest.ng/api/slack/oauth/callback`
3. Add these Vercel **Production-only** environment variables:
   - `SLACK_CLIENT_ID`
   - `SLACK_CLIENT_SECRET`
   - `SLACK_WORKSPACE_ID`: Slack workspace ID beginning with `T`.
   - `GH_ACTIONS_SECRETS_TOKEN`: Fine-grained GitHub token restricted to this repository with Actions secrets read/write access. The callback uses it only to update `SLACK_REFRESH_TOKEN`.
4. Sign in to `https://app.realest.ng` as a RealEST admin, then visit:
   `https://app.realest.ng/api/slack/oauth/start`
5. Approve the requested bot permission in Slack. The callback exchanges Slack's one-time authorization code and saves the returned refresh token to this repository's GitHub Actions secret.
6. Confirm the page reports success, then trigger a failed Preview deployment. The evaluation passes only when the notification workflow succeeds and the restricted incident channel receives the attached build log.

Do not configure the production Slack app to use `dev.realest.ng`. Development testing requires a separate Slack app and separate credentials. Never expose the GitHub token through a `NEXT_PUBLIC_` variable or include Slack tokens in logs or source control.

Build output can contain sensitive values even after common credential patterns are redacted. Keep the incident channel restricted and review its access before enabling uploads. This workflow covers build/deployment outcomes; it does not collect runtime logs from an already deployed application.

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