# route-lockdown eval

Measures whether coming-soon lockdown pass/fail logic matches real allowlist semantics.

## Run

```bash
npm run eval:route-lockdown
```

Pass threshold: `1.0` (every case).

Deterministic. No LLM. Guards the bug where `/` (HTTP 200 coming-soon) and `/not-found` (intentional 404) failed the lockdown harness even though those routes were working.
