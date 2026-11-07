/**
 * Pattern 8: Stateful graph with LangGraph.js
 *
 * Nodes are agents, edges are transitions, and all nodes read/write one
 * shared state object. Adds what plain loops lack:
 *   - checkpointer: state saved after every node (pause/resume, memory per thread)
 *   - interrupt(): pause for a human decision, then resume with Command
 *   - conditional edges + loops with explicit guards
 *
 *   START -> supervisor -> researcher -> supervisor
 *                       -> writer     -> supervisor
 *                       -> humanReview -> approved? END : writer
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import {
  Annotation,
  Command,
  END,
  interrupt,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { FAST_MODEL, OPENROUTER_BASE_URL, SMART_MODEL } from "./lib/model";
import { header } from "./lib/log";

const MAX_TURNS = 8;

const llm = (model: string) =>
  new ChatOpenAI({
    model,
    temperature: 0.3,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });

const State = Annotation.Root({
  task: Annotation<string>,
  research: Annotation<string>({ reducer: (_, next) => next, default: () => "" }),
  draft: Annotation<string>({ reducer: (_, next) => next, default: () => "" }),
  humanFeedback: Annotation<string>({ reducer: (_, next) => next, default: () => "" }),
  approved: Annotation<boolean>({ reducer: (_, next) => next, default: () => false }),
  next: Annotation<"researcher" | "writer" | "humanReview">({
    reducer: (_, next) => next,
    default: () => "researcher",
  }),
  turns: Annotation<number>({ reducer: (prev, next) => prev + next, default: () => 0 }),
});

type GraphState = typeof State.State;

const routeSchema = z.object({
  next: z.enum(["researcher", "writer", "humanReview"]),
  reason: z.string(),
});

const supervisor = async (state: GraphState) => {
  if (state.turns >= MAX_TURNS) {
    console.log("[supervisor] turn limit reached -> humanReview");
    return { next: "humanReview" as const, turns: 1 };
  }

  const router = llm(SMART_MODEL).withStructuredOutput(routeSchema, { name: "route" });
  const decision = await router.invoke(
    `You supervise a researcher and a writer. Decide the next step.
- researcher: if research is missing or insufficient
- writer: if research exists but there is no draft, or the human asked for changes
- humanReview: if a draft exists that addresses all feedback

Task: ${state.task}
Research: ${state.research ? "present" : "missing"}
Draft: ${state.draft ? "present" : "missing"}
Human feedback: ${state.humanFeedback || "none"}`,
  );

  console.log(`[supervisor] -> ${decision.next} (${decision.reason})`);
  return { next: decision.next, turns: 1 };
};

const researcher = async (state: GraphState) => {
  console.log("[researcher] working");
  const res = await llm(FAST_MODEL).invoke(
    `List 5-8 concise, factual bullet points needed to complete this task:\n${state.task}`,
  );
  return { research: String(res.content) };
};

const writer = async (state: GraphState) => {
  console.log("[writer] working");
  const res = await llm(FAST_MODEL).invoke(
    `Task: ${state.task}

Research:
${state.research}

${state.draft ? `Previous draft:\n${state.draft}\n\nHuman feedback to apply:\n${state.humanFeedback}` : ""}

Write the deliverable in markdown.`,
  );
  return { draft: String(res.content), humanFeedback: "" };
};

const humanReview = (state: GraphState) => {
  // Execution pauses here; the checkpointer persists state until we resume with Command.
  const decision = interrupt<{ draft: string }, { approved: boolean; feedback?: string }>({
    draft: state.draft,
  });
  return { approved: decision.approved, humanFeedback: decision.feedback ?? "" };
};

const graph = new StateGraph(State)
  .addNode("supervisor", supervisor)
  .addNode("researcher", researcher)
  .addNode("writer", writer)
  .addNode("humanReview", humanReview)
  .addEdge(START, "supervisor")
  .addConditionalEdges("supervisor", (s) => s.next, ["researcher", "writer", "humanReview"])
  .addEdge("researcher", "supervisor")
  .addEdge("writer", "supervisor")
  .addConditionalEdges("humanReview", (s) => (s.approved ? END : "writer"), ["writer", END])
  .compile({ checkpointer: new MemorySaver() });

header("08 - LangGraph supervisor with human-in-the-loop");

const config = { configurable: { thread_id: `demo-${Date.now()}` } };
const rl = createInterface({ input: stdin, output: stdout });

let input: Partial<GraphState> | Command = {
  task: "Write a 150-word internal announcement introducing our new AI agent orchestration lab to engineers.",
};

while (true) {
  await graph.invoke(input, config);
  const snapshot = await graph.getState(config);

  if (snapshot.next.length === 0) {
    console.log(`\nApproved final output:\n\n${snapshot.values.draft}`);
    break;
  }

  const pending = snapshot.tasks.flatMap((t) => t.interrupts)[0];
  const { draft } = pending?.value as { draft: string };
  console.log(`\n--- Draft for review ---\n${draft}\n-----------------------`);

  const answer = (await rl.question("Approve? (y / or type feedback): ")).trim();
  const approved = answer.toLowerCase() === "y" || answer === "";
  input = new Command({ resume: { approved, feedback: approved ? undefined : answer } });
}

rl.close();
