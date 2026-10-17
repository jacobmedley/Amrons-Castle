# Optional host identity observation

October 16, 2026 · AC-118 and AC-119 foundation · unreleased feature branch.

The live Castle now accepts a separately authenticated identity observation. It can draw a selected pet's host-provided image and name in the Royal War Room, and list a dot's observed delegated tasks. The queen's local display name stays independent of dot identity. No current Genesis or public Demo host provides these endpoints, so this is an integration-ready client, not a connected ChatGPT account feature.

## Checks

- `npm run typecheck`, all 42 tests and `npm run build` passed.
- Focused tests cover selected, unselected, unavailable, malformed, stale and future-dated observations, including duplicate dot task IDs and unsupported states.
- Browser inspection at desktop and a 390 × 844 phone viewport showed the Demo still using LOKI. With `?mode=live` on the standalone server, the connection showed an explicit unavailable state, LOKI remained visible, and Dot tasks were absent. The castle and command layout remained usable.

## Remaining host work

- Implement the [authenticated identity contract](../../../adapters/genesis/IDENTITY.md) in a host that has a legitimate source for the user's selected ChatGPT pet and dot.
- Verify real selection changes, artwork expiry/refresh, source ownership, reduced motion, Dot task freshness and review links with authorized test accounts. The Pets connection inspected during this work reported **Default**, so there was no selected custom pet to mirror. No account names, IDs, artwork or credentials are committed here.
