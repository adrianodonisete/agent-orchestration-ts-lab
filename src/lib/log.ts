type StepLike = {
  text?: string;
  toolCalls?: ReadonlyArray<{ toolName: string; input?: unknown }>;
  toolResults?: ReadonlyArray<{ toolName: string; output?: unknown }>;
  usage?: { inputTokens?: number; outputTokens?: number };
};

const totals = { inputTokens: 0, outputTokens: 0, steps: 0 };

const short = (value: unknown, max = 160) => {
  const s = typeof value === "string" ? value : JSON.stringify(value);
  return s.length > max ? `${s.slice(0, max)}...` : s;
};

/** Returns an `onStepEnd` callback that prints each agent step and accumulates token usage. */
export const logStep = (agent: string) => (step: StepLike) => {
  totals.steps++;
  totals.inputTokens += step.usage?.inputTokens ?? 0;
  totals.outputTokens += step.usage?.outputTokens ?? 0;

  for (const call of step.toolCalls ?? []) {
    console.log(`  [${agent}] -> tool ${call.toolName}(${short(call.input)})`);
  }
  for (const result of step.toolResults ?? []) {
    console.log(`  [${agent}] <- ${result.toolName}: ${short(result.output)}`);
  }
  if (step.text) {
    console.log(`  [${agent}] text: ${short(step.text)}`);
  }
};

export const header = (title: string) => {
  console.log(`\n${"=".repeat(70)}\n${title}\n${"=".repeat(70)}`);
};

export const printUsage = () => {
  console.log(
    `\n[usage] steps=${totals.steps} input=${totals.inputTokens} output=${totals.outputTokens} tokens`,
  );
};
