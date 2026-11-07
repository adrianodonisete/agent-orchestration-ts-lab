---
name: add-mock-tool
description: Add a deterministic mock tool to src/lib/tools.ts for use by agents in the examples. Use when an example needs a new capability (search, database, API, file access) without calling real external services.
---

# Add a Mock Tool

All tools live in `src/lib/tools.ts` and return fake, deterministic data so examples run with only an OpenRouter key.

## Template

```ts
const INVENTORY: Record<string, { stock: number; price: number }> = {
  "SKU-1": { stock: 12, price: 9.9 },
};

export const checkInventory = tool({
  description: "Check stock and price for a product SKU.",
  inputSchema: z.object({ sku: z.string().describe("Product SKU, e.g. SKU-1") }),
  execute: async ({ sku }) => {
    const item = INVENTORY[sku.toUpperCase()];
    return item ? { sku, ...item } : { sku, error: "sku not found" };
  },
});
```

## Rules

- `description` tells the model *when* to use the tool; be specific.
- Every input field in `inputSchema` (zod). Use `.describe()` with an example value.
- Return plain JSON objects. On missing data return `{ error: "..." }` instead of throwing, so the agent can recover.
- Normalize lookups (lowercase / uppercase) to tolerate model formatting.
- No network, filesystem, `eval`, `Function`, shell or SQL string building.
- Keep fake datasets small (2-6 entries) and include at least one case that exercises reasoning (e.g. order `A-1001` is double-charged).
- Export the tool and import it only into the examples that need it; give each agent only the tools relevant to its role.
