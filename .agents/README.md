# Agent files

Persistent guidance for any coding agent working in this repo. Entry points: [`CLAUDE.md`](../CLAUDE.md) (Claude, Cursor) and [`AGENTS.md`](../AGENTS.md) (Codex, Gemini, others).

## Rules (always-on conventions)

| File | Covers |
| ---- | ------ |
| [rules/project-overview.md](rules/project-overview.md) | Stack, layout, commands, design principles |
| [rules/typescript-conventions.md](rules/typescript-conventions.md) | Code style and example file structure |
| [rules/ai-sdk-v7.md](rules/ai-sdk-v7.md) | Correct AI SDK v7 APIs (avoid outdated v4-v6 names) |
| [rules/langgraph.md](rules/langgraph.md) | LangGraph.js state, edges, checkpointer, interrupt |
| [rules/orchestration-patterns.md](rules/orchestration-patterns.md) | The 8 patterns and when to use each |
| [rules/security-and-env.md](rules/security-and-env.md) | Secrets, tool safety, limits, TLS |

## Skills (task playbooks)

Read the matching `SKILL.md` before doing the task.

| Skill | Use when |
| ----- | -------- |
| [skills/choose-orchestration-pattern/SKILL.md](skills/choose-orchestration-pattern/SKILL.md) | User asks which pattern to use, or how to orchestrate agents |
| [skills/add-orchestration-example/SKILL.md](skills/add-orchestration-example/SKILL.md) | Adding a new pattern example (`src/NN-*.ts`) |
| [skills/add-mock-tool/SKILL.md](skills/add-mock-tool/SKILL.md) | An example needs a new fake tool |
| [skills/troubleshoot-llm-calls/SKILL.md](skills/troubleshoot-llm-calls/SKILL.md) | An example fails (TLS, 401/402/404, schema errors, loops) |
