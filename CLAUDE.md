# CLAUDE.md

Guidance for AI coding agents (Claude, Cursor, Codex, Gemini, etc.) working in this repository.

**Agent Orchestration Lab**: runnable TypeScript examples of LLM agent orchestration patterns (tool loop, chain, router, parallel, orchestrator-workers, evaluator-optimizer, supervisor, LangGraph stateful graph), using Vercel AI SDK v7 + LangGraph.js over OpenRouter.

## Read first

Before making changes, read the rules in `.agents/rules/`:

| File | Covers |
| ---- | ------ |
| [.agents/rules/project-overview.md](.agents/rules/project-overview.md) | Stack, layout, commands, design principles |
| [.agents/rules/typescript-conventions.md](.agents/rules/typescript-conventions.md) | Code style and example file structure |
| [.agents/rules/ai-sdk-v7.md](.agents/rules/ai-sdk-v7.md) | Correct AI SDK v7 APIs (avoid outdated v4-v6 names) |
| [.agents/rules/langgraph.md](.agents/rules/langgraph.md) | LangGraph.js state, edges, checkpointer, interrupt |
| [.agents/rules/orchestration-patterns.md](.agents/rules/orchestration-patterns.md) | The 8 patterns and when to use each |
| [.agents/rules/security-and-env.md](.agents/rules/security-and-env.md) | Secrets, tool safety, limits, TLS |

Index of all agent files: [.agents/README.md](.agents/README.md)

## Skills

Task playbooks in `.agents/skills/`. Read the matching `SKILL.md` and follow it:

| Skill | Use when |
| ----- | -------- |
| [.agents/skills/choose-orchestration-pattern/SKILL.md](.agents/skills/choose-orchestration-pattern/SKILL.md) | User asks which pattern to use, or how to orchestrate agents |
| [.agents/skills/add-orchestration-example/SKILL.md](.agents/skills/add-orchestration-example/SKILL.md) | Adding a new pattern example (`src/NN-*.ts`) |
| [.agents/skills/add-mock-tool/SKILL.md](.agents/skills/add-mock-tool/SKILL.md) | An example needs a new fake tool |
| [.agents/skills/troubleshoot-llm-calls/SKILL.md](.agents/skills/troubleshoot-llm-calls/SKILL.md) | An example fails (TLS, 401/402/404, schema errors, loops) |

## Quick reference

```bash
npm install
npm run 01 # ... through 08, each runs one example
npm run typecheck
```

- Models: `fast()` / `smart()` from `src/lib/model.ts`, configured via `FAST_MODEL` / `SMART_MODEL` in `.env.local`.
- Tools: mocks in `src/lib/tools.ts`.
- Logging: `onStepEnd: logStep("<role>")` and `printUsage()` from `src/lib/log.ts`.

## Hard rules

- Never read, print or commit `.env.local` or the API key.
- AI SDK v7 only: `isStepCount`, `Output.object`, `onStepEnd`, `inputSchema`.
- Every agent loop is bounded.
- One pattern per file; keep examples self-contained and educational.
- New example = new npm script + README section.
