import { z } from "zod";

const schema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-5-20251001"),
  TOTAL_CAPITAL_USD: z.coerce.number().default(10_000),
  MIN_NET_APR: z.coerce.number().default(0.08),
  MAX_POST_TRADE_UTILIZATION: z.coerce.number().default(0.9),
  MIN_EXIT_DEPTH_USD: z.coerce.number().default(25_000),
  REBALANCE_COST_USD: z.coerce.number().default(12),
  REBALANCE_WINDOW_DAYS: z.coerce.number().default(7),
  MAX_PROTOCOL_WEIGHT: z.coerce.number().default(0.45),
  REFRESH_INTERVAL_MS: z.coerce.number().default(21_600_000),
  TRACKED_PROTOCOLS: z.string().default("kamino,marginfi,solend,meteora"),
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

export function getTrackedProtocols(): string[] {
  return config.TRACKED_PROTOCOLS.split(",").map((value) => value.trim()).filter(Boolean);
}
