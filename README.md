# Agent Orchestration Lab (TypeScript + OpenRouter)

Runnable examples of the main agent orchestration patterns, from a single tool-using agent up to a stateful multi-agent graph with human approval.

- **Agent** = LLM in a loop: reason -> call tool -> observe result -> repeat -> answer.
- **Orchestration** = the control layer deciding which agent/LLM call runs, when, with what context, and how outputs are combined.

Two families:

- **Workflows** (examples 02-04): your code controls the flow. Predictable, cheap, testable. Default choice.
- **Agents** (examples 01, 05-08): the LLM controls the flow. Flexible, but costlier and less predictable.

Start with the simplest pattern that solves the task.

## Setup

```bash
npm install
cp .env.example .env.local   # then put your OpenRouter key in .env.local
npm run 01
```

Requires Node 20.6+ (uses `--env-file`). Models are configurable in `.env.local`:

- `FAST_MODEL` (default `openai/gpt-4o-mini`): routing, workers, critics.
- `SMART_MODEL` (default `anthropic/claude-sonnet-4.5`): planning, supervising, synthesis.

Any model id from [openrouter.ai/models](https://openrouter.ai/models) works.

## Project layout

```
src/
  lib/model.ts     OpenRouter provider + fast()/smart() model factories
  lib/tools.ts     Mock tools (weather, calculator, webSearch, lookupOrder)
  lib/log.ts       Step logger (tool calls, text, token usage)
  01-...08-*.ts    One pattern per file
```

## Patterns

### 01 - Single agent (tool loop) - `npm run 01`
`generateText` + `tools` + `stopWhen: isStepCount(n)`. The model decides to call `getWeather` twice and `calculator`, then answers. Watch the step log to see the loop.
**Use when:** one task, a few tools.

### 02 - Prompt chain - `npm run 02`
Outline -> code gate -> draft -> polish. Each output feeds the next step; a deterministic check between steps fails fast.
**Use when:** steps are known and fixed.

### 03 - Router - `npm run 03`
Cheap classifier with structured output (`Output.object`) picks `billing | tech | general`; each specialist has its own prompt and only its own tools.
**Use when:** input type decides the path; also for routing easy/hard queries to cheap/strong models.

### 04 - Parallel fan-out / fan-in - `npm run 04`
Security, performance and style reviewers run with `Promise.all`, then an aggregator merges and deduplicates.
**Use when:** independent subtasks or multiple perspectives; speed matters.

### 05 - Orchestrator-workers - `npm run 05`
A strong model plans subtasks at runtime (structured JSON), workers execute them with tools in clean contexts, a synthesizer writes the final briefing.
**Use when:** subtasks are not known until runtime (research, multi-file changes).

### 06 - Evaluator-optimizer - `npm run 06`
Generator writes code, evaluator scores it against explicit criteria, loop repeats with feedback until `score >= 8` or 3 iterations.
**Use when:** quality has clear criteria and benefits from iteration.

### 07 - Supervisor (agents as tools) - `npm run 07`
The supervisor's tools are `researcher`, `writer` and `factChecker` agents. The LLM decides delegation order and retries; each sub-agent returns only its result, keeping the supervisor's context small.
**Use when:** open-ended tasks that need several specialties.

### 08 - LangGraph stateful graph - `npm run 08`
`StateGraph` with shared state, LLM-driven conditional edges, a `MemorySaver` checkpointer and `interrupt()` for human approval. Type `y` to approve or write feedback to send it back to the writer.
**Use when:** production flows needing persistence, pause/resume, approvals, or explicit loops.

## Choosing a pattern

```
fixed steps?              -> chain
input decides path?       -> router
independent subtasks?     -> parallel
subtasks unknown upfront? -> orchestrator-workers
quality via iteration?    -> evaluator-optimizer
open-ended, multi-skill?  -> supervisor
needs memory/approval?    -> LangGraph
```

## Production concerns

- **Limits:** always set `stopWhen`, iteration caps (`MAX_ITERATIONS`, `MAX_TURNS`) and timeouts (`abortSignal: AbortSignal.timeout(ms)`). Agents can loop forever.
- **Context:** pass each sub-agent only what it needs, not the full history.
- **Structured handoffs:** use zod schemas between agents instead of free text.
- **Observability:** log every step (`onStepEnd`), tool calls, tokens and latency; consider Langfuse or LangSmith.
- **Cost:** cheap models for routing/workers, strong models for planning/synthesis.
- **Evals:** keep a small fixed test set per pattern; rerun after every prompt change.
- **Failure handling:** `maxRetries` on calls, validate tool inputs/outputs, fall back to a simpler path.
- **Security:** tools run real code. Validate inputs, scope permissions, require human approval for destructive actions (see example 08).
