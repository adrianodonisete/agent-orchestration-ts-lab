# LangGraph.js Usage

Used only in `src/08-langgraph-supervisor.ts` (and any future stateful-graph examples).

## Model

LangChain models talk to OpenRouter through the OpenAI-compatible endpoint:

```ts
import { ChatOpenAI } from "@langchain/openai";
import { OPENROUTER_BASE_URL, SMART_MODEL } from "./lib/model";

const llm = new ChatOpenAI({
  model: SMART_MODEL,
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: { baseURL: OPENROUTER_BASE_URL },
});
```

Structured routing: `llm.withStructuredOutput(zodSchema, { name: "route" })`.

## Graph rules

- State is defined with `Annotation.Root`. Every field that nodes overwrite needs `reducer: (_, next) => next` and a `default`.
- Counters use an additive reducer (`(prev, next) => prev + next`) and are used as loop guards (`MAX_TURNS`).
- Nodes return partial state updates, never the whole state.
- Conditional edges list their possible targets explicitly: `addConditionalEdges("supervisor", fn, ["a", "b"])`.
- Every cycle must have a guard that eventually reaches `END` or a human step.
- Human-in-the-loop: call `interrupt(payload)` inside a node; compile with a checkpointer (`MemorySaver`); resume with `graph.invoke(new Command({ resume: value }), config)` using the same `thread_id`.
- Do not wrap `interrupt()` in try/catch; it works by throwing internally.
- Detect a pause via `graph.getState(config)`: `snapshot.next.length > 0` and `snapshot.tasks[].interrupts`.
