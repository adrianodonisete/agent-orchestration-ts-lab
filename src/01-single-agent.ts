/**
 * Pattern 1: Single agent (tool loop)
 *
 * The LLM decides which tools to call, the SDK executes them and feeds the
 * results back, until the model answers or the step limit is hit.
 *
 *   goal -> LLM -> tool call -> result -> LLM -> ... -> final answer
 */
import { generateText, isStepCount } from "ai";
import { fast } from "./lib/model";
import { calculator, getWeather } from "./lib/tools";
import { header, logStep, printUsage } from "./lib/log";

header("01 - Single agent with tools");

const result = await generateText({
  model: fast(),
  system:
    "You are a helpful assistant. Use tools for facts and math; never guess numbers.",
  tools: { getWeather, calculator },
  stopWhen: isStepCount(6),
  onStepEnd: logStep("agent"),
  prompt:
    "What is the temperature difference between Lisbon and Oslo right now? Give it in Celsius and Fahrenheit.",
});

console.log(`\nSteps taken: ${result.steps.length}`);
console.log(`\nFinal answer:\n${result.text}`);
printUsage();
