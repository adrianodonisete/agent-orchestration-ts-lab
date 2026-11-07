# Project Overview

Learning lab with runnable examples of LLM agent orchestration patterns in TypeScript.

## Stack

- Node.js 20.6+ (ESM, `"type": "module"`), run with `tsx`
- Vercel AI SDK v7 (`ai`) + `@openrouter/ai-sdk-provider`
- LangGraph.js (`@langchain/langgraph`, `@langchain/openai`) for stateful graphs
- `zod` v4 for tool inputs and structured outputs
- All LLM traffic goes through OpenRouter (`https://openrouter.ai/api/v1`)

## Layout

```
src/
  lib/model.ts     OpenRouter provider, fast()/smart() factories, FAST_MODEL/SMART_MODEL, OPENROUTER_BASE_URL
  lib/tools.ts     Mock tools: getWeather, calculator, webSearch, lookupOrder (deterministic fake data)
  lib/log.ts       header(), logStep(agentName) for onStepEnd, printUsage()
  01-single-agent.ts          tool loop
  02-prompt-chain.ts          sequential pipeline with code gate
  03-router.ts                classifier -> specialist agents
  04-parallel.ts              fan-out reviewers + aggregator
  05-orchestrator-workers.ts  runtime planning -> workers -> synthesizer
  06-evaluator-optimizer.ts   generate -> score -> refine loop
  07-supervisor-handoff.ts    supervisor whose tools are agents
  08-langgraph-supervisor.ts  StateGraph + checkpointer + interrupt (human approval)
README.md          pattern explanations for humans
.agents/           rules and skills for coding agents (see .agents/README.md)
```

## Commands

- `npm install`
- `npm run 01` ... `npm run 08` runs one example (loads `.env.local` via `--env-file`)
- `npm run typecheck` runs `tsc --noEmit`

## Design principles

- One pattern per file. Each example is self-contained and readable top to bottom.
- Examples are educational: favor clarity over abstraction. No frameworks beyond the stack above.
- Mock tools only. Examples must run with just an OpenRouter key, no other external APIs.
- `fast()` for routing, workers, critics. `smart()` for planning, supervising, synthesis.
- Every agent loop has an explicit limit (`stopWhen: isStepCount(n)`, `MAX_ITERATIONS`, `MAX_TURNS`).
- Every LLM call passes `onStepEnd: logStep("<role>")` so the terminal shows what each agent did.
