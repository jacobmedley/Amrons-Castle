# Trace the artwork

The environment and sprites were created for this project on October 7, 2026, using the built-in image generation tool. They are generated raster artwork, not hand-drawn assets or extracted game sprites. Jacob chose the MIT License for the project and original artwork. The queen was subsequently renamed Amron, inspired by his wife; asset filenames and included prompt text use the new name. The raster pixels and measured frame bounds are unchanged.

| Asset | Dimensions | Creation and use |
|---|---|---|
| `public/assets/castle.png` | 1536 × 1024 | One environment generation: a roofless stone castle, six areas, warm torches, emerald forest and turquoise pool. A decorative suit of armor in the Great Hall belongs to the background, not the agent roster. |
| `public/assets/amron.png` | 1498 × 1050, transparent | One character generation: eight poses for Amron, with four command/idle frames and four walking frames. |
| `public/assets/specialists.png` | 1024 × 1536, transparent | One character generation: six specialists with four action poses each. |
| `public/assets/specialists-frames.json` | Structured metadata | Measured source rectangles and foot anchors for the specialist sprites. Generated sheet spacing is not assumed to be uniform. |
| `public/assets/idle.png` | 1536 × 1024, transparent | Fourteen new idle poses: two each for Amron and the six specialists. Tea, sleep, stretching and chess activities; generated with the built-in image tool using the original cast sheets as identity references. Measured unequal row heights and per-frame foot anchors are in `src/assets.ts`. |

The application preserves the original raster files. It selects measured frames and renders them at a consistent display scale with image smoothing disabled. World coordinates and walkable routes follow the resulting environment rather than the coordinates initially requested in the art prompt.

The full idle-generation prompt is saved in [public/assets/idle.prompt.txt](public/assets/idle.prompt.txt). The generated PNG is used unchanged with its alpha channel. The [frame check](docs/changes/kingdom-signals/screenshots/idle-frame-check.png) renders both poses at their measured ground anchors. Attention hops, exclamation signals and halos are runtime Canvas/HTML effects. Idle vignettes are decorative and do not establish model activity.

## Identify the references

The project owner supplied Secret of Mana screenshots as references for overhead RPG perspective, textured castle stonework and luminous woodland color. Those screenshots are excluded from this public package. No artwork was downloaded or extracted from the game or its sprite catalog.

The owner also referenced [AgentOffice](https://github.com/harishkotra/agent-office) and [Pixel Agents](https://github.com/pixel-agents-hq/pixel-agents) as interaction inspiration for visible agents at work. Their engines and source code are not incorporated. These references do not imply endorsement or affiliation.

The generated result is an original interpretation of a 16-bit RPG aesthetic, not a claim of compliance with historical console palette or hardware limits.

## Distinguish other assets

Interface icons come from Phosphor. DM Sans and Cormorant Garamond provide the typography. Their inspected license texts are included in [licenses/](licenses/) and summarized in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The images in [screenshots/](screenshots/) are browser captures of the renamed fictional demo. They are not additional generated illustrations and contain no private dashboard records. [Screenshot captions](screenshot-captions.md) describe the exact visible state.
