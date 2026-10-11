import test from 'node:test';
import assert from 'node:assert/strict';
import { characterDefaults, characterIds, cleanDisplayName, displayStoryText, readCharacterNames } from '../src/characterNames';
import { agents } from '../src/model';

test('the coordinator may display as Dot without changing any agent identity or assignment', () => {
  const names = readCharacterNames(JSON.stringify({ version: 1, names: { amron: 'Dot', loki: 'Scout' } }));
  assert.equal(names.amron, 'Dot');
  assert.equal(names.loki, 'Scout');
  assert.equal(agents[0].id, 'amron');
  assert.equal(agents[0].name, 'Amron');
  assert.equal(agents[0].room, 'war');
  assert.deepEqual(Object.keys(names), characterIds);
  assert.equal(displayStoryText('Amron’s recommendation follows Orin’s brief.', names), 'Dot’s recommendation follows Orin’s brief.');
});

test('saved names are versioned, bounded and fall back safely when malformed', () => {
  assert.equal(cleanDisplayName('  Dot   Prime '), 'Dot Prime');
  assert.equal(cleanDisplayName(' '), null);
  assert.equal(cleanDisplayName('x'.repeat(29)), null);
  assert.equal(cleanDisplayName('Dot\nPrime'), null);
  assert.deepEqual(readCharacterNames('{'), characterDefaults);
  assert.deepEqual(readCharacterNames(JSON.stringify({ version: 2, names: { amron: 'Other' } })), characterDefaults);
  const names = readCharacterNames(JSON.stringify({ version: 1, names: { amron: '', orin: 'x'.repeat(29), loki: 'Pet', unknown: 'Ignored' } }));
  assert.equal(names.amron, 'Amron');
  assert.equal(names.orin, 'Orin');
  assert.equal(names.loki, 'Pet');
  assert.equal(names.unknown, undefined);
});
