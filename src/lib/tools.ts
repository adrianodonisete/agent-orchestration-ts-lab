import { tool } from "ai";
import { z } from "zod";

/** Mock tools: deterministic fake data so examples run without external APIs. */

const WEATHER: Record<string, { tempC: number; condition: string }> = {
  lisbon: { tempC: 22, condition: "sunny" },
  oslo: { tempC: 4, condition: "snow" },
  "sao paulo": { tempC: 27, condition: "rain" },
  tokyo: { tempC: 15, condition: "cloudy" },
};

export const getWeather = tool({
  description: "Get current weather for a city. Temperature in Celsius.",
  inputSchema: z.object({ city: z.string().describe("City name, e.g. Lisbon") }),
  execute: async ({ city }) => {
    const data = WEATHER[city.toLowerCase()];
    return data ? { city, ...data } : { city, error: "unknown city" };
  },
});

export const calculator = tool({
  description: "Do basic arithmetic on two numbers.",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
    op: z.enum(["add", "subtract", "multiply", "divide"]),
  }),
  execute: async ({ a, b, op }) => {
    const ops = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: b === 0 ? NaN : a / b,
    };
    return { result: ops[op] };
  },
});

const KNOWLEDGE: Array<{ keywords: string[]; facts: string[] }> = [
  {
    keywords: ["solid-state", "battery", "batteries"],
    facts: [
      "Solid-state batteries replace liquid electrolyte with a solid one (ceramic, glass or polymer).",
      "They promise higher energy density (up to ~2x) and lower fire risk than lithium-ion.",
      "Main challenges: dendrite formation, manufacturing cost, and performance at low temperatures.",
      "Toyota, Samsung SDI and QuantumScape target commercial EV cells in the late 2020s.",
    ],
  },
  {
    keywords: ["agent", "orchestration", "multi-agent", "llm"],
    facts: [
      "LLM agents run a loop: reason, call a tool, observe the result, repeat.",
      "Common orchestration patterns: chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.",
      "Multi-agent systems trade higher cost and latency for specialization and smaller contexts.",
    ],
  },
  {
    keywords: ["typescript", "javascript", "node"],
    facts: [
      "TypeScript adds static types to JavaScript and compiles to plain JS.",
      "Node.js 20.6+ supports loading env files natively with --env-file.",
    ],
  },
];

export const webSearch = tool({
  description: "Search the web (mock). Returns a list of factual snippets.",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const hits = KNOWLEDGE.filter((k) => k.keywords.some((kw) => q.includes(kw)));
    return hits.length
      ? { query, results: hits.flatMap((h) => h.facts) }
      : { query, results: [], note: "No results. Answer from general knowledge and say so." };
  },
});

const ORDERS: Record<string, { status: string; amount: number; charged: number }> = {
  "A-1001": { status: "delivered", amount: 49.9, charged: 99.8 },
  "A-1002": { status: "shipped", amount: 120, charged: 120 },
};

export const lookupOrder = tool({
  description: "Look up an order by id in the billing database.",
  inputSchema: z.object({ orderId: z.string().describe("Order id, e.g. A-1001") }),
  execute: async ({ orderId }) => {
    const order = ORDERS[orderId.toUpperCase()];
    return order ? { orderId, ...order } : { orderId, error: "order not found" };
  },
});
