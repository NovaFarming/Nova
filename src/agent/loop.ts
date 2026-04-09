import Anthropic from "@anthropic-ai/sdk";
import { config } from "../lib/config.js";
import { createLogger } from "../lib/logger.js";
import type { YieldVenue, RebalancePlan, YieldAllocation } from "../lib/types.js";
import { NOVA_SYSTEM } from "./prompts.js";

const logger = createLogger("agent");
const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

function inferIlDrag(venue: YieldVenue): number {
  if (!venue.ilExposure || !venue.pairPriceRatio) return 0;
  const ratio = venue.pairPriceRatio;
  const il = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1;
  const annualized = Math.abs(il) * Math.min(1.5, venue.volatility30d);
  return Number(annualized.toFixed(4));
}

function netApr(venue: YieldVenue): number {
  const ilDrag = inferIlDrag(venue);
  const utilizationPenalty = venue.utilization > 0.7 ? ((venue.utilization - 0.7) / 0.2) * 0.04 : 0;
  return Number(
    (
      venue.feeApr +
      venue.emissionApr +
      venue.lendingCarryApr -
      venue.borrowApr -
      ilDrag -
      utilizationPenalty
    ).toFixed(4),
  );
}

function estimatePostTradeUtilization(venue: YieldVenue, capitalUsd: number): number {
  const effectiveCapacity = venue.availableLiquidityUsd / Math.max(1 - venue.utilization, 0.05);
  return Number(Math.min(0.995, (venue.utilization * effectiveCapacity + capitalUsd) / effectiveCapacity).toFixed(4));
}

const tools: Anthropic.Tool[] = [
  {
    name: "get_active_campaigns",
    description: "Returns all reviewed yield routes with carry, utilization, IL, and exit-depth data",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_campaign_details",
    description: "Returns full detail for a specific venue including net APR components",
    input_schema: {
      type: "object" as const,
      properties: { campaignId: { type: "string" } },
      required: ["campaignId"],
    },
  },
  {
    name: "estimate_net_yield",
    description: "Estimate annualized net yield for a reviewed capital allocation after friction and utilization stress",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        capitalUsd: { type: "number" },
      },
      required: ["campaignId", "capitalUsd"],
    },
  },
  {
    name: "submit_farming_plan",
    description: "Submit the complete rebalance plan with all allocations",
    input_schema: {
      type: "object" as const,
      properties: {
        allocations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              venueId: { type: "string" },
              protocol: { type: "string" },
              market: { type: "string" },
              capitalUsd: { type: "number" },
              expectedNetApr: { type: "number" },
              expectedNetYieldUsd: { type: "number" },
              protocolWeight: { type: "number" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              rationale: { type: "string" }
            }
          }
        },
        summary: { type: "string" }
      },
      required: ["allocations", "summary"],
    },
  },
];

export async function buildFarmingPlan(venues: YieldVenue[]): Promise<RebalancePlan | null> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Build a Solana yield allocation plan for $${config.TOTAL_CAPITAL_USD.toLocaleString()} of capital. Favor routes above ${(config.MIN_NET_APR * 100).toFixed(1)}% net APR while respecting utilization and protocol concentration limits.`,
    },
  ];

  let plan: RebalancePlan | null = null;

  for (let i = 0; i < 10; i++) {
    const response = await client.messages.create({
      model: config.CLAUDE_MODEL,
      max_tokens: 2048,
      system: NOVA_SYSTEM,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let result: unknown;

      switch (block.name) {
        case "get_active_campaigns":
          result = venues.map((venue) => ({
            id: venue.id,
            protocol: venue.protocol,
            market: venue.market,
            strategyType: venue.strategyType,
            dataSource: venue.dataSource,
            lastReviewedAt: venue.lastReviewedAt,
            maxRecommendedCapitalUsd: venue.maxRecommendedCapitalUsd,
            reviewNotes: venue.reviewNotes,
            utilization: venue.utilization,
            availableLiquidityUsd: venue.availableLiquidityUsd,
            rewardExitDepthUsd: venue.rewardExitDepthUsd,
            ilDragApr: inferIlDrag(venue),
            netApr: netApr(venue),
          }));
          break;

        case "get_campaign_details": {
          const input = block.input as { campaignId: string };
          const venue = venues.find((candidate) => candidate.id === input.campaignId);
          result = venue
            ? {
                ...venue,
                ilDragApr: inferIlDrag(venue),
                netApr: netApr(venue),
                postTradeUtilizationAtCap: estimatePostTradeUtilization(venue, venue.maxRecommendedCapitalUsd),
              }
            : { error: "venue not found" };
          break;
        }

        case "estimate_net_yield": {
          const input = block.input as { campaignId: string; capitalUsd: number };
          const venue = venues.find((candidate) => candidate.id === input.campaignId);
          if (!venue) {
            result = { expectedNetYieldUsd: 0, expectedNetApr: 0, note: "venue missing" };
          } else {
            const capitalCapped = Math.min(input.capitalUsd, venue.maxRecommendedCapitalUsd);
            const expectedNetApr = netApr(venue);
            const friction = config.REBALANCE_COST_USD / Math.max(capitalCapped, 1);
            const adjustedApr = Math.max(0, expectedNetApr - friction);
            const postTradeUtilization = estimatePostTradeUtilization(venue, capitalCapped);
            result = {
              expectedNetApr: Number((postTradeUtilization > config.MAX_POST_TRADE_UTILIZATION ? 0 : adjustedApr).toFixed(4)),
              expectedNetYieldUsd: Math.round(capitalCapped * adjustedApr),
              postTradeUtilization,
              capitalCapped,
            };
          }
          break;
        }

        case "submit_farming_plan": {
          const input = block.input as { allocations: YieldAllocation[]; summary: string };
          const sanitizedAllocations: YieldAllocation[] = [];
          const capitalByProtocol = new Map<YieldVenue["protocol"], number>();
          let remainingCapital = config.TOTAL_CAPITAL_USD;

          for (const allocation of input.allocations) {
            const venue = venues.find((candidate) => candidate.id === allocation.venueId);
            if (!venue) continue;

            const capitalUsd = Math.min(allocation.capitalUsd, venue.maxRecommendedCapitalUsd, remainingCapital);
            const postTradeUtilization = estimatePostTradeUtilization(venue, capitalUsd);
            const recomputedNetApr = Math.max(
              0,
              netApr(venue) - config.REBALANCE_COST_USD / Math.max(capitalUsd, 1),
            );
            const nextProtocolCapital = (capitalByProtocol.get(venue.protocol) ?? 0) + capitalUsd;
            const nextProtocolWeight = nextProtocolCapital / Math.max(config.TOTAL_CAPITAL_USD, 1);

            if (
              capitalUsd < 250 ||
              postTradeUtilization > config.MAX_POST_TRADE_UTILIZATION ||
              recomputedNetApr < config.MIN_NET_APR ||
              nextProtocolWeight > config.MAX_PROTOCOL_WEIGHT
            ) {
              continue;
            }

            capitalByProtocol.set(venue.protocol, nextProtocolCapital);
            remainingCapital = Number(Math.max(0, remainingCapital - capitalUsd).toFixed(2));

            sanitizedAllocations.push({
              ...allocation,
              capitalUsd,
              expectedNetApr: Number(recomputedNetApr.toFixed(4)),
              expectedNetYieldUsd: Math.round(capitalUsd * recomputedNetApr),
              protocolWeight: 0,
            });

            if (remainingCapital < 250) break;
          }

          const allocatedCapital = sanitizedAllocations.reduce((sum, allocation) => sum + allocation.capitalUsd, 0);
          for (const allocation of sanitizedAllocations) {
            allocation.protocolWeight = Number(
              (allocation.capitalUsd / Math.max(allocatedCapital, 1)).toFixed(4),
            );
          }

          plan = {
            generatedAt: Date.now(),
            totalCapital: config.TOTAL_CAPITAL_USD,
            allocations: sanitizedAllocations,
            expectedAnnualYieldUsd: sanitizedAllocations.reduce((sum, allocation) => sum + allocation.expectedNetYieldUsd, 0),
            topRoutes: sanitizedAllocations.filter((allocation) => allocation.priority === "high").map((allocation) => allocation.market),
            summary: input.summary,
          };
          result = { accepted: true };
          break;
        }

        default:
          result = { error: "unknown tool" };
      }

      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }

    messages.push({ role: "user", content: toolResults });
    if (plan) break;
  }

  return plan;
}
