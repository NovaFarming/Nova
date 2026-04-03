import { describe, it, expect } from "vitest";
import { getActiveCampaigns, getCampaignById, getCampaignsByChain } from "../src/campaigns/registry.js";

describe("getActiveCampaigns", () => {
  it("returns only active campaigns", () => {
    const campaigns = getActiveCampaigns();
    expect(campaigns.every((c) => c.status === "active")).toBe(true);
  });

  it("returns at least one campaign", () => {
    expect(getActiveCampaigns().length).toBeGreaterThan(0);
  });

  it("all campaigns have required fields", () => {
    for (const c of getActiveCampaigns()) {
      expect(c.id).toBeTruthy();
      expect(c.protocol).toBeTruthy();
      expect(c.requiredActivities.length).toBeGreaterThan(0);
    }
  });
});

describe("getCampaignById", () => {
  it("returns campaign by id", () => {
    const campaign = getCampaignById("kamino-points-s2");
    expect(campaign?.protocol).toBe("Kamino Finance");
  });

  it("returns undefined for unknown id", () => {
    expect(getCampaignById("nonexistent")).toBeUndefined();
  });
});

describe("getCampaignsByChain", () => {
  it("returns only campaigns for specified chain", () => {
    const solana = getCampaignsByChain("solana");
    expect(solana.every((c) => c.chain === "solana")).toBe(true);
  });

  it("returns empty array for chain with no campaigns", () => {
    expect(getCampaignsByChain("polygon").length).toBe(0);
  });

  it("solana has multiple campaigns", () => {
    expect(getCampaignsByChain("solana").length).toBeGreaterThan(1);
  });
});
