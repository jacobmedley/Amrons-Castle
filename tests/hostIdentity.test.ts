import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identityFresh, parseHostIdentity } from '../src/hostIdentity.ts';

const now = 1_792_000_000_000;
const identity = () => ({
  schema_version: 1,
  source: 'chatgpt_work',
  observed_at: now / 1000,
  pet: { availability: 'available', selected: { id: 'pet-id', name: 'Sample pet', artwork_revision: 'revision-1' } },
  dot: { availability: 'available', selected: { id: 'dot-id', name: 'Sample dot', tasks: [{ id: 'task-id', title: 'Sample task', state: 'waiting' }] } },
});

test('current host identity distinguishes selected, unselected and unavailable', () => {
  const selected = parseHostIdentity(identity());
  assert.equal(selected.pet.availability, 'available');
  assert.equal(selected.dot.availability, 'available');
  assert.equal(identityFresh(selected, now, now), true);
  const unselected = parseHostIdentity({ ...identity(), pet: { availability: 'available', selected: null }, dot: { availability: 'available', selected: null } });
  assert.equal(unselected.pet.availability, 'available');
  const unavailable = parseHostIdentity({ ...identity(), pet: { availability: 'unavailable' }, dot: { availability: 'unavailable' } });
  assert.equal(unavailable.dot.availability, 'unavailable');
});

test('stale, future and failed receipts cannot establish a current identity', () => {
  const source = parseHostIdentity(identity());
  assert.equal(identityFresh(source, now, now + 30_001), false);
  assert.equal(identityFresh(source, 0, now), false);
  assert.equal(identityFresh(source, now + 1, now), false);
  assert.equal(identityFresh({ ...source, observed_at: (now - 30_001) / 1000 }, now, now), false);
  assert.equal(identityFresh({ ...source, observed_at: (now + 5_001) / 1000 }, now, now), false);
});

test('identity parser rejects missing coverage, invalid names and unverifiable tasks', () => {
  for (const value of [
    null, {}, { ...identity(), source: 'local_name' }, { ...identity(), pet: { availability: 'available' } },
    { ...identity(), pet: { availability: 'unavailable', selected: null } },
    { ...identity(), pet: { availability: 'available', selected: { id: 'pet-id', name: '', artwork_revision: 'a' } } },
    { ...identity(), dot: { availability: 'available', selected: { id: 'dot-id', name: 'Dot', tasks: [{ id: 'same', title: 'One', state: 'working' }, { id: 'same', title: 'Two', state: 'complete' }] } } },
    { ...identity(), dot: { availability: 'available', selected: { id: 'dot-id', name: 'Dot', tasks: [{ id: 'task', title: 'Task', state: 'running' }] } } },
  ]) assert.throws(() => parseHostIdentity(value));
});
