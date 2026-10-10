import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { agents, rooms, positionOnPath, toWorld, hitAgent, type Camera, type DemoState, type Point, type RoomId } from './model';
import { idleActivities, paintIdle, paintSprite, paintAttention, type Assets } from './assets';
import { WarningCircle } from '@phosphor-icons/react/dist/csr/WarningCircle';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { LOKI, fairyPhase, paintEnvironment, paintCompanion } from './ambience';
import { agentSignal, signalIcons, signalLabels, type SignalEntry } from './signals';
import { paintForest } from './forest';
import { createSceneLayout, placePoint, roomAt, roomLabelPoint } from './sceneLayout';
export type SceneHandle = { fit: () => void; zoom: (factor:number) => void; focusRoom: (id:RoomId) => void; focusAgent: (id:string) => void };
type Props={assets:Assets;state:DemoState;paused:boolean;reduced:boolean;selected:string|null;onSelect:(id:string)=>void;onRoom:(id:RoomId)=>void;onScale:(scale:number)=>void;animateIdle?:boolean; entries?:SignalEntry[]; confirmed?:boolean};
const visibleAgents=agents;
export const Scene=forwardRef<SceneHandle,Props>(function Scene({assets,state,paused,reduced,selected,onSelect,onRoom,onScale,animateIdle=true,entries=[],confirmed=true},ref){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const [size,setSize]=useState({width:900,height:600});
  const layout=useMemo(()=>createSceneLayout(size.width,size.height),[size.width,size.height]);
  const [camera,setCamera]=useState<Camera>({x:0,y:0,scale:.6});
  const [hover,setHover]=useState<string|null>(null);
  const drag=useRef<{x:number;y:number;camera:Camera;moved:boolean}|null>(null);
  const positions=useRef<{id:string;point:Point}[]>([]);
  const frameTime=useRef(0);
  const cameraMode=useRef<'fit'|'manual'>('fit');
  const [lokiOpen,setLokiOpen]=useState(false),[invitedAt,setInvitedAt]=useState<number|null>(null);
  const eventSeed=useRef(Math.random());
  const lokiButton=useRef<HTMLButtonElement>(null);
  const fit=useCallback(()=>{cameraMode.current='fit';const h=host.current;if(!h)return;const scale=Math.min(h.clientWidth/layout.width,h.clientHeight/layout.height);setCamera({x:(h.clientWidth-layout.width*scale)/2,y:(h.clientHeight-layout.height*scale)/2,scale});},[layout]);
  const zoom=useCallback((factor:number,anchor?:Point)=>{cameraMode.current='manual';setCamera(c=>{const point=anchor||{x:size.width/2,y:size.height/2};const next=Math.max(.25,Math.min(2.5,c.scale*factor));const w=toWorld(point,c);return {x:point.x-w.x*next,y:point.y-w.y*next,scale:next};});},[size]);
  const focusRoom=useCallback((id:RoomId)=>{cameraMode.current='manual';const room=rooms.find(r=>r.id===id)!;const point=placePoint(layout,id,room.center);const scale=Math.min(1.35,size.width/560,size.height/440);setCamera({scale,x:size.width/2-point.x*scale,y:size.height/2-point.y*scale});},[size,layout]);
  const focusAgent=useCallback((id:string)=>{const agent=agents.find(item=>item.id===id);const point=positions.current.find(item=>item.id===id)?.point||(agent&&placePoint(layout,agent.room,agent.position));if(!point)return;cameraMode.current='manual';const scale=Math.min(1.5,size.width/480,size.height/340);setCamera({scale,x:size.width/2-point.x*scale,y:size.height/2-(point.y-20)*scale});},[size,layout]);
  useImperativeHandle(ref,()=>({fit,zoom,focusRoom,focusAgent}),[fit,zoom,focusRoom,focusAgent]);
  useEffect(()=>{const h=host.current!;let previous={width:h.clientWidth,height:h.clientHeight};let previousMode=createSceneLayout(previous.width,previous.height).id;
    const ro=new ResizeObserver(()=>{const next={width:h.clientWidth,height:h.clientHeight};setSize(current=>current.width===next.width&&current.height===next.height?current:next);
      const nextLayout=createSceneLayout(next.width,next.height);
      if(cameraMode.current==='fit'||nextLayout.id!==previousMode){cameraMode.current='fit';const scale=Math.min(next.width/nextLayout.width,next.height/nextLayout.height);setCamera({x:(next.width-nextLayout.width*scale)/2,y:(next.height-nextLayout.height*scale)/2,scale});}
      else if(next.width!==previous.width||next.height!==previous.height){const dx=(next.width-previous.width)/2,dy=(next.height-previous.height)/2;setCamera(c=>({...c,x:c.x+dx,y:c.y+dy}));}
      previous=next;previousMode=nextLayout.id;
    });ro.observe(h);return()=>ro.disconnect();},[]);
  useEffect(()=>{onScale(camera.scale);},[camera.scale,onScale]);
  useEffect(()=>{const h=host.current!;const wheel=(event:WheelEvent)=>{event.preventDefault();const b=h.getBoundingClientRect();zoom(Math.exp(-event.deltaY*.0015),{x:event.clientX-b.left,y:event.clientY-b.top});};h.addEventListener('wheel',wheel,{passive:false});return()=>h.removeEventListener('wheel',wheel);},[zoom]);
  useEffect(()=>{
    let request=0,last=0;
    const draw=(now:number)=>{
      const cv=canvas.current;if(!cv)return;const ctx=cv.getContext('2d')!;const dpr=window.devicePixelRatio||1;
      if(cv.width!==Math.round(size.width*dpr)||cv.height!==Math.round(size.height*dpr)){cv.width=Math.round(size.width*dpr);cv.height=Math.round(size.height*dpr);}
      if(!paused&&!document.hidden&&last)frameTime.current+=Math.min(now-last,80);last=now;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size.width,size.height);ctx.fillStyle='#0c1713';ctx.fillRect(0,0,size.width,size.height);
      ctx.translate(camera.x,camera.y);ctx.scale(camera.scale,camera.scale);ctx.imageSmoothingEnabled=false;
      paintForest(ctx,assets.forest,camera,size.width,size.height);
      ctx.drawImage(assets.castles[layout.id],0,0,layout.width,layout.height);
      const ambientTime=reduced?0:frameTime.current;
      if(layout.id==='original')paintEnvironment(ctx,ambientTime);
      else for(const room of rooms){
        const [sx,sy,sw,sh]=room.bounds,[tx,ty,tw,th]=layout.bounds[room.id];
        ctx.save();ctx.translate(tx,ty);ctx.scale(tw/sw,th/sh);ctx.translate(-sx,-sy);
        ctx.beginPath();ctx.rect(sx,sy,sw,sh);ctx.clip();
        paintEnvironment(ctx,ambientTime,room.bounds);
        if(room.id==='war')paintCompanion(ctx,assets,ambientTime,reduced?-1:fairyPhase(ambientTime,eventSeed.current,invitedAt));
        ctx.restore();
      }
      positions.current=visibleAgents.map(agent=>{const travel=layout.id==='original'&&!reduced&&state.travel.find(t=>t.agent===agent.id);const point=travel?positionOnPath(travel.path,travel.elapsed/travel.duration):agent.position;return {id:agent.id,point:placePoint(layout,agent.room,point)};});
      const sorted=[...positions.current].sort((a,b)=>a.point.y-b.point.y);
      for(const {id,point:p} of sorted){
        const agent=agents.find(a=>a.id===id)!;
        const signal=agentSignal(entries,id);
        const walking=layout.id==='original'&&!reduced&&state.travel.some(t=>t.agent===id);
        const working=confirmed&&signal.assigned.some(entry=>entry.status==='working');
        const attention=confirmed&&(signal.status==='review'||signal.status==='blocked');
        const time=reduced?0:frameTime.current;
        const activeColor=attention?(signal.status==='blocked'?'#ff806e':'#e5bd70'):working?'#83ddbb':agent.color;
        // A dark foot shadow and warm silhouette light separate every actor from detailed scenery.
        ctx.save();ctx.fillStyle='#07130ddb';ctx.beginPath();ctx.ellipse(p.x,p.y+2,24,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
        if(selected===id||hover===id||attention||working){
          ctx.save();ctx.strokeStyle=activeColor;ctx.lineWidth=selected===id?2.5:1.5;
          ctx.shadowColor=activeColor;ctx.shadowBlur=attention?10:working?5:0;
          ctx.globalAlpha=selected===id?1:.6;ctx.beginPath();ctx.ellipse(p.x,p.y+2,attention?28:25,9,0,0,Math.PI*2);ctx.stroke();ctx.restore();
        }
        // Attention is a brief in-place hop; it never changes navigation coordinates.
        const phase=time%3600;
        const hop=attention&&phase<600?-Math.sin(phase/600*Math.PI)*7:0;
        const bob=walking?Math.sin(time/110)*2:hop;
        ctx.save();ctx.shadowColor='#fff0c7c0';ctx.shadowBlur=6;ctx.shadowOffsetY=-1;
        if(confirmed&&signal.status==='blocked'&&id==='borin'){
          paintAttention(ctx,assets,agent,p.x,p.y,Math.floor(time/330)%4);
        }else if(animateIdle&&confirmed&&signal.idle&&!walking&&!working){
          paintIdle(ctx,assets,agent,p.x,p.y,Math.floor(time/(id==='liora'?1700:2300))%2);
        }else{
          const frame=walking||working?Math.floor(time/(walking?160:350))%4:attention&&id==='amron'&&phase<1400?3:0;
          paintSprite(ctx,assets,agent,p.x,p.y+bob,frame,walking);
        }
        ctx.restore();
        if(animateIdle&&confirmed&&signal.idle&&(id==='orin'||id==='borin')){
          ctx.fillStyle='#d0cee9';ctx.font='bold 14px monospace';ctx.fillText('z',p.x+18,p.y-58-(reduced?0:(time/500)%9));
        }
      }
      if(layout.id==='original')paintCompanion(ctx,assets,ambientTime,reduced?-1:fairyPhase(ambientTime,eventSeed.current,invitedAt));
      if(!paused&&!document.hidden)request=requestAnimationFrame(draw);
    };request=requestAnimationFrame(draw);return()=>cancelAnimationFrame(request);
  },[assets,state,paused,reduced,selected,hover,camera,size,layout,animateIdle,entries,confirmed,invitedAt]);
  const local=(event:React.PointerEvent)=>{const rect=host.current!.getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top};};
  const labelVisible=(x:number,y:number)=>x>=10&&x<=size.width-10&&y>=5&&y<=size.height-35;
  return <div ref={host} className={`castle-scene ${paused||reduced?'motion-still':'motion-active'} ${camera.scale<.4?'zoom-far':''}`} data-testid="castle-scene">
    <canvas ref={canvas} aria-label="Overhead pixel-art castle. Use the room and agent buttons to explore." role="img"
      onPointerDown={event=>{if(event.button!==0)return;const p=local(event);drag.current={...p,camera,moved:false};event.currentTarget.setPointerCapture(event.pointerId);}}
      onPointerMove={event=>{const p=local(event);if(drag.current){const d=drag.current,dx=p.x-d.x,dy=p.y-d.y;if(Math.hypot(dx,dy)>5)d.moved=true;if(d.moved){cameraMode.current='manual';setCamera({...d.camera,x:d.camera.x+dx,y:d.camera.y+dy});}}else setHover(hitAgent(toWorld(p,camera),positions.current)||null);}}
      onPointerUp={event=>{const d=drag.current;drag.current=null;if(!d||d.moved)return;const point=toWorld(local(event),camera);const hit=hitAgent(point,positions.current);if(hit){onSelect(hit);return;}const room=roomAt(layout,point);if(room){focusRoom(room);onRoom(room);}}}
      onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} style={{cursor:drag.current?'grabbing':hover?'pointer':'grab'}} />
    <div className="map-labels" aria-label="Castle rooms">{rooms.map(room=>{const point=roomLabelPoint(layout,room.id);const x=camera.x+point.x*camera.scale,y=camera.y+point.y*camera.scale,visible=labelVisible(x,y);return <button key={room.id} className="room-label" tabIndex={visible?0:-1} aria-hidden={!visible} style={{left:x,top:y,visibility:visible?'visible':'hidden'}} onClick={()=>{focusRoom(room.id);onRoom(room.id);}}>{room.name}</button>;})}</div>
    <div className="map-agent-labels" aria-label="Characters on the map">{visibleAgents.map(agent=>{
      const travel=layout.id==='original'&&!reduced&&state.travel.find(t=>t.agent===agent.id), p=placePoint(layout,agent.room,travel?positionOnPath(travel.path,travel.elapsed/travel.duration):agent.position);
      const signal=agentSignal(entries,agent.id), status=confirmed?signal.status:'unconfirmed';
      const x=camera.x+p.x*camera.scale,y=camera.y+(p.y+14)*camera.scale,visible=labelVisible(x,y);
      const label=!confirmed?'Activity unconfirmed':status?`${signal.count} ${signalLabels[status]}`:animateIdle?`Idle · ${idleActivities[agent.id]}`:'Ready';
      return <span key={agent.id}>
        {confirmed&&(status==='review'||status==='blocked')&&<span className={`attention-beacon ${status}`} aria-hidden="true" style={{left:x,top:camera.y+(p.y-(status==='blocked'?70:88))*camera.scale}}><WarningCircle size={status==='blocked'?28:19} weight="fill"/></span>}
        <button tabIndex={visible?0:-1} aria-hidden={!visible} aria-label={`Select ${agent.name}, ${agent.title}, ${label}`} title={label} className={`agent-pin ${selected===agent.id?'selected':''} ${status||'ready'}`} style={{left:x,top:y,visibility:visible?'visible':'hidden','--agent-color':agent.color} as React.CSSProperties} onClick={()=>onSelect(agent.id)}><span className="pin-name">{agent.name}</span><span className="pin-signal" aria-hidden="true">{status?signalIcons[status]:'☾'}{status&&signal.count>0&&<b>{signal.count}</b>}</span></button>
      </span>;
    })}</div>
    {assets.loki&&<button ref={lokiButton} className="loki-pin" aria-label="LOKI, Amron’s companion" aria-expanded={lokiOpen} tabIndex={labelVisible(camera.x+placePoint(layout,'war',LOKI).x*camera.scale,camera.y+(placePoint(layout,'war',LOKI).y+12)*camera.scale)?0:-1} style={{left:camera.x+placePoint(layout,'war',LOKI).x*camera.scale,top:camera.y+(placePoint(layout,'war',LOKI).y+12)*camera.scale,visibility:labelVisible(camera.x+placePoint(layout,'war',LOKI).x*camera.scale,camera.y+(placePoint(layout,'war',LOKI).y+12)*camera.scale)?'visible':'hidden'}} onClick={()=>setLokiOpen(value=>!value)}>LOKI</button>}
    {lokiOpen&&<aside className="companion-card" aria-label="LOKI companion" onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();setLokiOpen(false);lokiButton.current?.focus();}}}>
      <button className="companion-close" aria-label="Close LOKI details" onClick={()=>{setLokiOpen(false);lokiButton.current?.focus();}}><X size={16}/></button>
      <strong>LOKI</strong><p>Amron’s little companion. Lounging, watching, and occasionally catching a fairy snack.</p>
      <button className="fairy-invite" disabled={paused||reduced} onClick={()=>setInvitedAt(frameTime.current)}>Invite a fairy</button><small>{reduced?'Reduced motion is enabled.':paused?'Resume motion to invite a fairy.':'Ambient story · no tasks or model calls'}</small>
    </aside>}
  </div>;
});
