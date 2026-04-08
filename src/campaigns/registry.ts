import type { YieldVenue } from "../lib/types.js";

const KNOWN_VENUES: YieldVenue[] = [
  {
    id: "kamino-sol-lend",
    protocol: "kamino",
    market: "SOL lending",
    strategyType: "lend",
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
  return KNOWN_VENUES;
}

export function getCampaignById(id: string): YieldVenue | undefined {
  return KNOWN_VENUES.find((venue) => venue.id === id);
}

export function getCampaignsByChain(protocol: string): YieldVenue[] {
  return KNOWN_VENUES.filter((venue) => venue.protocol === protocol);
}
