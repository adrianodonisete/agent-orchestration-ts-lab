---
name: troubleshoot-llm-calls
description: Diagnose and fix failing LLM calls in this project (AI_RetryError, AI_APICallError, TLS/certificate errors, 401/402/404 from OpenRouter, structured output parse failures, runaway loops). Use when an npm run NN example errors or behaves unexpectedly.
---

# Troubleshoot LLM Calls

Read the innermost error (`Last error:` in `AI_RetryError`) first, then match below.

## `self-signed certificate in certificate chain` / `unable to get local issuer certificate`

Cause: corporate proxy, VPN or antivirus (HTTPS scanning) re-signs TLS traffic. Windows trusts its root CA; Node uses its own CA bundle and does not.

Fix, in order of preference:

1. Use the OS certificate store (Node 22.15+ / 23.8+ / 24):
   - Per script: `"02": "tsx --use-system-ca --env-file=.env.local src/02-prompt-chain.ts"`
   - Or once per shell: `export NODE_OPTIONS=--use-system-ca` (bash) / `$env:NODE_OPTIONS="--use-system-ca"` (PowerShell)
2. Point Node to the proxy root CA explicitly: export it as Base-64 `.cer`/`.pem` from `certmgr.msc` (Trusted Root Certification Authorities, the proxy/antivirus issuer), then `NODE_EXTRA_CA_CERTS=C:\path\root-ca.pem`.
3. Antivirus only: disable HTTPS/SSL scanning for `node.exe` or add `openrouter.ai` to exclusions.

Never commit `NODE_TLS_REJECT_UNAUTHORIZED=0`; it disables TLS verification for all traffic.

Quick check: `node --use-system-ca -e "fetch('https://openrouter.ai/api/v1/models').then(r=>console.log(r.status))"` should print `200`.

## `OPENROUTER_API_KEY missing`

`.env.local` missing or not loaded. Scripts must use `--env-file=.env.local`; run from the project root.

## 401 Unauthorized

Key invalid or revoked. Create a new key at openrouter.ai/keys; update `.env.local` only.

## 402 Payment Required

No OpenRouter credits for a paid model. Add credits or set `FAST_MODEL` / `SMART_MODEL` to a `:free` model id.

## 404 / "No endpoints found" / model not found

Model id wrong or retired. Check ids at openrouter.ai/models and update `.env.local`. For tool calling or structured output, pick a model that supports tools.

## Structured output fails (`AI_NoObjectGeneratedError`, schema mismatch)

- Model may not support JSON schema output; switch to a stronger model.
- Simplify the zod schema (fewer nested objects, avoid tight `.max()` constraints) or add guidance in the prompt.

## Agent loops too long / high cost

- Lower `isStepCount(n)` or iteration caps.
- Tighten the system prompt with explicit stop criteria.
- Inspect `logStep` output to see which tool call repeats.

## TypeScript errors after `npm install`

Likely API drift in `ai` or LangGraph. Compare with `.agents/rules/ai-sdk-v7.md`; check current docs via context7 (`/vercel/ai`, `/langchain-ai/langgraphjs`).
