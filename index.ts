import { config } from "./src/lib/config.js";
import { createLogger } from "./src/lib/logger.js";
import { getActiveCampaigns } from "./src/campaigns/registry.js";
import { buildFarmingPlan } from "./src/agent/loop.js";
import { applyPlan, getPortfolioSummary } from "./src/tracker/portfolio.js";

const logger = createLogger("nova");

async function refresh() {
  logger.info("─── Farming plan refresh ─────────────────────────");

  const campaigns = getActiveCampaigns();
  logger.info(`Found ${campaigns.length} active campaigns`);

  const plan = await buildFarmingPlan(campaigns);
  if (!plan) {
    logger.warn("Agent returned no farming plan");
    return;
  }

  applyPlan(plan);

  const summary = getPortfolioSummary();
  if (summary) {
    logger.info(`─── Portfolio Summary ────────────────────────────`);
    logger.info(`Capital: $${summary.totalCapital.toLocaleString()} | Expected: $${summary.totalExpected.toLocaleString()} | ROI: ${summary.blendedRoi.toFixed(1)}x`);
    logger.info(`Top campaigns: ${summary.topCampaigns.join(", ")}`);
    logger.info(summary.summary);
  }
}

async function main() {
  logger.info("Nova starting...");
  logger.info(`Capital: $${config.TOTAL_CAPITAL_USD.toLocaleString()} | Min ROI: ${config.MIN_ROI}x | Refresh: ${config.REFRESH_INTERVAL_MS / 3600000}h`);

  await refresh();
  setInterval(refresh, config.REFRESH_INTERVAL_MS);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
