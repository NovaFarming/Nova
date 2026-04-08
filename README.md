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
The allocator is intentionally conservative around emissions that cannot be exited cleanly.

`SCAN -> DECOMPOSE -> FILTER -> ALLOCATE -> REBALANCE`

---

Allocation Schematic • Terminal Output • At a Glance • Operating Surfaces • How It Works • Example Output • Technical Spec • Risk Controls • Quick Start

## At a Glance

- `Use case`: route Solana capital into cleaner net carry instead of headline APR
- `Primary input`: fee APR, emissions APR, lending carry, IL drag, utilization, rebalance friction
- `Primary failure mode`: allocating into yield that cannot actually be kept
- `Best for`: operators who care more about realized carry than advertised yield

## Allocation Schematic

![Nova Dashboard](assets/preview-dashboard.svg)

## Terminal Output

![Nova Terminal](assets/preview-terminal.svg)

## Operating Surfaces

- `Allocation Schematic`: shows how capital is being routed across the active venues
- `Net APR Model`: exposes the components hidden behind headline yield
- `Rebalance Planner`: promotes route changes only when the edge clears friction
- `Terminal Output`: prints the route stack the allocator would actually hold

## Why Nova Exists

Most yield dashboards do not separate gross reward numbers from the frictions that make those numbers misleading. An allocator can easily end up long emissions it cannot exit, pushed into lending books that are already stressed, or carrying IL that quietly erases the headline spread.

Nova exists to force every route through a net-carry lens before it gets capital.

## How It Works

Nova treats allocation as a filtration problem:

1. load live Solana yield routes from the venue registry
2. break each route into fee carry, emissions, borrow, IL drag, and utilization stress
3. reject routes where the reward mix is too fragile or too hard to exit
4. cap concentration so one venue cannot dominate the allocator
5. propose a rebalance only when the net edge is strong enough to matter after friction

This is why Nova is more conservative than a simple yield board. It is optimizing for keepable yield, not optical APR.

## What A Good Route Looks Like

- gross APR survives after drag and borrow costs are removed
- utilization is not already stretched
- emissions can actually be exited into real depth
- route concentration remains inside the portfolio limits

If those conditions are missing, the route should not absorb capital just because the raw number is large.

## Example Output

```text
NOVA // ALLOCATION PLAN

lead route         Kamino SOL lending
net apr            8.30%
exit depth         strong
utilization        74%
portfolio weight   40%

allocation note: carry is clean and friction stays below the rebalance threshold
```

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

## Risk Controls

- `utilization cap`: blocks routes where post-trade utilization becomes too stressed
- `exit-depth filter`: blocks rewards that cannot be exited cleanly
- `concentration cap`: prevents one protocol from dominating the allocator
- `friction-aware rebalance`: rejects route changes that do not clear real costs

Nova should under-rotate rather than overtrade into noisy yield.

## Architecture

```text
venue registry
  -> net APR model
  -> claude allocation loop
  -> portfolio summary and route board
```

## Quick Start

```bash
git clone https://github.com/NovaFarming/Nova
cd Nova && bun install
cp .env.example .env
bun run dev
```

## Configuration

```bash
ANTHROPIC_API_KEY=sk-ant-...
TOTAL_CAPITAL_USD=10000
MIN_NET_APR=0.08
MAX_POST_TRADE_UTILIZATION=0.90
MIN_EXIT_DEPTH_USD=25000
MAX_PROTOCOL_WEIGHT=0.45
```

## Legitimacy Notes

- Planned commit sequence: [`docs/commit-sequence.md`](docs/commit-sequence.md)
- Draft engineering issues: [`docs/issue-drafts.md`](docs/issue-drafts.md)

## License

MIT

---

*allocate to carry you can actually keep.*
