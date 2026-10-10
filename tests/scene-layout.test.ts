import assert from 'node:assert/strict';
import test from 'node:test';
import { rooms } from '../src/model';
import { createSceneLayout, placePoint, roomAt, roomLabelPoint } from '../src/sceneLayout';

test('room arrangement follows the available scene shape', () => {
  assert.equal(createSceneLayout(1200, 800).mode, 'original');
  assert.equal(createSceneLayout(390, 480).mode, 'portrait');
  assert.equal(createSceneLayout(650, 320).mode, 'portrait');
  assert.equal(createSceneLayout(900, 390).mode, 'panorama');
});

test('each retiled room keeps its points and hit area together', () => {
  for (const layout of [createSceneLayout(390, 480), createSceneLayout(900, 390)]) {
    for (const room of rooms) {
      assert.equal(roomAt(layout, placePoint(layout, room.id, room.center)), room.id);
      const tile = layout.tiles.find(item => item.id === room.id)!;
      assert.ok(tile.x >= 0 && tile.y >= 0);
      assert.ok(tile.x + tile.width <= layout.width);
      assert.ok(tile.y + tile.height <= layout.height);
      const label = roomLabelPoint(layout, room.id);
      assert.ok(label.x >= tile.x && label.x <= tile.x + tile.width);
      assert.ok(label.y >= tile.y && label.y <= tile.y + tile.height);
    }
    for (let i = 0; i < layout.tiles.length; i++) for (let j = i + 1; j < layout.tiles.length; j++) {
      const a = layout.tiles[i], b = layout.tiles[j];
      assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    }
  }
});
