import type { YieldVenue } from "../lib/types.js";

const KNOWN_VENUES: YieldVenue[] = [
  {
    id: "kamino-sol-lend",
    protocol: "kamino",
    market: "SOL lending",
    strategyType: "lend",
    dataSource: "registry",
    lastReviewedAt: "2026-04-09",
    maxRecommendedCapitalUsd: 4_000,
    reviewNotes: "Deep exit liquidity and moderate utilization make this the cleanest core lending route.",
    feeApr: 0.071,
    emissionApr: 0.012,
    borrowApr: 0,
    lendingCarryApr: 0,
    utilization: 0.74,
    availableLiquidityUsd: 5_400_000,
    rewardExitDepthUsd: 1_500_000,
    volatility30d: 0.58,
    ilExposure: false,
  },
  {
    id: "marginfi-usdc-loop",
    protocol: "marginfi",
    market: "USDC carry loop",
    strategyType: "loop",
    dataSource: "registry",
    lastReviewedAt: "2026-04-09",
    maxRecommendedCapitalUsd: 2_500,
    reviewNotes: "Carry remains attractive, but the route should stay capped because utilization is already elevated.",
    feeApr: 0.044,
    emissionApr: 0.018,
    borrowApr: 0.027,
    lendingCarryApr: 0.021,
    utilization: 0.81,
    availableLiquidityUsd: 3_100_000,
    rewardExitDepthUsd: 950_000,
    volatility30d: 0.08,
    ilExposure: false,
  },
  {
    id: "meteora-sol-usdc-dlmm",
    protocol: "meteora",
    market: "SOL/USDC DLMM",
    strategyType: "lp",
    dataSource: "registry",
    lastReviewedAt: "2026-04-09",
    maxRecommendedCapitalUsd: 1_500,
    reviewNotes: "Fee profile is strong, but IL sensitivity and reward-exit depth require a smaller allocation cap.",
    feeApr: 0.162,
    emissionApr: 0.031,
    borrowApr: 0,
    lendingCarryApr: 0,
    utilization: 0.63,
    availableLiquidityUsd: 2_600_000,
    rewardExitDepthUsd: 840_000,
    volatility30d: 0.49,
    ilExposure: true,
    pairPriceRatio: 1.18,
  },
  {
    id: "solend-stables",
    protocol: "solend",
    market: "stable lending",
    strategyType: "vault",
    dataSource: "registry",
    lastReviewedAt: "2026-04-09",
    maxRecommendedCapitalUsd: 3_500,
    reviewNotes: "Stable base leg with strong exit depth; appropriate as a ballast route.",
    feeApr: 0.056,
    emissionApr: 0.009,
    borrowApr: 0,
    lendingCarryApr: 0,
    utilization: 0.68,
    availableLiquidityUsd: 4_800_000,
    rewardExitDepthUsd: 3_200_000,
    volatility30d: 0.04,
    ilExposure: false,
  },
];

export function getActiveCampaigns(): YieldVenue[] {
  return [...KNOWN_VENUES];
}

export function getCampaignById(id: string): YieldVenue | undefined {
  return KNOWN_VENUES.find((venue) => venue.id === id);
}

export function getCampaignsByProtocol(protocol: string): YieldVenue[] {
  const normalized = protocol.trim().toLowerCase();
  return KNOWN_VENUES.filter((venue) => venue.protocol === normalized);
}
