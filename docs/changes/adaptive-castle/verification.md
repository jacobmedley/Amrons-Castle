# Adaptive castle layout verification

October 10, 2026 · AC-117 · unreleased. The first implementation used isolated room crops. It was replaced on `feat/six-complete-castles` after review.

## Change

The scene selects the closest complete castle composition for its available width and height: 21:9, 16:9, 4:3, 1:1, 3:4 or 9:16. The original 3:2 scene remains a seventh option. Each generated composition is one continuous painting with connected architecture, all six areas and surrounding woodland. Rotation or resizing switches the whole scene and fits the camera to it. The normal and full-screen views use the same selection logic.

Room labels, selection areas, character sprites, LOKI and decorative effects map to areas in each composition. Character identity, room membership and task signals stay unchanged. The woodland texture covers space outside the selected painting. On smaller screens, the zoom and motion controls occupy a strip below the scene so they do not cover the lower rooms. The command sidebar remains scrollable in short landscape view.

Walk travel is shown in the original composition; in generated views, characters remain at their room stations while the task state and signals continue normally. Ambient motion still obeys Pause motion and reduced motion.

## Checks

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed: 37/37 tests, including composition selection and point mapping.
- `npm.cmd run build` passed.
- In-app browser inspection covered all six generated compositions in the expanded castle view. War Room, Wizard Workshop, Elven Atelier, Great Hall, Moonwell Gardens and Dwarven Forge appeared within connected castle walls in each image. Character badges and labels remained in their intended areas. The original 3:2 composition was also inspected.
- Selecting Dwarven Forge in the 4:3 composition opened its details and focused the room. Fit castle restored the overview. The full-screen toggle returned to the command view.
- The earlier command-view and unavailable-live checks remain recorded in their own verification files; this change does not alter task data or adapter behavior.

Browser checks do not establish full accessibility conformance or physical-device coverage. This branch has not been released, deployed or installed into the Genesis static host.
