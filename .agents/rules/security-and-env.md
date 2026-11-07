# Security and Environment

## Secrets

- The OpenRouter key lives in `.env.local` (git-ignored via `.env.*`). Never read, print, log, copy or commit its value.
- `.env.example` documents variables with placeholder values only. Update it when adding a new env var.
- Variables:
  - `OPENROUTER_API_KEY` (required)
  - `FAST_MODEL` (optional, default `openai/gpt-4o-mini`)
  - `SMART_MODEL` (optional, default `anthropic/claude-sonnet-4.5`)
- Env is loaded by Node's `--env-file=.env.local` in the npm scripts. Do not add `dotenv`.

## Tools

- Tools in `src/lib/tools.ts` are mocks. If a real tool is added, validate all inputs with zod and never execute model-provided strings as code, shell commands or raw SQL.
- Destructive or external side-effect tools must go behind a human approval step (see the `interrupt()` pattern in example 08).

## Cost and safety limits

- Every agent loop must be bounded (`isStepCount`, iteration caps). Unbounded loops burn credits.
- Prefer `fast()` models for high-volume calls.

## Network / TLS

If calls fail with `self-signed certificate in certificate chain`, a proxy, VPN or antivirus is intercepting HTTPS. Fix by trusting the OS certificate store (`node --use-system-ca`, Node 22.15+/23.8+) or `NODE_EXTRA_CA_CERTS=<path-to-root-ca.pem>`. Never set `NODE_TLS_REJECT_UNAUTHORIZED=0` in committed code or scripts. See the `troubleshoot-llm-calls` skill.
