import assert from 'node:assert/strict';
import test from 'node:test';
import { agents, rooms } from '../src/model';
import { createSceneLayout, layouts, placePoint, roomAt, roomLabelPoint } from '../src/sceneLayout';

test('the castle chooses the nearest complete composition for its available aspect', () => {
  for (const layout of layouts) assert.equal(createSceneLayout(layout.width, layout.height).id, layout.id);
  assert.equal(createSceneLayout(390, 844).id, '9x16');
  assert.equal(createSceneLayout(390, 480).id, '3x4');
  assert.equal(createSceneLayout(844, 390).id, '21x9');
  assert.equal(createSceneLayout(1200, 800).id, 'original');
});

test('every composition keeps room labels, characters and hit areas inside its castle image', () => {
  for (const layout of layouts) {
    for (const room of rooms) {
      const [x, y, width, height] = layout.bounds[room.id];
      assert.ok(x >= 0 && y >= 0 && x + width <= layout.width && y + height <= layout.height, `${layout.id}: ${room.id} outside image`);
      assert.equal(roomAt(layout, placePoint(layout, room.id, room.center)), room.id);
      const label = roomLabelPoint(layout, room.id);
      if (layout.id !== 'original') assert.ok(label.x >= x && label.x <= x + width && label.y >= y && label.y <= y + height);
      for (const agent of agents.filter(item => item.room === room.id)) {
        const p = placePoint(layout, room.id, agent.position);
        assert.equal(roomAt(layout, p), room.id, `${layout.id}: ${agent.id} outside ${room.id}`);
      }
    }
  }
});
