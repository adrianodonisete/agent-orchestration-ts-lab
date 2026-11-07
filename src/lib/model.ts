import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY missing. Add it to .env.local (see .env.example).");
}

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const FAST_MODEL = process.env.FAST_MODEL ?? "openai/gpt-4o-mini";
export const SMART_MODEL = process.env.SMART_MODEL ?? "anthropic/claude-sonnet-4.5";

export const openrouter = createOpenRouter({ apiKey });

/** Cheap + fast: routing, workers, critics. */
export const fast = () => openrouter(FAST_MODEL);

/** Strong: planning, supervising, final synthesis. */
export const smart = () => openrouter(SMART_MODEL);
