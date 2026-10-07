# Plan the next enhancements

Current release: **v0.1.0**. Entries below are proposals, not available features or promised dates. Reference stable IDs in issues and pull requests. Move completed work into [the enhancement ledger](docs/ENHANCEMENTS.md) and [the changelog](CHANGELOG.md), with verification links.

## Prioritize the backlog

| ID | Priority | Status | Enhancement | Acceptance criteria |
|---|---|---|---|---|
| AC-101 | Next | Planned | Edit character display names | Add a settings editor for local display names, including LOKI. Keep immutable agent IDs, roles, ownership and default identities. Validate blank/long names, update accessible labels and notifications, persist versioned preferences, and offer Restore defaults. Verify long names on phones. |
| AC-102 | Next | Planned | Choose color themes | Add semantic interface color tokens and a theme picker with the current palette as default. Explore Emerald, Moonlit Violet and High Contrast. Persist the choice, retain icon/text status cues, and verify contrast, focus and reduced motion. Raster-art recoloring is separate work. |
| AC-103 | Next | Planned | Control ambient effects | Offer controls for lighting, water and fairy events, plus a low-effects mode. Preserve Pause motion and operating-system reduced motion. Changes must not imply different task activity. |
| AC-104 | Next | Planned | Expand browser regression coverage | Automate disclosure stability, queue focus, phone navigation, resize, reconnect and hidden-tab behavior with public-safe fixtures. Include physical-device checks when available. |
| AC-105 | Later | Planned | Export and import preferences | Export names, theme and motion settings with a versioned schema. Validate imports, preview changes and restore defaults. Exclude credentials, telemetry and private run records. |
| AC-106 | Later | Needs source | Connect account allowance safely | Define an authenticated host contract for provider/account scope, window, allowance, reset time and observation time. Keep unavailable/stale states explicit; never embed development snapshots. |
| AC-107 | Later | Needs design | Connect other agent systems | Document a backend-neutral observation contract and fictional fixture adapter. Preserve ownership, approval boundaries and uncertainty. Keep credentials and execution on the host. |
| AC-108 | Later | Idea | Display a quest timeline | Show recorded handoffs, reviews and outputs with source timestamps. Separate simulated and observed history; do not reconstruct missing facts. |
| AC-109 | Later | Idea | Add localization | Extract interface copy, support longer labels and locale-aware dates/numbers, and verify text expansion without changing IDs. |

## Share an enhancement idea

Open an [enhancement request](https://github.com/jacobmedley/Amrons-Castle/issues/new?template=enhancement_request.yml). Describe the user problem, proposed behavior, alternatives and acceptance criteria. Reference a backlog ID when relevant.

Ideas to explore:

- Seasonal surroundings and alternate room arrangements.
- Companion collections with explicit asset provenance and event toggles.
- User-triggered celebrations for verified completions, with reduced-motion alternatives.
- A quest archive with exportable, public-safe summaries.
- Touch-first camera controls and an optional minimap.

These ideas are not approved implementation scope. Discussion, evidence and maintainer review determine priority.

## Track bugs separately

Use the [bug-report form](https://github.com/jacobmedley/Amrons-Castle/issues/new?template=bug_report.yml) for reproducible failures, including layout, motion and accessibility problems. GitHub Issues tracks open bugs; do not create a second unsynchronized bug list here. Include the version/commit, Demo/live mode, browser, viewport, steps and expected/actual result. Redact private data before posting.

Bug and enhancement forms ship in v0.1.0. They do not submit reports from inside the application or collect telemetry automatically.
