/**
 * Pattern 3: Router
 *
 * A cheap classifier decides which specialist handles the input. Each
 * specialist has its own focused prompt and only the tools it needs.
 *
 *   input -> classifier -> billing | tech | general agent
 */
import { generateText, isStepCount, Output } from "ai";
import { z } from "zod";
import { fast } from "./lib/model";
import { lookupOrder, webSearch } from "./lib/tools";
import { header, logStep, printUsage } from "./lib/log";

type Category = "billing" | "tech" | "general";

const classify = async (message: string) => {
  const { output } = await generateText({
    model: fast(),
    output: Output.object({
      schema: z.object({
        category: z.enum(["billing", "tech", "general"]),
        reason: z.string(),
      }),
    }),
    prompt: `Classify this customer message.
- billing: payments, charges, refunds, orders
- tech: bugs, errors, setup, how the product works technically
- general: anything else

Message: ${message}`,
  });
  return output;
};

const specialists: Record<Category, (message: string) => Promise<string>> = {
  billing: async (message) =>
    (
      await generateText({
        model: fast(),
        system:
          "You are a billing specialist. Always look up the order before answering. Be precise with amounts.",
        tools: { lookupOrder },
        stopWhen: isStepCount(4),
        onStepEnd: logStep("billing"),
        prompt: message,
      })
    ).text,

  tech: async (message) =>
    (
      await generateText({
        model: fast(),
        system: "You are a senior support engineer. Give concrete, numbered troubleshooting steps.",
        tools: { webSearch },
        stopWhen: isStepCount(4),
        onStepEnd: logStep("tech"),
        prompt: message,
      })
    ).text,

  general: async (message) =>
    (
      await generateText({
        model: fast(),
        system: "You are a friendly assistant. Keep answers short.",
        onStepEnd: logStep("general"),
        prompt: message,
      })
    ).text,
};

const messages = [
  "I was charged twice for order A-1001, can you check?",
  "My Node app crashes saying OPENROUTER_API_KEY is undefined even though I have a .env file.",
  "What are your opening hours?",
];

header("03 - Router");

for (const message of messages) {
  console.log(`\n> ${message}`);
  const route = await classify(message);
  console.log(`  route: ${route.category} (${route.reason})`);
  const answer = await specialists[route.category](message);
  console.log(`\n${answer}\n${"-".repeat(70)}`);
}

printUsage();
