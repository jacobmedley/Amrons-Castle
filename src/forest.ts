import type { Camera } from './model';

// A mirrored woodland tile extends the existing painting without moving its rooms.
// Cache one small repeatable tile and paint only the visible camera bounds.
const TILE = 1024;
const patterns = new WeakMap<HTMLImageElement, CanvasPattern>();

function forestPattern(ctx: CanvasRenderingContext2D, forest: HTMLImageElement) {
  const existing = patterns.get(forest);
  if (existing) return existing;
  const tile = document.createElement('canvas');
  tile.width = tile.height = TILE * 2;
  const tiles = tile.getContext('2d')!;
  tiles.imageSmoothingEnabled = false;
  for (let row = 0; row < 2; row++) for (let column = 0; column < 2; column++) {
    tiles.save();
    tiles.translate(column * TILE + (column ? TILE : 0), row * TILE + (row ? TILE : 0));
    tiles.scale(column ? -1 : 1, row ? -1 : 1);
    tiles.drawImage(forest, 115, 115, TILE, TILE, 0, 0, TILE, TILE);
    tiles.restore();
  }
  const pattern = ctx.createPattern(tile, 'repeat')!;
  patterns.set(forest, pattern);
  return pattern;
}

export function paintForest(ctx: CanvasRenderingContext2D, forest: HTMLImageElement, camera: Camera, width: number, height: number) {
  const left = -camera.x / camera.scale;
  const top = -camera.y / camera.scale;
  ctx.fillStyle = forestPattern(ctx, forest);
  ctx.fillRect(left, top, width / camera.scale, height / camera.scale);
}
