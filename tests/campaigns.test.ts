import { describe, it, expect } from "vitest";
import { getActiveCampaigns, getCampaignById, getCampaignsByChain } from "../src/campaigns/registry.js";

describe("getActiveCampaigns", () => {
  it("returns at least one live route", () => {
    expect(getActiveCampaigns().length).toBeGreaterThan(0);
  });

  it("all venues expose liquidity and utilization data", () => {
    for (const venue of getActiveCampaigns()) {
      expect(venue.availableLiquidityUsd).toBeGreaterThan(0);
      expect(venue.utilization).toBeGreaterThanOrEqual(0);
      expect(venue.utilization).toBeLessThanOrEqual(1);
    }
  });
});

describe("getCampaignById", () => {
  it("returns venue by id", () => {
    const venue = getCampaignById("kamino-sol-lend");
    expect(venue?.protocol).toBe("kamino");
  });

  it("returns undefined for unknown id", () => {
    expect(getCampaignById("nonexistent")).toBeUndefined();
  });
});

describe("getCampaignsByChain", () => {
  it("returns only venues for specified protocol", () => {
    const meteora = getCampaignsByChain("meteora");
    expect(meteora.every((venue) => venue.protocol === "meteora")).toBe(true);
  });
});
