import { config } from "./src/lib/config.js";
import { createLogger } from "./src/lib/logger.js";
import { getActiveCampaigns } from "./src/campaigns/registry.js";
import { buildFarmingPlan } from "./src/agent/loop.js";
import { applyPlan, getPortfolioSummary } from "./src/tracker/portfolio.js";

const logger = createLogger("nova");

async function refresh() {
  logger.info("---------------- Yield Refresh ------------");

  const venues = getActiveCampaigns();
  logger.info(`Found ${venues.length} tracked yield routes after route-quality screening`);

  const plan = await buildFarmingPlan(venues);
  if (!plan) {
    logger.warn("Agent returned no rebalance plan");
    return;
  }

  applyPlan(plan);

  const summary = getPortfolioSummary();
  if (summary) {
    logger.info("---------------- Portfolio Summary --------");
    logger.info(
      `Capital: $${summary.totalCapital.toLocaleString()} | Annualized yield: $${summary.expectedAnnualYieldUsd.toLocaleString()} | Weighted net APR: ${(summary.weightedNetApr * 100).toFixed(2)}%`,
    );
    logger.info(`Top routes: ${summary.topRoutes.join(", ")}`);
    logger.info(summary.summary);
  }
}

async function main() {
  logger.info("Nova starting...");
  logger.info(
    `Capital: $${config.TOTAL_CAPITAL_USD.toLocaleString()} | Min net APR: ${(config.MIN_NET_APR * 100).toFixed(1)}% | Refresh: ${config.REFRESH_INTERVAL_MS / 3600000}h`,
  );

  await refresh();
  setInterval(refresh, config.REFRESH_INTERVAL_MS);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
