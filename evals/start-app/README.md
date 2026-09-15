# start-app eval

Measures whether a fresh clone can find and trust the start path.

## Run

```bash
node evals/start-app/run.mjs
```

Pass threshold: `1.0` (every case).

This eval is deterministic on purpose. It does not call an LLM. The quality bar is "a cloner can start the app from the files in git," which is same-input-same-output.
