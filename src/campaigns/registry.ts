import { createLogger } from "../lib/logger.js";
import type { Campaign } from "../lib/types.js";

const logger = createLogger("registry");

// Known live campaigns — in production, scraped from multiple sources
const KNOWN_CAMPAIGNS: Campaign[] = [
  {
    id: "kamino-points-s2",
    protocol: "Kamino Finance",
    chain: "solana",
    description: "Season 2 points for lending and borrowing. Snapshot TBD.",
    status: "active",
    startDate: Date.now() - 30 * 86400000,
    estimatedValueUsd: 8000,
    requiredActivities: ["lp", "borrow", "stake"],
    pointsSystem: true,
    tvlUsd: 1_200_000_000,
    fundingUsd: 10_000_000,
    source: "official",
  },
  {
    id: "marginfi-points-s3",
    protocol: "MarginFi",
    chain: "solana",
    description: "mrgnPTS points for lending activity. Season 3 ongoing.",
    status: "active",
    startDate: Date.now() - 60 * 86400000,
    estimatedValueUsd: 5000,
    requiredActivities: ["borrow", "lp"],
    pointsSystem: true,
    tvlUsd: 600_000_000,
    fundingUsd: 30_000_000,
    source: "official",
  },
  {
    id: "drift-points",
    protocol: "Drift Protocol",
    chain: "solana",
    description: "Trading and LP points for upcoming DRIFT token expansion.",
    status: "active",
    startDate: Date.now() - 90 * 86400000,
    estimatedValueUsd: 3000,
    requiredActivities: ["swap", "lp"],
    pointsSystem: true,
    tvlUsd: 400_000_000,
    fundingUsd: 25_000_000,
    source: "community",
  },
  {
    id: "flash-points",
    protocol: "Flash Trade",
    chain: "solana",
    description: "Flash Points for perps trading volume. TGE expected Q3 2026.",
    status: "active",
    startDate: Date.now() - 45 * 86400000,
    estimatedValueUsd: 4000,
    requiredActivities: ["swap"],
    pointsSystem: true,
    tvlUsd: 200_000_000,
    fundingUsd: 8_000_000,
    source: "official",
  },
  {
    id: "base-protocol-xyz",
    protocol: "Aerodrome Finance",
    chain: "base",
    description: "veAERO locking rewards and LP incentives.",
    status: "active",
    startDate: Date.now() - 120 * 86400000,
    estimatedValueUsd: 6000,
    requiredActivities: ["lp", "vote"],
    pointsSystem: false,
    tvlUsd: 800_000_000,
    fundingUsd: 0,
    source: "official",
  },
];

export function getActiveCampaigns(): Campaign[] {
  return KNOWN_CAMPAIGNS.filter((c) => c.status === "active");
}

export function getCampaignById(id: string): Campaign | undefined {
  return KNOWN_CAMPAIGNS.find((c) => c.id === id);
}

export function getCampaignsByChain(chain: string): Campaign[] {
  return KNOWN_CAMPAIGNS.filter((c) => c.chain === chain && c.status === "active");
}
