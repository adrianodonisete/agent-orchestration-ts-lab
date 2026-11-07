# Orchestration Patterns

An **agent** is an LLM in a loop (reason -> tool -> observe -> repeat). **Orchestration** is the control layer: which call runs, when, with what context, how outputs combine.

Two families:

- **Workflows** (02-04): code controls the flow. Predictable, cheap, testable. Default.
- **Agents** (01, 05-08): the LLM controls the flow. Flexible, costlier, less predictable.

Pick the simplest pattern that solves the task. Do not jump to a supervisor or LangGraph when a chain or router is enough.

| # | File | Pattern | Use when |
| - | ---- | ------- | -------- |
| 01 | `src/01-single-agent.ts` | Tool loop | One task, a few tools |
| 02 | `src/02-prompt-chain.ts` | Sequential pipeline + code gate | Steps known and fixed |
| 03 | `src/03-router.ts` | Classifier -> specialist | Input type decides the path |
| 04 | `src/04-parallel.ts` | Fan-out / fan-in | Independent subtasks or perspectives |
| 05 | `src/05-orchestrator-workers.ts` | Plan at runtime -> workers -> synthesizer | Subtasks unknown until runtime |
| 06 | `src/06-evaluator-optimizer.ts` | Generate -> score -> refine | Quality has clear criteria |
| 07 | `src/07-supervisor-handoff.ts` | Agents as tools | Open-ended, multi-skill task |
| 08 | `src/08-langgraph-supervisor.ts` | Stateful graph + interrupt | Memory, pause/resume, human approval |

Shared helpers: `fast()` / `smart()` in `src/lib/model.ts`, mocks in `src/lib/tools.ts`, `logStep` / `printUsage` in `src/lib/log.ts`.
