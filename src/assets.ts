import type { Agent } from './model';
export type Frame = { x: number; y: number; w: number; h: number; footX: number; footY: number; row?: number; frame?: number };
export type Assets = { castle: HTMLImageElement; amron: HTMLImageElement; specialists: HTMLImageElement; frames: Frame[] };
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
const loadImage=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Castle artwork could not load.'));image.src=url;});
const assetUrl=(name:string)=>new URL(`assets/${name}`,document.baseURI).href;
export async function loadAssets(): Promise<Assets> {
  const [castle,amron,specialists,frames]=await Promise.all([loadImage(assetUrl('castle.png')),loadImage(assetUrl('amron.png')),loadImage(assetUrl('specialists.png')),fetch(assetUrl('specialists-frames.json')).then(r=>{if(!r.ok)throw new Error('Character frames unavailable.');return r.json() as Promise<Frame[]>;})]);
  return {castle,amron,specialists,frames};
}
