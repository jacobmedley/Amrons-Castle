import { rooms, WORLD, type Point, type RoomId } from './model';

export type CastleVariantId = 'original' | '21x9' | '16x9' | '4x3' | '1x1' | '3x4' | '9x16';
export type Rect = [number, number, number, number];
export type SceneLayout = { id: CastleVariantId; ratio: number; width: number; height: number; bounds: Record<RoomId, Rect> };

const originalBounds = Object.fromEntries(rooms.map(room => [room.id, room.bounds])) as Record<RoomId, Rect>;
export const layouts: SceneLayout[] = [
  { id: '9x16', ratio: 9 / 16, width: 941, height: 1672, bounds: { war: [250, 20, 440, 360], wizard: [50, 300, 290, 410], elf: [600, 300, 300, 410], hall: [350, 380, 240, 970], grounds: [35, 900, 310, 420], forge: [595, 900, 305, 420] } },
  { id: '3x4', ratio: 3 / 4, width: 1086, height: 1448, bounds: { war: [320, 20, 450, 300], wizard: [65, 280, 325, 380], elf: [720, 280, 310, 380], hall: [390, 320, 330, 780], grounds: [60, 680, 330, 440], forge: [720, 790, 310, 310] } },
  { id: '1x1', ratio: 1, width: 1254, height: 1254, bounds: { war: [400, 20, 450, 335], wizard: [80, 200, 305, 400], elf: [870, 200, 320, 400], hall: [420, 355, 430, 585], grounds: [60, 605, 345, 395], forge: [870, 610, 320, 340] } },
  { id: '4x3', ratio: 4 / 3, width: 1448, height: 1086, bounds: { war: [470, 20, 520, 290], wizard: [70, 145, 400, 355], elf: [1000, 145, 390, 355], hall: [500, 310, 450, 490], grounds: [70, 500, 400, 350], forge: [980, 500, 410, 300] } },
  { id: 'original', ratio: 3 / 2, ...WORLD, bounds: originalBounds },
  { id: '16x9', ratio: 16 / 9, width: 1672, height: 941, bounds: { war: [580, 15, 510, 270], wizard: [80, 100, 445, 345], elf: [1140, 100, 420, 345], hall: [640, 285, 400, 435], grounds: [70, 450, 540, 280], forge: [1080, 450, 480, 280] } },
  { id: '21x9', ratio: 21 / 9, width: 1916, height: 821, bounds: { war: [730, 25, 460, 245], wizard: [80, 110, 450, 310], elf: [1400, 110, 430, 310], hall: [700, 270, 520, 370], grounds: [70, 420, 460, 230], forge: [1390, 410, 445, 240] } },
];

export function createSceneLayout(width: number, height: number): SceneLayout {
  const ratio = Math.max(width, 1) / Math.max(height, 1);
  return layouts.reduce((best, candidate) => Math.abs(Math.log(candidate.ratio / ratio)) < Math.abs(Math.log(best.ratio / ratio)) ? candidate : best);
}

export function placePoint(layout: SceneLayout, roomId: RoomId, point: Point): Point {
  if (layout.id === 'original') return point;
  const source = originalBounds[roomId], target = layout.bounds[roomId];
  return { x: target[0] + (point.x - source[0]) * target[2] / source[2], y: target[1] + (point.y - source[1]) * target[3] / source[3] };
}

export function roomLabelPoint(layout: SceneLayout, roomId: RoomId): Point {
  if (layout.id === 'original') return rooms.find(room => room.id === roomId)!.label;
  const [x, y, width] = layout.bounds[roomId];
  return { x: x + width / 2, y: y + 16 };
}

export function roomAt(layout: SceneLayout, point: Point): RoomId | null {
  return rooms.find(room => {
    const [x, y, width, height] = layout.bounds[room.id];
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  })?.id || null;
}
