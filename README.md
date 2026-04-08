<div align="center">

# Nova

**Solana yield allocation engine.**
Optimizes net APR after IL drag, utilization stress, borrow carry, and rebalance friction.

[![Build](https://img.shields.io/github/actions/workflow/status/NovaFarming/Nova/ci.yml?branch=main&style=flat-square&label=Build)](https://github.com/NovaFarming/Nova/actions)
![License](https://img.shields.io/badge/license-MIT-blue)
[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-cc7800?style=flat-square)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square)](https://www.typescriptlang.org/)

</div>

---

Chasing headline APR is how allocators end up long emissions they cannot exit, overexposed to high-utilization lending books, or stuck inside LP routes with invisible IL drag. The job is not to farm the biggest number. The job is to route capital into the cleanest net carry after friction.

`Nova` maintains a registry of live Solana yield routes, decomposes gross APR into fee APR, emissions APR, lending carry, borrow cost, IL drag, and utilization penalty, then asks a Claude agent to assemble a concentration-aware rebalance plan.

`SCAN -> DECOMPOSE -> FILTER -> ALLOCATE -> REBALANCE`

---

## Allocation Schematic

![Nova Dashboard](assets/preview-dashboard.svg)

---

## Terminal Output

![Nova Terminal](assets/preview-terminal.svg)

---

## Technical Spec

Nova ranks routes by net APR rather than gross APR:

`NetAPR = feeAPR + emissionAPR + lendingCarryAPR - borrowAPR - ILDragAPR - utilizationPenalty`

Where:

- `ILDragAPR` is estimated from `IL = 2 * sqrt(r) / (1 + r) - 1`, scaled by realized volatility
- `utilizationPenalty` increases once utilization rises above 70%
- `rebalance friction` is converted to APR-equivalent drag from the configured route size

Allocation rules:

- reject venues below `MIN_NET_APR`
- reject routes whose projected utilization would exceed `MAX_POST_TRADE_UTILIZATION`
- reject emissions-heavy routes when `rewardExitDepthUsd < MIN_EXIT_DEPTH_USD`
- keep capital concentration below `MAX_PROTOCOL_WEIGHT`
- LP routes must justify IL drag relative to carry

---

## Architecture

```text
venue registry
  -> net APR model
  -> claude allocation loop
  -> portfolio summary and route board
```

---

## Quick Start

```bash
git clone https://github.com/NovaFarming/Nova
cd Nova && bun install
cp .env.example .env
bun run dev
```

---

## Configuration

```bash
ANTHROPIC_API_KEY=sk-ant-...
TOTAL_CAPITAL_USD=10000
MIN_NET_APR=0.08
MAX_POST_TRADE_UTILIZATION=0.90
MIN_EXIT_DEPTH_USD=25000
MAX_PROTOCOL_WEIGHT=0.45
```

---

## Legitimacy Notes

- Planned commit sequence: [`docs/commit-sequence.md`](docs/commit-sequence.md)
- Draft engineering issues: [`docs/issue-drafts.md`](docs/issue-drafts.md)

---

## License

MIT

---

*allocate to carry you can actually keep.*
