---
name: choose-orchestration-pattern
description: Pick and explain an agent orchestration pattern for a user task, pointing at the matching src/NN-*.ts example. Use when the user asks how to orchestrate agents, which pattern to use, or how a pattern works.
---

# Choose an Orchestration Pattern

Read `.agents/rules/orchestration-patterns.md` first. Then match the user's task to the smallest pattern that works.

## Decision

1. Steps known and fixed -> **chain** (`npm run 02`)
2. Input type decides the path -> **router** (`npm run 03`)
3. Independent subtasks / multiple perspectives -> **parallel** (`npm run 04`)
4. Subtasks unknown until runtime -> **orchestrator-workers** (`npm run 05`)
5. Quality needs iteration against criteria -> **evaluator-optimizer** (`npm run 06`)
6. Open-ended, several specialties, LLM should delegate -> **supervisor** (`npm run 07`)
7. Needs persistence, pause/resume, or human approval -> **LangGraph** (`npm run 08`)
8. One task, a few tools, no coordination -> **single agent** (`npm run 01`)

If two patterns fit, pick the earlier one (simpler, cheaper).

## How to answer

1. Name the pattern and the example file.
2. One paragraph: what it does and why it fits this task.
3. Point at the key code (orchestrator plan, `Promise.all`, `interrupt()`, agents-as-tools, etc.).
4. Name the trade-off (cost, latency, predictability).
5. Offer to run `npm run NN` or to add a new example via `add-orchestration-example`.

## Do not

- Recommend a supervisor or LangGraph when a chain/router/parallel call is enough.
- Invent a ninth pattern before checking whether an existing example already covers it.
