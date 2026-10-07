import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, demoReducer, agents, travelPath, positionOnPath, toWorld, hitAgent, type DemoState } from '../src/model.ts';

const advance=(state:DemoState,seconds:number)=>{for(let i=0;i<seconds;i++)state=demoReducer(state,{type:'tick',seconds:1});return state;};
test('review gates never advance without a decision',()=>{
  const state=advance(createDemo(),300);
  const task=state.tasks.find(t=>t.id==='moonwell')!;
  assert.equal(task.status,'review');assert.equal(task.stage,0);assert.equal(task.owner,'orin');
  assert.equal(state.tasks.find(t=>t.id==='archive')?.status,'blocked');
});
test('a full quest retains identity and requires all six approvals',()=>{
  let state=createDemo();
  const owners=['liora','borin','quill','flint','amron'];
  for(let stage=0;stage<5;stage++){
    state=demoReducer(state,{type:'approve',id:'moonwell'});
    let task=state.tasks.find(t=>t.id==='moonwell')!;
    assert.equal(task.stage,stage+1);assert.equal(task.owner,owners[stage]);assert.equal(task.status,'working');
    const stale=demoReducer(state,{type:'approve',id:'moonwell'});assert.equal(stale,state);
    state=advance(state,40);task=state.tasks.find(t=>t.id==='moonwell')!;
    assert.equal(task.status,'review');assert.equal(task.stage,stage+1);
  }
  state=demoReducer(state,{type:'approve',id:'moonwell'});
  assert.equal(state.tasks.find(t=>t.id==='moonwell')?.status,'complete');
  assert.equal(state.tasks.find(t=>t.id==='archive')?.status,'blocked');
  assert.equal(agents.length,7);assert.equal(new Set(agents.map(a=>a.id)).size,7);
});
test('a change request preserves owner, stage and user direction through the next review',()=>{
  let state=createDemo();
  assert.equal(demoReducer(state,{type:'revise',id:'moonwell',feedback:'   '}),state);
  state=demoReducer(state,{type:'revise',id:'moonwell',feedback:'Prioritize phone visitors.'});
  let task=state.tasks[0];assert.equal(task.owner,'orin');assert.equal(task.stage,0);assert.equal(task.status,'working');
  state=advance(state,30);task=state.tasks[0];assert.equal(task.status,'review');assert.equal(task.feedback,'Prioritize phone visitors.');
});
test('resolving a blocker is scoped to that quest, reset restores all samples',()=>{
  let state=createDemo();state=demoReducer(state,{type:'unblock',id:'archive'});
  assert.equal(state.tasks.find(t=>t.id==='archive')?.status,'working');assert.equal(state.tasks[0].status,'review');
  state=advance(state,110);assert.equal(state.tasks.find(t=>t.id==='archive')?.status,'complete');
  assert.deepEqual(demoReducer(state,{type:'reset'}),createDemo());
});
test('camera coordinates select the same sprite under zoom and pan',()=>{
  const position={id:'orin',point:{x:302,y:403}};
  for(const camera of [{x:0,y:0,scale:.3},{x:-210,y:71,scale:1.35},{x:440,y:-230,scale:2.5}]){
    const screen={x:position.point.x*camera.scale+camera.x,y:(position.point.y-25)*camera.scale+camera.y};
    assert.equal(hitAgent(toWorld(screen,camera),[position]),'orin');
    assert.equal(hitAgent(toWorld({x:screen.x+200,y:screen.y},camera),[position]),undefined);
  }
});
test('walk paths are continuous, return to the same station and avoid surveyed furnishings',()=>{
  const furnishings=[{x:250,y:288,w:112,h:77},{x:397,y:301,w:93,h:87},{x:695,y:155,w:220,h:115},{x:1142,y:243,w:117,h:80},{x:1294,y:263,w:85,h:60},{x:1135,y:612,w:60,h:50},{x:1235,y:605,w:90,h:68}];
  // Surveyed clear floor strips and doorways in the original 1536×1024 background.
  const walkable=[[165,378,352,65],[510,373,100,35],[580,373,460,65],[758,292,88,110],[1100,340,320,102],[1000,374,121,35],[1100,678,210,35],[1200,577,25,128],[1080,577,145,29]];
  for(const agent of agents.filter(a=>a.id!=='amron')){
    const path=travelPath(agent);assert.deepEqual(positionOnPath(path,0),agent.position);assert.deepEqual(positionOnPath(path,1),agent.position);
    let previous=agent.position;
    for(let i=0;i<=1000;i++){
      const point=positionOnPath(path,i/1000);
      assert.ok(Math.hypot(point.x-previous.x,point.y-previous.y)<3);
      assert.ok(walkable.some(([x,y,w,h])=>point.x>=x&&point.x<=x+w&&point.y>=y&&point.y<=y+h),`${agent.id} left the surveyed floor at ${JSON.stringify(point)}`);
      for(const box of furnishings)assert.ok(!(point.x>box.x&&point.x<box.x+box.w&&point.y>box.y&&point.y<box.y+box.h),`${agent.id} crosses a furnishing at ${JSON.stringify(point)}`);
      previous=point;
    }
  }
});
