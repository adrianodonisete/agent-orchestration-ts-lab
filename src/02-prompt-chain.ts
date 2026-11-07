/**
 * Pattern 2: Prompt chain (sequential pipeline)
 *
 * Fixed steps, each output feeds the next. Code (not the LLM) controls the
 * flow and can validate between steps ("gates").
 *
 *   outline -> [gate] -> draft -> polish
 */
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { fast, smart } from './lib/model';
import { header, logStep, printUsage } from './lib/log';

const topic = 'Why AI engineers should start with simple workflows before multi-agent systems';

header('02 - Prompt chain');

console.log('\n[step 1] outline');
const { output: outline } = await generateText({
    model: fast(),
    output: Output.object({
        schema: z.object({
            title: z.string(),
            sections: z
                .array(z.object({ heading: z.string(), keyPoint: z.string() }))
                .min(3)
                .max(5)
                .describe('3-5 outline sections'),
        }),
    }),
    onStepEnd: logStep('outliner'),
    prompt: `Create a blog post outline with exactly 4 sections about: ${topic}`,
});
console.log(JSON.stringify(outline, null, 2));

// Gate: deterministic check in code. Fail fast instead of wasting tokens downstream.
if (outline.sections.length < 3) {
    throw new Error(`Gate failed: outline has only ${outline.sections.length} sections`);
}

console.log('\n[step 2] draft');
const { text: draft } = await generateText({
    model: fast(),
    onStepEnd: logStep('writer'),
    prompt: `Write a ~300 word blog post from this outline. Use markdown headings.\n\n${JSON.stringify(outline)}`,
});

console.log('\n[step 3] polish');
const { text: final } = await generateText({
    model: smart(),
    system: 'You are a senior editor. Keep meaning, improve clarity and flow, cut filler.',
    onStepEnd: logStep('editor'),
    prompt: draft,
});

console.log(`\nFinal post:\n\n${final}`);
printUsage();
