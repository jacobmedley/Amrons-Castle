# Review shipped enhancements

This ledger records implemented behavior. Read [the backlog](../BACKLOG.md) for proposals and [the changelog](../CHANGELOG.md) for release summaries.

| ID | Release | Enhancement | Evidence |
|---|---|---|---|
| AC-001 | 0.1.0 | Independent MIT castle, persistent cast, original art, task reviews and optional adapter | [Case study](../case-study.md), [provenance](../ASSET_PROVENANCE.md), commit `e3eb6a2` |
| AC-002 | 0.1.0 | Fluid layout, selectable queues, status badges and notifications | [Kingdom signals verification](changes/kingdom-signals/verification.md), commit `1abd8bf` |
| AC-003 | 0.1.0 | Usage ledger with distinct sources, scope, freshness and unknown states | [Adapter contract](../adapters/genesis/README.md), [verification](changes/kingdom-signals/verification.md), commit `1abd8bf` |
| AC-004 | 0.1.0 | Idle poses, pause/reduced motion, measured frame anchors and attention effects | [Frame checks](changes/kingdom-signals/screenshots/idle-frame-check.png), commit `1abd8bf` |
| AC-005 | 0.1.0 | Floating disclosure, staged reveal, real caret and preserved camera intent | [Layout verification](changes/living-castle/verification.md), commit `9e43cdd` |
| AC-006 | 0.1.0 | LOKI, Borin's arm wave, lighting, water and fairy events | [Animation checks](changes/living-castle/screenshots/animation-frames.png), [provenance](../ASSET_PROVENANCE.md), commit `9e43cdd` |
| AC-007 | 0.1.0 | Automatic-check count, time and changed/unchanged task state | [Polling evidence](changes/living-castle/verification.md), commit `9e43cdd` |
| AC-008 | 0.1.0 | Versioned release, backlog, issue forms, contributor/release guidance and CI configuration | [Contributing](../CONTRIBUTING.md), [release procedure](RELEASING.md), [workflow](../.github/workflows/ci.yml) |
| AC-110 | Unreleased | Viewport-filling castle with persistent command sidebar, compact queues, usage, navigation and responsive detail layout | [Command view verification](changes/command-view/verification.md) |
| AC-117 | Unreleased | Room tiles rearrange for portrait and panoramic scene shapes, preserving labels, characters and room selection; woodland extends the canvas | [Adaptive layout verification](changes/adaptive-castle/verification.md) |

## Record the next change

Give each shipped enhancement a stable ID, release, concrete behavior and evidence link. State limitations alongside results. Keep private account records and machine-specific paths out of this ledger. A backlog entry does not count as delivery.
