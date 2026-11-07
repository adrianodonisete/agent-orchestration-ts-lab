/**
 * Pattern 5: Orchestrator-workers
 *
 * Unlike the parallel pattern, the subtasks are NOT known in advance.
 * A strong "orchestrator" model plans them at runtime, cheap workers
 * execute them (each with tools and a clean context), and a synthesizer
 * combines the results.
 *
 *   task -> orchestrator (plan) -> worker 1..N -> synthesizer -> answer
 */
import { generateText, isStepCount, Output } from "ai";
import { z } from "zod";
import { fast, smart } from "./lib/model";
import { webSearch } from "./lib/tools";
import { header, logStep, printUsage } from "./lib/log";

const task =
  "Write a short briefing for a CTO deciding whether to invest in solid-state battery suppliers for an EV fleet.";

header("05 - Orchestrator-workers");

console.log("\n[orchestrator] planning");
const { output: plan } = await generateText({
  model: smart(),
  output: Output.object({
    schema: z.object({
      subtasks: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            instructions: z.string().describe("Self-contained instructions for a worker"),
          }),
        )
        .max(4),
    }),
  }),
  prompt: `Break this task into 2-4 independent research subtasks. Each worker only sees its own instructions.\n\nTask: ${task}`,
});

for (const st of plan.subtasks) console.log(`  - ${st.id}: ${st.title}`);

console.log("\n[workers] executing");
const results = await Promise.all(
  plan.subtasks.map(async (st) => {
    const { text } = await generateText({
      model: fast(),
      system: "You are a research worker. Use webSearch, then answer in 3-6 bullet points with facts only.",
      tools: { webSearch },
      stopWhen: isStepCount(4),
      onStepEnd: logStep(`worker:${st.id}`),
      prompt: st.instructions,
    });
    return { ...st, result: text };
  }),
);

console.log("\n[synthesizer] combining");
const { text: briefing } = await generateText({
  model: smart(),
  system: "You write concise executive briefings: summary, key facts, risks, recommendation.",
  onStepEnd: logStep("synthesizer"),
  prompt: `Task: ${task}\n\nWorker results:\n${results
    .map((r) => `## ${r.title}\n${r.result}`)
    .join("\n\n")}`,
});

console.log(`\nBriefing:\n\n${briefing}`);
printUsage();
