import type { Agent } from './model';
export type Frame = { x: number; y: number; w: number; h: number; footX: number; footY: number; row?: number; frame?: number };
export type Assets = { castle: HTMLImageElement; forest: HTMLImageElement; amron: HTMLImageElement; specialists: HTMLImageElement; frames: Frame[]; idle: HTMLImageElement | null; attention: HTMLImageElement | null; loki: HTMLImageElement | null };
export const idleActivities: Record<string, string> = { amron: 'Taking a quiet moment', orin: 'Resting', mira: 'Playing chess', liora: 'Stretching', quill: 'Enjoying tea', borin: 'Resting', flint: 'Playing chess' };
// Generated atlas has uneven row heights. Anchors are measured at the feet/stool,
// not the prop's center, so a raised cup or chess move never shifts the actor.
export const idleFrames: Record<string, { row: [number, number]; columns: [number, number]; feet: [number, number]; scale: number }> = {
  amron: { row: [0, 313], columns: [0, 1], feet: [202, 181], scale: .23 },
  orin: { row: [0, 313], columns: [2, 3], feet: [189, 193], scale: .205 },
  mira: { row: [313, 255], columns: [0, 1], feet: [154, 142], scale: .205 },
  liora: { row: [313, 255], columns: [2, 3], feet: [188, 188], scale: .25 },
  quill: { row: [568, 245], columns: [0, 1], feet: [190, 176], scale: .225 },
  borin: { row: [568, 245], columns: [2, 3], feet: [182, 186], scale: .215 },
  flint: { row: [813, 211], columns: [0, 1], feet: [168, 166], scale: .245 },
};
const idleBaselines: Record<string, number> = { amron: 306, orin: 300, mira: 255, liora: 252, quill: 241, borin: 236, flint: 201 };
export function paintIdle(ctx: CanvasRenderingContext2D, assets: Assets, agent: Agent, x: number, y: number, frame: number) {
  if (!assets.idle) { paintSprite(ctx, assets, agent, x, y); return; }
  const data = idleFrames[agent.id], index = frame % 2;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(assets.idle, data.columns[index] * 384, data.row[0], 384, data.row[1], Math.round(x - data.feet[index] * data.scale), Math.round(y - idleBaselines[agent.id] * data.scale), Math.round(384 * data.scale), Math.round(data.row[1] * data.scale));
}
const queenRects = [[40,22,313,487],[408,22,314,487],[785,22,314,487],[1154,22,314,487],[37,546,327,473],[409,549,324,470],[757,549,340,470],[1132,540,332,479]];
export function getFrame(assets: Assets, agent: Agent, frame = 0, walking = false): { image: HTMLImageElement; rect: Frame; scale: number } {
  if (agent.id === 'amron') {
    const [x,y,w,h] = queenRects[(walking ? 4 : 0) + frame % 4];
    return { image: assets.amron, rect: { x,y,w,h,footX:w/2,footY:h }, scale: .14 };
  }
  return { image: assets.specialists, rect: assets.frames[agent.spriteRow*4 + frame%4], scale: .26 };
}
export function paintSprite(ctx: CanvasRenderingContext2D, assets: Assets, agent: Agent, x: number, y: number, frame=0, walking=false, sizeMultiplier=1) {
  const { image, rect:r, scale } = getFrame(assets,agent,frame,walking);
  const s=scale*sizeMultiplier;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,r.x,r.y,r.w,r.h,Math.round(x-r.footX*s),Math.round(y-r.footY*s),Math.round(r.w*s),Math.round(r.h*s));
}
// Each raised-arm pose uses the same floor anchor, measured independently of the hands.
export function paintAttention(ctx: CanvasRenderingContext2D, assets: Assets, agent: Agent, x: number, y: number, frame: number) {
  if (!assets.attention || agent.id !== 'borin') { paintSprite(ctx, assets, agent, x, y); return; }
  const poses = [[0,0,603,651,318,558],[603,0,604,651,309,558],[0,651,603,652,318,515],[603,651,604,652,291,515]];
  const [sx,sy,w,h,fx,fy] = poses[frame % 4], s = .116;
  ctx.drawImage(assets.attention,sx,sy,w,h,Math.round(x-fx*s),Math.round(y-fy*s),Math.round(w*s),Math.round(h*s));
}
const loadImage=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Castle artwork could not load.'));image.src=url;});
const assetUrl=(name:string)=>new URL(`assets/${name}`,document.baseURI).href;
export async function loadAssets(): Promise<Assets> {
  const [castle,forest,amron,specialists,frames,idle,attention,loki]=await Promise.all([loadImage(assetUrl('castle.png')),loadImage(assetUrl('enchanted-forest.png')),loadImage(assetUrl('amron.png')),loadImage(assetUrl('specialists.png')),fetch(assetUrl('specialists-frames.json')).then(r=>{if(!r.ok)throw new Error('Character frames unavailable.');return r.json() as Promise<Frame[]>;}),loadImage(assetUrl('idle.png')).catch(()=>null),loadImage(assetUrl('borin-attention.png')).catch(()=>null),loadImage(assetUrl('loki.png')).catch(()=>null)]);
  return {castle,forest,amron,specialists,frames,idle,attention,loki};
}
