/**
 * Pattern 7: Supervisor with agents-as-tools
 *
 * The supervisor is an agent whose tools ARE other agents. The LLM decides
 * who to call, in what order, and how many times. Each sub-agent runs its
 * own tool loop with a small, clean context and returns only its result.
 *
 *   supervisor --(tool)--> researcher (webSearch)
 *              --(tool)--> writer
 *              --(tool)--> factChecker (webSearch)
 */
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import { fast, smart } from "./lib/model";
import { webSearch } from "./lib/tools";
import { header, logStep, printUsage } from "./lib/log";

const researcher = tool({
  description: "Research agent. Give it a topic; it searches and returns a list of facts.",
  inputSchema: z.object({ topic: z.string() }),
  execute: async ({ topic }) => {
    const { text } = await generateText({
      model: fast(),
      system: "You are a researcher. Use webSearch, then return facts as bullet points. No opinions.",
      tools: { webSearch },
      stopWhen: isStepCount(4),
      onStepEnd: logStep("researcher"),
      prompt: `Research: ${topic}`,
    });
    return text;
  },
});

const writer = tool({
  description: "Writer agent. Give it facts, audience and length; it returns a polished article.",
  inputSchema: z.object({
    facts: z.string(),
    audience: z.string(),
    words: z.number().int().min(50).max(800),
  }),
  execute: async ({ facts, audience, words }) => {
    const { text } = await generateText({
      model: fast(),
      system: "You are a tech writer. Use only the given facts. Markdown, clear headings.",
      onStepEnd: logStep("writer"),
      prompt: `Audience: ${audience}\nLength: ~${words} words\n\nFacts:\n${facts}`,
    });
    return text;
  },
});

const factChecker = tool({
  description: "Fact-check agent. Give it an article; it returns unsupported or wrong claims.",
  inputSchema: z.object({ article: z.string() }),
  execute: async ({ article }) => {
    const { text } = await generateText({
      model: fast(),
      system:
        "You are a fact checker. Verify claims with webSearch. List unsupported claims, or reply 'ALL CLAIMS SUPPORTED'.",
      tools: { webSearch },
      stopWhen: isStepCount(4),
      onStepEnd: logStep("factChecker"),
      prompt: article,
    });
    return text;
  },
});

header("07 - Supervisor (agents as tools)");

const result = await generateText({
  model: smart(),
  system: `You are a supervisor coordinating a team: researcher, writer, factChecker.
Plan: research first, then write, then fact-check. If the fact checker finds problems, ask the writer to fix them (max 1 retry).
Return the final article only.`,
  tools: { researcher, writer, factChecker },
  stopWhen: isStepCount(10),
  onStepEnd: logStep("supervisor"),
  prompt: "Produce a ~250 word article on solid-state batteries for non-technical investors.",
});

console.log(`\nDelegations: ${result.steps.flatMap((s) => s.toolCalls).map((c) => c.toolName).join(" -> ")}`);
console.log(`\nFinal article:\n\n${result.text}`);
printUsage();
