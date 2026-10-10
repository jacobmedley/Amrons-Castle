# Full-screen command view verification

October 9, 2026 · local feature branch `feat/fullscreen-command-view` · AC-110 · unreleased.

## Change

The Demo and optional live view use the same three-part workspace: command sidebar, castle or work board, and details. Navigation, status queues, notification signals and the usage ledger live in the sidebar. The castle fills the available center column and viewport height on a wide screen. The details panel scrolls independently. The existing scene, camera, task records and review boundaries were not changed.

At intermediate widths, commands stay beside the scene and details move below it. On a narrow screen, commands, castle and details form a vertical flow. The usage ledger expands within the sidebar to avoid clipping. Its contents remain separate from the task queue and do not alter the castle camera. Pause motion and operating-system reduced motion still use the existing scene behavior.

## Checks

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed: 35/35 existing tests.
- `npm.cmd run build` passed.
- Browser inspection covered desktop and a phone-sized viewport override. No horizontal document overflow was observed. The queue badge opened the corresponding task details and focused the responsible character. Fit castle restored the overview. The expanded ledger remained readable and caused no horizontal overflow.
- The optional live view was checked without a compatible host. It kept unavailable usage and unconfirmed activity explicit; no live work, account data or model call was created by this check.

Browser inspection does not establish full accessibility conformance or physical-device coverage. This branch has not been released, deployed or installed into the Genesis static host.
