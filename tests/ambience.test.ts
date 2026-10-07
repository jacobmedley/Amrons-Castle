import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fairyPhase, fishPosition } from '../src/ambience.ts';

test('fish routes stay in the open pond and remain continuous through a full orbit',()=>{
  for(let fish=0;fish<3;fish++){
    let last=fishPosition(0,fish);
    for(let time=0;time<30_000;time+=100){
      const p=fishPosition(time,fish);
      assert.ok(p.x>=283&&p.x<=341&&p.y>=710&&p.y<=744);
      assert.ok(Math.hypot(p.x-last.x,p.y-last.y)<1);
      assert.ok(Number.isFinite(p.angle));last=p;
    }
  }
});
test('fairy events are occasional, bounded and can be invited without altering the clock',()=>{
  for(const seed of [0,.25,.9]){
    const start=14_000+seed*9000;
    assert.equal(fairyPhase(start-1,seed),-1);
    assert.equal(fairyPhase(start,seed),0);
    assert.equal(fairyPhase(start+7999,seed),7999);
    assert.equal(fairyPhase(start+8000,seed),-1);
  }
  assert.equal(fairyPhase(2000,.5,1000),1000);
  assert.equal(fairyPhase(9000,.5,1000),-1);
  assert.equal(fairyPhase(0,.5),-1);
});
