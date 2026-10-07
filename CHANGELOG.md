# Changelog

Read [the backlog](BACKLOG.md) for proposed work and [the enhancement ledger](docs/ENHANCEMENTS.md) for shipped work and verification evidence.

## Unreleased

No changes recorded after v0.1.0. Add new entries here before the next release.

## 0.1.0 - 2026-10-07

First numbered public prototype release, including the independent castle and both enhancement waves.

### Added

- Queen Amron and six persistent specialists in an original pixel-art castle, with room navigation, zoom, pan and accessible HTML controls.
- Fictional quests, explicit review gates, changes requested, handoffs, blocked work and reset. The Moonwell journey requires six approvals.
- Fluid desktop/phone layouts, actionable status queues, character badges and a local notification ledger.
- Optional read-only Genesis observations and a Token Use-inspired ledger with separate sources, reporting windows and freshness states.
- Idle activities, Borin's four-pose arm wave, stronger blocked signals, and LOKI's existing companion artwork beside Amron.
- Torch/window light, character silhouette lighting, pond ripples, swimming fish and occasional fairy encounters.
- Versioned documentation, enhancement ledger, customization backlog, issue forms, contribution guidance and CI configuration.

### Fixed

- Opening usage details no longer pushes or refits the castle. The floating panel expands before its content fades in and uses a real caret icon.
- Manual or focused camera positions survive resizing.
- Focus returns to a visible control after review actions, including when the previous badge becomes disabled.
- Compact markers reduce overlap on phones; the blocked beacon clears room labels.
- Successful automatic checks are visible even when task records do not change.

### Verified

- 35 tests, TypeScript checking and the production build pass locally.
- Desktop and phone browser checks cover navigation, review, focus, disclosure stability, pause and reduced motion.
- Live work checks were observed about every 6 seconds, and usage checks about every 30 seconds, while visible.

### Known limits

- This is a prototype. Demo state and notifications reset on reload; no production task execution is built in.
- The adapter follows Genesis checkpoints. Arbitrary Codex conversations do not become jobs automatically.
- Account allowance/reset time are not connected. Token savings are not measured; cache reuse is separate.
- Character-name editing and selectable color themes are planned, not shipped.
- Browser checks do not establish full accessibility conformance or physical-device coverage.

See [kingdom signals verification](docs/changes/kingdom-signals/verification.md), [living castle verification](docs/changes/living-castle/verification.md) and [asset provenance](ASSET_PROVENANCE.md).
