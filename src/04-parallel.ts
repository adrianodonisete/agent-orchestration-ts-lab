/**
 * Pattern 4: Parallel fan-out / fan-in
 *
 * Independent agents work on the same input at the same time, then an
 * aggregator merges their results. Faster than sequential, and each
 * reviewer stays focused on one concern.
 *
 *            -> security    ->
 *   input    -> performance -> aggregator -> report
 *            -> style       ->
 */
import { generateText, Output } from "ai";
import { z } from "zod";
import { fast, smart } from "./lib/model";
import { header, logStep, printUsage } from "./lib/log";

const code = `
import express from "express";
import { db } from "./db";

const app = express();

app.get("/user", async (req, res) => {
  const users = await db.query("SELECT * FROM users WHERE name = '" + req.query.name + "'");
  for (let i = 0; i < users.length; i++) {
    users[i].orders = await db.query("SELECT * FROM orders WHERE user_id = " + users[i].id);
  }
  res.send(users);
});

app.listen(3000);
`;

const findingsSchema = z.object({
  findings: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high", "critical"]),
      issue: z.string(),
      fix: z.string(),
    }),
  ),
});

const reviewers = {
  security: "You are a security reviewer. Only report security issues (injection, auth, data exposure).",
  performance: "You are a performance reviewer. Only report performance issues (N+1, blocking, over-fetching).",
  style: "You are a code style reviewer. Only report readability, naming and maintainability issues.",
} as const;

header("04 - Parallel reviewers");

const started = Date.now();
const reviews = await Promise.all(
  Object.entries(reviewers).map(async ([name, system]) => {
    const { output } = await generateText({
      model: fast(),
      system,
      output: Output.object({ schema: findingsSchema }),
      onStepEnd: logStep(name),
      prompt: `Review this code:\n${code}`,
    });
    return { reviewer: name, ...output };
  }),
);
console.log(`\nAll reviewers finished in ${Date.now() - started}ms (in parallel)`);

for (const r of reviews) {
  console.log(`\n[${r.reviewer}] ${r.findings.length} findings`);
  for (const f of r.findings) console.log(`  - (${f.severity}) ${f.issue}`);
}

const { text: report } = await generateText({
  model: smart(),
  system:
    "You merge code reviews into one report. Deduplicate, sort by severity, and give a short fixed version of the code.",
  onStepEnd: logStep("aggregator"),
  prompt: `Code:\n${code}\n\nReviews:\n${JSON.stringify(reviews, null, 2)}`,
});

console.log(`\nFinal report:\n\n${report}`);
printUsage();
