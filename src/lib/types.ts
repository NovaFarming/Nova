export type Protocol = "kamino" | "marginfi" | "solend" | "meteora";
export type StrategyType = "lend" | "loop" | "lp" | "vault";

export interface YieldVenue {
  id: string;
  protocol: Protocol;
  market: string;
  strategyType: StrategyType;
  feeApr: number;
  emissionApr: number;
  borrowApr: number;
  lendingCarryApr: number;
  utilization: number;
  availableLiquidityUsd: number;
  rewardExitDepthUsd: number;
  volatility30d: number;
  ilExposure: boolean;
  pairPriceRatio?: number;
}

export interface YieldAllocation {
  venueId: string;
  protocol: Protocol;
  market: string;
  capitalUsd: number;
  expectedNetApr: number;
  expectedNetYieldUsd: number;
  protocolWeight: number;
  priority: "high" | "medium" | "low";
  rationale: string;
}

export interface RebalancePlan {
  generatedAt: number;
  totalCapital: number;
  allocations: YieldAllocation[];
  expectedAnnualYieldUsd: number;
  topRoutes: string[];
  summary: string;
}
