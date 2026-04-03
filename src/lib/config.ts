import { z } from "zod";

const schema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-5-20251001"),
  HELIUS_API_KEY: z.string().optional(),
  TOTAL_CAPITAL_USD: z.coerce.number().default(5000),
  MIN_ESTIMATED_VALUE_USD: z.coerce.number().default(500),
  MIN_ROI: z.coerce.number().default(1.5),              // 1.5x minimum
  REFRESH_INTERVAL_MS: z.coerce.number().default(86400000), // daily
  TRACKED_CHAINS: z.string().default("solana,base,arbitrum"),
  WALLET_ADDRESS: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(): Config {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid config: ${missing}`);
  }
  return result.data;
}

export const config = loadConfig();

export function getTrackedChains(): string[] {
  return config.TRACKED_CHAINS.split(",").map((s) => s.trim()) as string[];
}
