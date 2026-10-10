import { rooms, WORLD, type Point, type RoomId } from './model';

export type RoomTile = { id: RoomId; source: [number, number, number, number]; x: number; y: number; width: number; height: number };
export type SceneLayout = { mode: 'original' | 'portrait' | 'panorama'; width: number; height: number; tiles: RoomTile[] };

export function createSceneLayout(width: number, height: number): SceneLayout {
  const ratio = width / Math.max(height, 1);
  const mode = width < 680 || ratio < 1.05 ? 'portrait' : ratio > 2.05 ? 'panorama' : 'original';
  if (mode === 'original') return { mode, ...WORLD, tiles: [] };
  const columns = mode === 'portrait' ? 2 : 3;
  const cellWidth = 530, cellHeight = 385;
  const order: RoomId[] = mode === 'portrait'
    ? ['war', 'wizard', 'elf', 'hall', 'grounds', 'forge']
    : ['wizard', 'war', 'elf', 'grounds', 'hall', 'forge'];
  const tiles = order.map((id, index) => {
    const room = rooms.find(item => item.id === id)!;
    const [sx, sy, sw, sh] = room.bounds;
    return { id, source: room.bounds, x: (index % columns) * cellWidth + (cellWidth - sw) / 2, y: Math.floor(index / columns) * cellHeight + (cellHeight - sh) / 2, width: sw, height: sh };
  });
  return { mode, width: columns * cellWidth, height: Math.ceil(order.length / columns) * cellHeight, tiles };
}

export function placePoint(layout: SceneLayout, roomId: RoomId, point: Point): Point {
  if (layout.mode === 'original') return point;
  const tile = layout.tiles.find(item => item.id === roomId)!;
  return { x: tile.x + point.x - tile.source[0], y: tile.y + point.y - tile.source[1] };
}

export function roomLabelPoint(layout: SceneLayout, roomId: RoomId): Point {
  const room = rooms.find(item => item.id === roomId)!;
  if (layout.mode === 'original') return room.label;
  const tile = layout.tiles.find(item => item.id === roomId)!;
  return { x: tile.x + tile.width / 2, y: tile.y + 12 };
}

export function roomAt(layout: SceneLayout, point: Point): RoomId | null {
  if (layout.mode === 'original') {
    return rooms.find(room => point.x >= room.bounds[0] && point.x <= room.bounds[0] + room.bounds[2] && point.y >= room.bounds[1] && point.y <= room.bounds[1] + room.bounds[3])?.id || null;
  }
  return layout.tiles.find(tile => point.x >= tile.x && point.x <= tile.x + tile.width && point.y >= tile.y && point.y <= tile.y + tile.height)?.id || null;
}
