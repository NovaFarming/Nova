import { config } from "../lib/config.js";
import type { RebalancePlan } from "../lib/types.js";
import { createLogger } from "../lib/logger.js";

const logger = createLogger("portfolio");
let currentPlan: RebalancePlan | null = null;

export function applyPlan(plan: RebalancePlan) {
  currentPlan = plan;
  logger.info(`Plan applied: ${plan.allocations.length} routes | expected annual yield $${plan.expectedAnnualYieldUsd.toLocaleString()}`);

  for (const allocation of plan.allocations) {
    logger.info(
      `  [${allocation.priority.toUpperCase()}] ${allocation.market} | $${allocation.capitalUsd.toLocaleString()} -> ${(
        allocation.expectedNetApr * 100
      ).toFixed(2)}% net APR | ${allocation.rationale}`,
    );
  }
}

export function getPortfolioSummary() {
  if (!currentPlan) return null;

  const totalCapital = currentPlan.allocations.reduce((sum, allocation) => sum + allocation.capitalUsd, 0);
  const weightedNetApr =
    totalCapital > 0
      ? currentPlan.allocations.reduce((sum, allocation) => sum + allocation.expectedNetApr * allocation.capitalUsd, 0) / totalCapital
      : 0;

  return {
    generatedAt: currentPlan.generatedAt,
    totalCapital,
    expectedAnnualYieldUsd: currentPlan.expectedAnnualYieldUsd,
    weightedNetApr,
    maxProtocolWeight: config.MAX_PROTOCOL_WEIGHT,
    topRoutes: currentPlan.topRoutes,
    summary: currentPlan.summary,
    allocations: currentPlan.allocations,
  };
}

export function getCurrentPlan(): RebalancePlan | null {
  return currentPlan;
}
