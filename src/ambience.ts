import type { Assets } from './assets';

export const LOKI = { x: 658, y: 266 };
const torches = [[622,67],[703,68],[905,68],[980,67],[282,193],[498,195],[161,406],[588,334],[658,344],[945,344],[1015,334],[1096,193],[1397,212],[598,447],[1005,447],[1120,518],[1337,518],[598,667],[1005,667],[735,723],[870,723],[1415,596]];
const TAU = Math.PI * 2;

// Paths stay inside surveyed open water, clear of stepping stones and the bank.
export function fishPosition(time: number, index: number) {
  const a=time/4100+index*TAU/3;
  return {x:312+Math.cos(a)*29, y:727+Math.sin(a)*17, angle:Math.atan2(Math.cos(a)*17,-Math.sin(a)*29)};
}
export function fairyPhase(time: number, seed: number, invitedAt: number | null = null) {
  if (invitedAt !== null && time-invitedAt >= 0 && time-invitedAt < 8000) return time-invitedAt;
  const first=14000+seed*9000, period=51000+seed*23000;
  if (time<first) return -1;
  const phase=(time-first)%period;
  return phase<8000?phase:-1;
}
function glow(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha:number) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');
  ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
export function paintEnvironment(ctx:CanvasRenderingContext2D,time:number) {
  ctx.save();ctx.globalCompositeOperation='screen';
  torches.forEach(([x,y],i)=>{
    const flicker=.83+Math.sin(time/237+i*2)*.1+Math.sin(time/113+i)*.06;
    glow(ctx,x,y,58,'#ffae49',.24*flicker);
    ctx.globalAlpha=.52*flicker;ctx.fillStyle='#ffe49b';ctx.fillRect(x-1,y-4,3,Math.round(5+flicker*3));
  });
  // A narrow light shaft originates at the atelier's visible window.
  for(const [x,y] of [[1274,218]]){
    const light=ctx.createLinearGradient(x,y,x-55,y+170);light.addColorStop(0,'#c5ead637');light.addColorStop(1,'#c5ead600');
    ctx.globalAlpha=.75;ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x+10,y);ctx.lineTo(x+6,y+170);ctx.lineTo(x-106,y+170);ctx.closePath();ctx.fill();
    for(let i=0;i<8;i++){const t=(time/90+i*23)%150;ctx.globalAlpha=.15;ctx.fillStyle='#e9e5b7';ctx.fillRect(x-t*.36+(i%3)*10,y+t,2,2);}
  }
  ctx.globalCompositeOperation='source-over';
  // Soft ripples and waterfall glints are clipped to the water, not the surrounding forest.
  ctx.beginPath();ctx.moveTo(209,649);ctx.lineTo(265,651);ctx.lineTo(376,697);ctx.lineTo(398,752);ctx.lineTo(366,803);ctx.lineTo(305,773);ctx.lineTo(263,716);ctx.lineTo(220,700);ctx.closePath();ctx.clip();
  for(let i=0;i<16;i++){
    const x=220+(i*37)%166,y=660+(i*23)%134,phase=(time/3200+i*.19)%1;
    ctx.globalAlpha=(1-phase)*.24;ctx.strokeStyle='#a7ffed';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(x,y,4+phase*15,1+phase*4,0,0,TAU);ctx.stroke();
  }
  for(let i=0;i<3;i++){
    const fish=fishPosition(time,i);ctx.save();ctx.translate(Math.round(fish.x),Math.round(fish.y));ctx.rotate(fish.angle);
    ctx.globalAlpha=.85;ctx.fillStyle=i===1?'#ffc57c':'#e2edcb';ctx.fillRect(-4,-2,8,4);ctx.fillRect(4,-1,2,2);
    ctx.fillStyle='#ca8d55';const tail=Math.sin(time/130+i)>0?1:-1;ctx.fillRect(-7,tail-2,3,3);ctx.fillStyle='#174e49';ctx.fillRect(3,-1,1,1);ctx.restore();
  }
  ctx.restore();
}
export function paintCompanion(ctx:CanvasRenderingContext2D,assets:Assets,time:number,event:number) {
  if(!assets.loki)return;
  const jump=event>=4600&&event<5900?Math.sin((event-4600)/1300*Math.PI)*30:0;
  const row=jump>0?4:event>=5900&&event<7300?7:0;
  const frame=row===4?Math.min(4,Math.floor((event-4600)/260)):row===7?Math.min(5,Math.floor((event-5900)/230)):Math.floor(time/340)%7;
  ctx.save();ctx.fillStyle='#07161199';ctx.beginPath();ctx.ellipse(LOKI.x,LOKI.y+1,18,5,0,0,TAU);ctx.fill();ctx.shadowColor='#fff0c799';ctx.shadowBlur=5;
  ctx.drawImage(assets.loki,frame*192,row*208,192,208,LOKI.x-29,LOKI.y-62-jump,58,63);ctx.restore();
  if(event<0)return;
  if(event<5650){
    const t=Math.min(1,event/5650),x=822+(LOKI.x-822)*t+Math.sin(t*TAU*2)*22*(1-t),y=128+(LOKI.y-54-128)*t+Math.sin(t*TAU*3)*12;
    ctx.save();ctx.globalCompositeOperation='screen';glow(ctx,x,y,22,'#b3f4ff',.5);ctx.globalAlpha=.9;
    ctx.fillStyle='#c2e9ff';const wing=Math.sin(time/55)>0?6:3;ctx.fillRect(x-wing,y-3,wing*2,2);ctx.fillRect(x-wing+1,y,wing*2-2,2);
    ctx.fillStyle='#fff1ac';ctx.fillRect(x-1,y-4,3,7);ctx.restore();
  }else if(event<6800){
    ctx.save();const t=(event-5650)/1150;ctx.globalAlpha=1-t;ctx.fillStyle='#fff0a8';
    for(let i=0;i<9;i++){const a=i*TAU/9;ctx.fillRect(LOKI.x+Math.cos(a)*t*24,LOKI.y-43+Math.sin(a)*t*19,2,2);}ctx.restore();
  }
}
