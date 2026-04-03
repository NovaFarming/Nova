export type CampaignStatus = "active" | "ended" | "announced" | "claimable";
export type Chain = "solana" | "ethereum" | "base" | "arbitrum" | "optimism";
export type ActivityType = "swap" | "lp" | "borrow" | "stake" | "nft" | "bridge" | "vote" | "social";

export interface Campaign {
  id: string;
  protocol: string;
  chain: Chain;
  description: string;
  status: CampaignStatus;
  startDate: number;
  endDate?: number;
  estimatedValueUsd?: number;
  requiredActivities: ActivityType[];
  pointsSystem: boolean;
  snapshotDate?: number;
  eligibilityUrl?: string;
  twitterHandle?: string;
  tvlUsd?: number;
  fundingUsd?: number;               // protocol raise amount — higher = more tokens to distribute
  source: string;
}

export interface WalletActivity {
  address: string;
  chain: Chain;
  swapCount: number;
  lpPositions: number;
  borrowPositions: number;
  stakingPositions: number;
  bridgeCount: number;
  voteCount: number;
  totalVolumeUsd: number;
  uniqueProtocols: number;
  firstActivity: number;
  lastActivity: number;
}

export interface CampaignAllocation {
  campaignId: string;
  protocol: string;
  capitalUsd: number;
  activitiesRequired: ActivityType[];
  estimatedAirdropUsd: number;
  roi: number;                       // estimated ROI multiple
  priority: "high" | "medium" | "low";
  rationale: string;
  daysUntilSnapshot?: number;
}

export interface FarmingPlan {
  generatedAt: number;
  totalCapital: number;
  allocations: CampaignAllocation[];
  expectedTotalAirdropUsd: number;
  topCampaigns: string[];
  summary: string;
}

export interface PointsBalance {
  campaignId: string;
  protocol: string;
  points: number;
  estimatedRank: number;
  estimatedValueUsd: number;
  lastUpdated: number;
}
