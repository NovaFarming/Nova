# Nova Issue Drafts

## DLMM route still looks too attractive when volatility jumps but bin width stays static

The current IL drag estimate needs a stronger volatility shock term. Otherwise the allocator keeps over-weighting DLMM routes during unstable sessions.

## Need post-trade utilization checks before large stablecoin rotations

We are scoring routes using current utilization, but not projected utilization after deployment. Add a post-trade cap before the agent can approve a move.

Backlog note: validate both issues against actual Meteora and lending route exits before changing the allocator defaults.
