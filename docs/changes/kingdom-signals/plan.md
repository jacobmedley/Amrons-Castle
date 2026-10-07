# Kingdom signals

Status: implemented and locally verified on October 7, 2026. See [verification](verification.md) for browser evidence, automated checks, and the account-allowance and savings-data limitations. The approved castle artwork and existing behavior remain the baseline.

## Outcome

Make Amron's Castle fill the available screen, show the kingdom's work at a glance, and take a user from a status badge straight to the next relevant agent and task. Add expressive fantasy motion and a compact telemetry readout without obscuring status or compromising the independent standalone Demo.

The design reference is the user's Token Use screenshot and [Token Use](https://tokenuse.app/), reviewed on October 7, 2026. Borrow compact metrics, subtle dividers, utilization bars, and activity traces. Preserve the castle's parchment, dark stone, emerald, gold and violet styling. Do not copy its assets or turn the castle into a dense analytics dashboard.

## Shared direction

- Keep Queen Amron's name, appearance, identity and role. Keep all seven specialists persistent. Tasks change owner; people do not become different specialists.
- Default to the independent fictional Demo. Genesis remains an optional authenticated observation adapter. Preserve its canonical review controls and existing Demo link.
- Use native CSS Grid, flexible tracks, `minmax`, `clamp` and container-aware sizing in the existing React application. An additional layout dependency is not required.
- Keep castle art crisp, correctly proportioned, and dominant. Extend the usable canvas area on large displays rather than stretching raster pixels independently on each axis.
- Real tasks must come from recorded work. These enhancement quests are a development backlog; do not fabricate running jobs to populate the map.

## Quest 1: Expand the realm

**Purpose:** use available desktop space while retaining a usable phone layout.

- Replace restrictive page-width assumptions with a fluid shell and responsive main/detail grid. Use modest gutters that scale with the viewport.
- Give the castle the main track. Keep the detail panel readable and bounded; collapse it to the established bottom panel on narrow screens.
- Preserve zoom, pan, room navigation, Fit castle, agent selection and keyboard equivalents through resize and orientation changes.
- Tighten paragraph leading and excess vertical spacing. Give definition lists and tabular rows more horizontal separation, tabular numerals and subtle rule lines.
- Keep touch targets, text contrast, focus indicators and readable minimum type sizes. Do not make paragraphs cramped to achieve density.

## Quest 2: Rally to the next task

**Purpose:** make Working, Needs you and Complete badges actionable queue controls.

- Build a shared typed projection for status counts, queue entries and per-agent badges. Keep Demo and live evidence rules separate at their adapter boundary.
- Use icon, text and count together. Working uses emerald or turquoise; Needs you uses warm gold; Complete uses a quieter success treatment. Blocked/error and unknown remain distinguishable and inspectable.
- Zero-count badges are visible and inactive. Active badges select the next task in their queue, center its known agent, and open the matching task details. Repeated clicks advance and wrap with a visible position such as `2 of 4`.
- Use stable task identities for cursor state. Handle additions, removals and state changes without skipping or selecting the wrong item. Do not rely on polling response order.
- Order by a verified entered-state/queue timestamp when available, oldest first. The current live adapter has only `updated`; label it as recorded update order rather than pretending it is arrival order. Invalid/missing dates sort deterministically after dated entries, using task identity as a tie break.
- Keep multiple tasks for the same agent as separate queue entries. Selecting an entry opens that particular task, not an arbitrary first task at that agent.
- Add a Scene focus-agent operation that accounts for the current position and camera. Navigation must work after manual pan/zoom, from work view, and when the target label was off-screen.
- Show matching status/count badges beside responsible characters. Prioritize attention when an agent has multiple states; expose the full breakdown in details.
- Live completed runs have no current owner in the existing contract. Open their recorded completion details instead of inventing an agent assignment. Use a last-owner link only when explicit evidence supports it. Demo completed tasks can use their recorded owner.
- Stale/partial snapshots retain labeled last-known information and inspection links. They must not present counts as confirmed current state or simulate current working motion.

## Quest 3: Light the signal beacons

**Purpose:** make relevant changes noticeable without interrupting exploration.

- Use restrained magic halos, status-coded badge accents, and a clear exclamation above an agent needing attention. Avoid rapid flashes or continuous large motion.
- Add an accessible notification ledger with unread count, status, agent/task, and a direct action to inspect the relevant item.
- Deduplicate polling observations by stable task identity plus meaningful transition/version. A first snapshot establishes a baseline; it should not produce a toast flood for historical completions.
- Bound retained notifications. Marking read is local UI state and must not approve or alter real work. Demo reset clears its notifications and queue cursors.
- Use a polite live region for concise updates. Do not steal focus. Render a static alternative when motion is paused or reduced.

## Quest 4: Bring the inhabitants to life

**Purpose:** let idle characters relax and characters needing attention visibly signal the user.

- Add distinct original idle activities across the cast: relaxed poses, sleeping with a subtle sleep cue, or a small game/chess activity where it fits their workstation.
- Add attention expressions such as a gentle wave or short hop with the exclamation cue. Keep the signal readable at castle-fit scale.
- An idle vignette is decorative. Do not imply an LLM is reading, generating, or using tokens when no verified work is running. Live unknown/stale activity needs a neutral state rather than invented observed idle behavior.
- Respect Pause motion, reduced motion and page visibility for sprites, CSS effects, camera transitions and notifications. Manual pause remains independent of the operating-system preference.
- Keep work animations and collision-free routes. Do not move characters through furniture or walls to stage an idle activity.
- Existing raster sheets contain measured, nonuniform frame bounds. Inspect them before reuse. If sleep/game/wave poses are missing, produce matching original transparent raster poses using the image-generation workflow; do not call existing work frames sleep/chess animations.
- Verify alpha, pixel scale, frame anchors, palette, silhouette and clipping. Keep a static fallback if an asset is unavailable; report any unimplemented pose honestly.

## Quest 5: Read the royal ledger

**Purpose:** replace the large observation banner with a small, truthful readout inspired by Token Use.

- Put actionable work badges first, followed by compact usage cells and an optional tiny activity trace. Use a single compact desktop band, wrapping into a clear grid on phones.
- Show account allowance remaining and reset time where a supported runtime source provides them. Label the provider, account scope, window and observation time. Allowance percentages are not token or dollar balances.
- Show measured input/output and cache reuse from a selected, labeled source and window. An expanded view can expose calls, sessions, model/project breakdowns, source coverage and an activity chart when those are actually available.
- Use a small native select or segmented control for supported windows. A source that only supports the current month must remain visibly monthly; do not relabel it as seven days to match another source.
- Use actual time buckets for activity traces. Missing history produces an unavailable/empty state, not decorative fabricated telemetry.
- A `Tokens saved` field requires a measured counterfactual baseline with documented scope. Until then show `Not measured` in details and use `Cache reused` for measured cache-read tokens in the compact band. Avoid implying that reuse reduced the total tokens processed.
- If estimated cost is shown, label it as a rate-based estimate, not subscription charges or dollars spent. Do not infer a bill from the reference screenshot.
- Never sum Genesis pipeline, local runner, desktop CLI and Token Use totals without established nonoverlap. Existing groups have overlapping coverage. Preserve partial/unknown/error states rather than replacing them with zero.
- Move `Requested settings ≠ runtime acceptance` into a short footnote, with access to the detailed model/effort explanation. Do not hide connection errors or incomplete observation warnings in that footnote.
- Use the existing authenticated host telemetry and installed read-only integration where possible. First inspect its contracts and accounting notes. Do not introduce provider credentials, call providers, scan arbitrary transcripts, or install another tracker just for this UI.
- The Codex app usage tool can verify an account snapshot during development, but the browser cannot call that tool. Do not hard-code its response as live data. Trace an existing supported host bridge or expose a clearly unavailable allowance state until a bridge is implemented and verified.
- Keep private account data out of public source, fixtures, screenshots and commits. Build public verification fixtures with clearly fictional data.

## Implementation sequence and checkpoint

1. Inspect the existing React, Canvas and adapter contracts. Preserve the clean baseline and existing tests.
2. Implement the fluid shell, shared status queues, badge navigation, and compact readout with source-safe sample fixtures.
3. Check the full castle composition with one genuine idle activity and one attention state before expanding animation variants. Inspect desktop and phone in the browser; preserve the approved artwork.
4. Complete notifications, cast motion, live telemetry bindings and typography. Keep the Demo usable without a host.
5. Run focused checks, review evidence, build, and update the existing local previews. Record any source limitations. Do not publish new account telemetry or deploy a public site.

Estimated cloud text work: 18,000-32,000 tokens including orchestration, bounded worker work, review and retries. Image generation is separate. Local work is deterministic inspection, builds, tests and browser rendering. No model download, paid fallback or additional purchase is authorized. Reassess if telemetry needs substantial backend changes.

## Acceptance checks

- At 390px, tablet, 1440px and a wide desktop viewport: no unintended horizontal page overflow; useful castle area; readable details; no stretched art; compact readout and adequate touch targets.
- Keyboard: navigate each badge and queue entry, select a room/agent, inspect details, dismiss with Escape and restore focus. Off-screen labels do not trap focus.
- Queue tests: zero, one, multiple tasks at one/multiple agents, stable ordering, invalid dates, repeated cycling, removed entries, state changes, completed runs without owners, unknown stages and stale/partial data.
- Notification tests: initial snapshot baseline, repeated polls, meaningful transitions, reconnect, bounded history, read state and Demo reset.
- Motion checks: idle and attention readable; working matches supported state; no wall/furniture traversal; frame anchors stable; pause/reduced-motion/hidden-page behavior verified.
- Telemetry tests: missing, partial, stale and unavailable sources; distinct windows; no double counting; cache semantics; no invented savings or billed cost; unknown accepted settings stay unknown.
- Preserve the full Demo approval/revision journey and approval pauses. Live review links still use canonical host controls with no Castle mutations.
- Run typecheck, focused tests and build. If the optional host backend changes, run its required suite and update its durable state last.
- Deliver browser-checked local Demo and live views, with a short visual verification record and public-safe screenshots. Keep repository ownership and licensing intact.
