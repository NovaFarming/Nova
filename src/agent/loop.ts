import Anthropic from "@anthropic-ai/sdk";
import { config } from "../lib/config.js";
import { createLogger } from "../lib/logger.js";
import type { Campaign, FarmingPlan, CampaignAllocation } from "../lib/types.js";
import { NOVA_SYSTEM } from "./prompts.js";

const logger = createLogger("agent");
const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: "get_active_campaigns",
    description: "Returns all currently active airdrop campaigns with estimated values",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_campaign_details",
    description: "Returns full details for a specific campaign including eligibility requirements",
    input_schema: {
      type: "object" as const,
      properties: { campaignId: { type: "string" } },
      required: ["campaignId"],
    },
  },
  {
    name: "estimate_airdrop_value",
    description: "Estimates expected airdrop value given a capital allocation and activity level",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        capitalUsd: { type: "number" },
        activityMultiplier: { type: "number" }, // 1.0 = baseline, 2.0 = heavy activity
      },
      required: ["campaignId", "capitalUsd"],
    },
  },
  {
    name: "submit_farming_plan",
    description: "Submit the complete farming plan with all allocations",
    input_schema: {
      type: "object" as const,
      properties: {
        allocations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              campaignId: { type: "string" },
              protocol: { type: "string" },
              capitalUsd: { type: "number" },
              activitiesRequired: { type: "array", items: { type: "string" } },
              estimatedAirdropUsd: { type: "number" },
              roi: { type: "number" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              rationale: { type: "string" },
            },
          },
        },
        summary: { type: "string" },
      },
      required: ["allocations", "summary"],
    },
  },
];

export async function buildFarmingPlan(campaigns: Campaign[]): Promise<FarmingPlan | null> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Build an optimal airdrop farming plan for $${config.TOTAL_CAPITAL_USD.toLocaleString()} total capital. ${campaigns.length} active campaigns available. Maximize expected airdrop value while maintaining ROI > ${config.MIN_ROI}x.`,
    },
  ];

  let plan: FarmingPlan | null = null;

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
          result = campaigns.map((c) => ({
            id: c.id,
            protocol: c.protocol,
            chain: c.chain,
            estimatedValueUsd: c.estimatedValueUsd,
            requiredActivities: c.requiredActivities,
            tvlUsd: c.tvlUsd,
            fundingUsd: c.fundingUsd,
            pointsSystem: c.pointsSystem,
          }));
          break;

        case "get_campaign_details": {
          const input = block.input as { campaignId: string };
          const campaign = campaigns.find((c) => c.id === input.campaignId);
          result = campaign ?? { error: "campaign not found" };
          break;
        }

        case "estimate_airdrop_value": {
          const input = block.input as { campaignId: string; capitalUsd: number; activityMultiplier?: number };
          const campaign = campaigns.find((c) => c.id === input.campaignId);
          if (!campaign || !campaign.estimatedValueUsd) {
            result = { estimatedAirdropUsd: 0, note: "insufficient data to estimate" };
          } else {
            const multiplier = input.activityMultiplier ?? 1.0;
            const base = campaign.estimatedValueUsd;
            const capitalFactor = Math.min(input.capitalUsd / 1000, 2.0);
            const estimated = base * capitalFactor * multiplier * 0.6; // 60% probability weight
            result = {
              estimatedAirdropUsd: Math.round(estimated),
              roi: estimated / input.capitalUsd,
              note: "estimate based on TVL share and historical airdrop distributions",
            };
          }
          break;
        }

        case "submit_farming_plan": {
          const input = block.input as { allocations: CampaignAllocation[]; summary: string };
          const total = input.allocations.reduce((s, a) => s + a.estimatedAirdropUsd, 0);
          plan = {
            generatedAt: Date.now(),
            totalCapital: config.TOTAL_CAPITAL_USD,
            allocations: input.allocations,
            expectedTotalAirdropUsd: total,
            topCampaigns: input.allocations
              .filter((a) => a.priority === "high")
              .map((a) => a.protocol),
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
