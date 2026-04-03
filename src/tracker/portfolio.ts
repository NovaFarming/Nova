import { createLogger } from "../lib/logger.js";
import type { FarmingPlan, CampaignAllocation, PointsBalance } from "../lib/types.js";

const logger = createLogger("portfolio");
let currentPlan: FarmingPlan | null = null;
const pointsBalances = new Map<string, PointsBalance>();

export function applyPlan(plan: FarmingPlan) {
  currentPlan = plan;
  logger.info(`Plan applied: ${plan.allocations.length} campaigns | expected $${plan.expectedTotalAirdropUsd.toLocaleString()}`);

  for (const alloc of plan.allocations) {
    logger.info(
      `  [${alloc.priority.toUpperCase()}] ${alloc.protocol} | $${alloc.capitalUsd.toLocaleString()} → est $${alloc.estimatedAirdropUsd.toLocaleString()} (${alloc.roi.toFixed(1)}x) | ${alloc.rationale}`,
    );
  }
}

export function updatePoints(balance: PointsBalance) {
  pointsBalances.set(balance.campaignId, balance);
}

export function getPortfolioSummary() {
  if (!currentPlan) return null;

  const totalCapital = currentPlan.allocations.reduce((s, a) => s + a.capitalUsd, 0);
  const totalExpected = currentPlan.allocations.reduce((s, a) => s + a.estimatedAirdropUsd, 0);
  const blendedRoi = totalCapital > 0 ? totalExpected / totalCapital : 0;

  const highPriority = currentPlan.allocations.filter((a) => a.priority === "high");
  const medPriority = currentPlan.allocations.filter((a) => a.priority === "medium");

  return {
    generatedAt: currentPlan.generatedAt,
    totalCapital,
    totalExpected,
    blendedRoi,
    highCount: highPriority.length,
    medCount: medPriority.length,
    topCampaigns: currentPlan.topCampaigns,
    summary: currentPlan.summary,
    allocations: currentPlan.allocations,
  };
}

export function getCurrentPlan(): FarmingPlan | null {
  return currentPlan;
}
