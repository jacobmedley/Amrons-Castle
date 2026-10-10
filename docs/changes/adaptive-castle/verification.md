# Adaptive castle layout verification

October 10, 2026 · local feature branch `feat/adaptive-castle-layout` · AC-117 · unreleased.

## Change

The six rooms use their original painted arrangement when the scene has a suitable aspect ratio. A narrow or tall scene places the rooms in two columns and three rows. A short, wide scene places them in three columns and two rows. The renderer crops each room from the existing castle painting, then moves its character sprites, companion, decorative effects, room labels and hit area with the tile. Focus and Fit castle use the active arrangement. Changing layout mode returns the camera to its overview, avoiding a stale camera position after rotation.

A generated woodland texture fills space outside the original painting and between tiles. Its centered crop is mirrored to form a repeatable pattern. On smaller screens, the zoom and motion controls occupy a strip below the scene so they do not cover the lower rooms. The command sidebar remains scrollable in short landscape view.

The portrait and panoramic arrangements are composed from rectangular painted crops, so architecture at the crop boundaries does not connect as it does in the original castle. Walk travel is shown in the original arrangement; in a rearranged view, characters remain at their room stations while the task state and signals continue normally. Reconnecting room corridors and animating travel between moved rooms would require modular room art and a new path model.

## Checks

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed: 37/37 tests, including arrangement selection and room geometry.
- `npm.cmd run build` passed.
- In-app browser inspection covered 1920 × 1080 desktop, 390 × 844 portrait and 844 × 390 short landscape viewport overrides. The room tiles and woodland filled each scene shape. Portrait controls did not cover the lower room tiles. No horizontal document overflow was observed in the narrow view.
- Selecting Elven Atelier in the panoramic arrangement opened its details and focused its tile. Fit castle restored the overview. Full screen could be exited, and Quest board navigation remained available.
- The optional live view loaded without a compatible host, retained explicit unconfirmed activity and unavailable usage, and made no model calls from the page.

Browser checks do not establish full accessibility conformance or physical-device coverage. This branch has not been released, deployed or installed into the Genesis static host.
