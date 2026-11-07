/**
 * Pattern 6: Evaluator-optimizer
 *
 * A generator produces output, an evaluator scores it against explicit
 * criteria, and the loop repeats with feedback until it passes or the
 * iteration budget runs out.
 *
 *   generator -> evaluator -> pass? -> done
 *        ^                      | no
 *        +------ feedback ------+
 */
import { generateText, Output } from "ai";
import { z } from "zod";
import { fast, smart } from "./lib/model";
import { header, logStep, printUsage } from "./lib/log";

const MAX_ITERATIONS = 3;
const PASS_SCORE = 8;

const task = `Write a TypeScript function \`retry\` that retries an async function with exponential backoff.
Requirements: generic return type, configurable maxAttempts and baseDelayMs, jitter, rethrows the last error, JSDoc comment.`;

const criteria = `- Correct TypeScript, compiles under strict mode
- Generic over the return type
- maxAttempts and baseDelayMs are configurable with defaults
- Exponential backoff with jitter
- Rethrows the last error after the final attempt
- Has a JSDoc comment
- No unnecessary dependencies`;

header("06 - Evaluator-optimizer");

let draft = (
  await generateText({
    model: fast(),
    system: "You are a TypeScript engineer. Return only a single code block.",
    onStepEnd: logStep("generator"),
    prompt: task,
  })
).text;

for (let i = 1; i <= MAX_ITERATIONS; i++) {
  const { output: review } = await generateText({
    model: smart(),
    system: "You are a strict code reviewer. Score honestly; 10 means production-ready.",
    output: Output.object({
      schema: z.object({
        score: z.number().min(0).max(10),
        issues: z.array(z.string()),
        feedback: z.string(),
      }),
    }),
    onStepEnd: logStep("evaluator"),
    prompt: `Criteria:\n${criteria}\n\nCode:\n${draft}`,
  });

  console.log(`\n[iteration ${i}] score=${review.score}`);
  for (const issue of review.issues) console.log(`  - ${issue}`);

  if (review.score >= PASS_SCORE) {
    console.log("  passed");
    break;
  }
  if (i === MAX_ITERATIONS) {
    console.log("  budget exhausted, returning best effort");
    break;
  }

  draft = (
    await generateText({
      model: fast(),
      system: "You are a TypeScript engineer. Return only a single code block.",
      onStepEnd: logStep("generator"),
      prompt: `Task:\n${task}\n\nPrevious attempt:\n${draft}\n\nReviewer feedback:\n${review.feedback}\n\nFix every issue.`,
    })
  ).text;
}

console.log(`\nFinal code:\n\n${draft}`);
printUsage();
