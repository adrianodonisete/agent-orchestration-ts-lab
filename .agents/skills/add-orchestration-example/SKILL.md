---
name: add-orchestration-example
description: Add a new runnable agent orchestration pattern example to this lab (new src/NN-*.ts file, npm script, README section). Use when asked to add, create or demonstrate a new pattern, agent setup or multi-agent workflow.
---

# Add an Orchestration Example

## Steps

1. **Pick the number and name.** Next free `NN` in `src/`, file `src/NN-kebab-name.ts`.
2. **Check it is a distinct pattern.** Read `.agents/rules/orchestration-patterns.md`. If this is a variation of an existing example, extend that file instead or explain the difference in the header.
3. **Write the file** following `.agents/rules/typescript-conventions.md`:

```ts
/**
 * Pattern N: <Name>
 *
 * <What it does, when to use it, what it trades off.>
 *
 *   <ascii flow diagram>
 */
import { generateText, isStepCount, Output } from "ai";
import { z } from "zod";
import { fast, smart } from "./lib/model";
import { webSearch } from "./lib/tools";
import { header, logStep, printUsage } from "./lib/log";

const MAX_ITERATIONS = 3;

header("NN - <Name>");

// ... agents / steps, each call with onStepEnd: logStep("<role>")

printUsage();
```

4. **Respect the rules**:
   - Models only from `src/lib/model.ts`.
   - v7 AI SDK API (`.agents/rules/ai-sdk-v7.md`). LangGraph examples follow `.agents/rules/langgraph.md`.
   - Every loop bounded.
   - Structured handoffs between agents use zod schemas.
   - Need new fake data? Use the `add-mock-tool` skill.
5. **Register the script** in `package.json`:
   `"NN": "tsx --env-file=.env.local src/NN-kebab-name.ts"`
6. **Document it** in `README.md`: add a `### NN - <Name> - \`npm run NN\`` section (what it does + **Use when:**) and update the "Choosing a pattern" list if relevant.
7. **Update indexes**: `.agents/rules/orchestration-patterns.md`, `.agents/rules/project-overview.md`, and `CLAUDE.md` if they list files.

## Checklist

- [ ] Header JSDoc with diagram
- [ ] All LLM calls log via `logStep`
- [ ] Limits on every loop
- [ ] npm script added
- [ ] README section added
- [ ] Pattern table updated
