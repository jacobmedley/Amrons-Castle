import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { agents, rooms, WORLD, agentTask, positionOnPath, toWorld, hitAgent, type Camera, type DemoState, type Point, type RoomId } from './model';
import { paintSprite, type Assets } from './assets';
export type SceneHandle = { fit: () => void; zoom: (factor:number) => void; focusRoom: (id:RoomId) => void };
type Props={assets:Assets;state:DemoState;paused:boolean;reduced:boolean;selected:string|null;onSelect:(id:string)=>void;onRoom:(id:RoomId)=>void;onScale:(scale:number)=>void;animateIdle?:boolean};
const visibleAgents=agents;
export const Scene=forwardRef<SceneHandle,Props>(function Scene({assets,state,paused,reduced,selected,onSelect,onRoom,onScale,animateIdle=true},ref){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const [size,setSize]=useState({width:900,height:600});
  const [camera,setCamera]=useState<Camera>({x:0,y:0,scale:.6});
  const [hover,setHover]=useState<string|null>(null);
  const drag=useRef<{x:number;y:number;camera:Camera;moved:boolean}|null>(null);
  const positions=useRef<{id:string;point:Point}[]>([]);
  const frameTime=useRef(0);
  const fit=useCallback(()=>{const h=host.current;if(!h)return;const scale=Math.min(h.clientWidth/WORLD.width,h.clientHeight/WORLD.height);setCamera({x:(h.clientWidth-WORLD.width*scale)/2,y:(h.clientHeight-WORLD.height*scale)/2,scale});},[]);
  const zoom=useCallback((factor:number,anchor?:Point)=>{setCamera(c=>{const point=anchor||{x:size.width/2,y:size.height/2};const next=Math.max(.25,Math.min(2.5,c.scale*factor));const w=toWorld(point,c);return {x:point.x-w.x*next,y:point.y-w.y*next,scale:next};});},[size]);
  const focusRoom=useCallback((id:RoomId)=>{const room=rooms.find(r=>r.id===id)!;const scale=Math.min(1.35,size.width/560,size.height/440);setCamera({scale,x:size.width/2-room.center.x*scale,y:size.height/2-room.center.y*scale});},[size]);
  useImperativeHandle(ref,()=>({fit,zoom,focusRoom}),[fit,zoom,focusRoom]);
  useEffect(()=>{const h=host.current!;const ro=new ResizeObserver(()=>{setSize({width:h.clientWidth,height:h.clientHeight});fit();});ro.observe(h);return()=>ro.disconnect();},[fit]);
  useEffect(()=>{onScale(camera.scale);},[camera.scale,onScale]);
  useEffect(()=>{const h=host.current!;const wheel=(event:WheelEvent)=>{event.preventDefault();const b=h.getBoundingClientRect();zoom(Math.exp(-event.deltaY*.0015),{x:event.clientX-b.left,y:event.clientY-b.top});};h.addEventListener('wheel',wheel,{passive:false});return()=>h.removeEventListener('wheel',wheel);},[zoom]);
  useEffect(()=>{
    let request=0,last=0;
    const draw=(now:number)=>{
      const cv=canvas.current;if(!cv)return;const ctx=cv.getContext('2d')!;const dpr=window.devicePixelRatio||1;
      if(cv.width!==Math.round(size.width*dpr)||cv.height!==Math.round(size.height*dpr)){cv.width=Math.round(size.width*dpr);cv.height=Math.round(size.height*dpr);}
      if(!paused&&!document.hidden&&last)frameTime.current+=Math.min(now-last,80);last=now;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size.width,size.height);ctx.fillStyle='#0c1713';ctx.fillRect(0,0,size.width,size.height);
      ctx.translate(camera.x,camera.y);ctx.scale(camera.scale,camera.scale);ctx.imageSmoothingEnabled=false;ctx.drawImage(assets.castle,0,0,WORLD.width,WORLD.height);
      positions.current=visibleAgents.map(agent=>{const travel=!reduced&&state.travel.find(t=>t.agent===agent.id);return {id:agent.id,point:travel?positionOnPath(travel.path,travel.elapsed/travel.duration):agent.position};});
      const sorted=[...positions.current].sort((a,b)=>a.point.y-b.point.y);
      for(const {id,point:p} of sorted){const agent=agents.find(a=>a.id===id)!;const task=agentTask(state,id);const walking=state.travel.some(t=>t.agent===id);const working=task?.status==='working';
        if(selected===id||hover===id){ctx.strokeStyle=agent.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y+2,27,9,0,0,Math.PI*2);ctx.stroke();}
        const frame=(!paused&&(walking||working||(animateIdle&&id==='amron')))?Math.floor(frameTime.current/(walking?160:id==='amron'?1000:350))%4:0;
        const bob=walking&&!paused?Math.sin(frameTime.current/110)*2:0;
        paintSprite(ctx,assets,agent,p.x,p.y+bob,frame,walking);
      }
      if(!paused&&!document.hidden)request=requestAnimationFrame(draw);
    };request=requestAnimationFrame(draw);return()=>cancelAnimationFrame(request);
  },[assets,state,paused,reduced,selected,hover,camera,size,animateIdle]);
  const local=(event:React.PointerEvent)=>{const rect=host.current!.getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top};};
  const labelVisible=(x:number,y:number)=>x>=10&&x<=size.width-10&&y>=5&&y<=size.height-35;
  return <div ref={host} className="castle-scene" data-testid="castle-scene">
    <canvas ref={canvas} aria-label="Overhead pixel-art castle. Use the room and agent buttons to explore." role="img"
      onPointerDown={event=>{if(event.button!==0)return;const p=local(event);drag.current={...p,camera,moved:false};event.currentTarget.setPointerCapture(event.pointerId);}}
      onPointerMove={event=>{const p=local(event);if(drag.current){const d=drag.current,dx=p.x-d.x,dy=p.y-d.y;if(Math.hypot(dx,dy)>5)d.moved=true;if(d.moved)setCamera({...d.camera,x:d.camera.x+dx,y:d.camera.y+dy});}else setHover(hitAgent(toWorld(p,camera),positions.current)||null);}}
      onPointerUp={event=>{const d=drag.current;drag.current=null;if(!d||d.moved)return;const point=toWorld(local(event),camera);const hit=hitAgent(point,positions.current);if(hit){onSelect(hit);return;}const room=rooms.find(r=>point.x>=r.bounds[0]&&point.x<=r.bounds[0]+r.bounds[2]&&point.y>=r.bounds[1]&&point.y<=r.bounds[1]+r.bounds[3]);if(room){focusRoom(room.id);onRoom(room.id);}}}
      onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} style={{cursor:drag.current?'grabbing':hover?'pointer':'grab'}} />
    <div className="map-labels" aria-label="Castle rooms">{rooms.map(room=>{const x=camera.x+room.label.x*camera.scale,y=camera.y+room.label.y*camera.scale,visible=labelVisible(x,y);return <button key={room.id} className="room-label" tabIndex={visible?0:-1} aria-hidden={!visible} style={{left:x,top:y,visibility:visible?'visible':'hidden'}} onClick={()=>{focusRoom(room.id);onRoom(room.id);}}>{room.name}</button>;})}</div>
    <div className="map-agent-labels" aria-label="Characters on the map">{visibleAgents.map(agent=>{const travel=!reduced&&state.travel.find(t=>t.agent===agent.id);const p=travel?positionOnPath(travel.path,travel.elapsed/travel.duration):agent.position;const task=agentTask(state,agent.id);const x=camera.x+p.x*camera.scale,y=camera.y+(p.y+14)*camera.scale,visible=labelVisible(x,y);return <button key={agent.id} tabIndex={visible?0:-1} aria-hidden={!visible} aria-label={`Select ${agent.name}, ${agent.title}`} className={`agent-pin ${selected===agent.id?'selected':''} ${task?.status||'ready'}`} style={{left:x,top:y,visibility:visible?'visible':'hidden','--agent-color':agent.color} as React.CSSProperties} onClick={()=>onSelect(agent.id)}><i/>{agent.name}{task?.status==='review'&&<span className="pin-alert">!</span>}</button>;})}</div>
  </div>;
});
