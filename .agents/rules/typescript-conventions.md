# TypeScript Conventions

- ESM only. Top-level `await` is used in example files; do not wrap in `main()`.
- Imports are extensionless (`./lib/model`), resolved by `moduleResolution: "bundler"` and `tsx`.
- `strict` mode is on. No `any` unless unavoidable at a library boundary; prefer narrow local types (see `StepLike` in `src/lib/log.ts`).
- Use `zod` schemas for every tool `inputSchema` and every structured output. Add `.describe()` when the field meaning is not obvious to the model.
- Use `as const` for literal maps (e.g. reviewer prompts) so keys and values stay typed.
- Example file structure, in order:
  1. Header JSDoc: pattern name, one-paragraph explanation, ASCII flow diagram
  2. Imports
  3. Constants / inputs (task, limits)
  4. Agent or step definitions
  5. `header("NN - Pattern name")`, then execution with console output
  6. `printUsage()` at the end
- Naming: files `NN-kebab-case.ts`; agent roles in `logStep()` are short lowercase nouns (`"writer"`, `"worker:a"`).
- Comments only for constraints the code cannot show (why a gate exists, why execution pauses). No narration comments.
- Keep each example under ~150 lines. If it grows, the example is teaching too much at once.
