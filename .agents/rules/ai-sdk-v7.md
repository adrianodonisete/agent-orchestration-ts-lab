# Vercel AI SDK v7 Usage

This project uses `ai` v7. Many tutorials and model training data show v4-v6 APIs. Use the v7 names below.

| Use (v7)                                 | Do not use (older)                  |
| ---------------------------------------- | ----------------------------------- |
| `stopWhen: isStepCount(n)`               | `maxSteps: n`, `stepCountIs(n)`     |
| `generateText({ output: Output.object({ schema }) })` -> `result.output` | `generateObject({ schema })` -> `result.object` |
| `onStepEnd`                              | `onStepFinish` (deprecated alias)   |
| `tool({ inputSchema, execute })`         | `tool({ parameters, execute })`     |
| `usage.inputTokens` / `usage.outputTokens` | `usage.promptTokens` / `completionTokens` |

## Patterns

Tool loop:

```ts
import { generateText, isStepCount } from "ai";
import { fast } from "./lib/model";
import { logStep } from "./lib/log";

const result = await generateText({
  model: fast(),
  system: "...",
  tools: { getWeather, calculator },
  stopWhen: isStepCount(6),
  onStepEnd: logStep("agent"),
  prompt: "...",
});
```

Structured output:

```ts
import { generateText, Output } from "ai";
import { z } from "zod";

const { output } = await generateText({
  model: fast(),
  output: Output.object({ schema: z.object({ category: z.enum(["a", "b"]) }) }),
  prompt: "...",
});
```

Agent as a tool (supervisor pattern): a `tool()` whose `execute` runs its own `generateText` with its own tools and step limit, returning only `text`.

## Rules

- Always get models from `src/lib/model.ts` (`fast()` / `smart()`). Never hardcode a provider or API key in an example.
- Always set `stopWhen` when `tools` are passed.
- Parallel calls use `Promise.all` over independent `generateText` calls.
- When unsure about an API, check current docs (context7 library id `/vercel/ai`) before writing code.
