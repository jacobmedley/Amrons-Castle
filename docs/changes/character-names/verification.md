# Character display names

October 10, 2026 · AC-101 · unreleased feature branch.

The settings dialog edits the seven agents' display names and the castle companion name. Amron remains the default coordinator identity; a shortcut fills Dot as her display name. Preferences are versioned in local browser storage, validated to 1–28 characters, and can be restored to defaults. Demo and optional live views use the same local preferences on the same origin. Agent IDs, roles, task ownership, model reporting and approvals remain unchanged. The app does not claim that renaming Amron connects it to a ChatGPT dot.

## Checks

- TypeScript check, production build and 39 tests passed. Focused tests cover valid, blank, overlong, control-character, malformed and unknown-version name data, plus the unchanged coordinator ID.
- In-app browser: opened the editor, used the Dot shortcut, renamed the companion, and verified the toolbar, map labels, accessible labels and coordinator card updated. Opened the editor at a phone-sized viewport, saved a long coordinator name, and confirmed the view remained usable. Restored the original names and viewport afterward.

## Pet connection boundary

The standalone page has no authenticated source for the account's selected ChatGPT pet or its sprite artwork. The current pet selection was Default when inspected, so there was no active pet to mirror. AC-118 tracks a host connection for the selected pet's stable ID, name and appearance, with fallback to LOKI. No account pet data or artwork is committed here.
