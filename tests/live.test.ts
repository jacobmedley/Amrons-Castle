import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agentTask } from '../src/model.ts';
import { agentForRun, confirmedRunning, liveSceneState, parseLiveSnapshot, runHref, runLabel, snapshotFresh, type LiveRun, type LiveSnapshot } from '../src/live.ts';

const now = 1_791_331_200_000;
const run = (changes: Partial<LiveRun> = {}): LiveRun => ({ thread: 'launch-page', task: 'Build a launch page', state: 'running', stage: 'frontend', busy: { pid: 42 }, ...changes });
const snapshot = (runs: LiveRun[] = [run()]): LiveSnapshot => ({
  schema_version: 1, observed_at: now / 1000,
  roles: { code: { requested_model: 'configured-model', requested_effort: 'high', accepted_model: null, accepted_effort: null, source: 'current_configuration' } },
  runs, issues: [],
});

test('live observations preserve configured requests without inventing runtime acceptance or mutating source data', () => {
  const source = snapshot();
  const before = structuredClone(source);
  const parsed = parseLiveSnapshot(source);
  assert.equal(parsed.roles.code.requested_model, 'configured-model');
  assert.equal(parsed.roles.code.requested_effort, 'high');
  assert.equal(parsed.roles.code.accepted_model, null);
  assert.equal(parsed.roles.code.accepted_effort, null);
  liveSceneState(parsed, true);
  assert.deepEqual(source, before);
  for (const key of ['accepted_model', 'accepted_effort']) {
    const unverified = structuredClone(source) as unknown as { roles: Record<string, Record<string, unknown>> };
    unverified.roles.code[key] = 'claimed-without-receipt';
    assert.throws(() => parseLiveSnapshot(unverified), /settings/);
  }
});

test('unreadable or duplicate observations cannot silently become an empty healthy castle', () => {
  for (const bad of [null, [], {}, { ...snapshot(), schema_version: 2 }, { ...snapshot(), observed_at: NaN }, { ...snapshot(), runs: {} }, { ...snapshot(), issues: [null] }, snapshot([run(), run()])]) {
    assert.throws(() => parseLiveSnapshot(bad));
  }
  assert.deepEqual(parseLiveSnapshot(snapshot([])).runs, []);
});

test('malformed display fields and owner signals are rejected before entering the view', () => {
  for (const invalid of [
    { status: { message: 'untrusted' } }, { updated: 13 }, { gate: { gate: [] } },
    { busy: {} }, { busy: { pid: '42' } }, { busy: { pid: 0 } }, { busy: { pid: -1 } }, { busy: { pid: 1.5 } },
  ]) assert.throws(() => parseLiveSnapshot(snapshot([{ ...run(), ...invalid } as unknown as LiveRun])), JSON.stringify(invalid));
});

test('the four pipeline roles retain their named characters through a run handoff', () => {
  const expected = [['research', 'orin'], ['design', 'liora'], ['frontend', 'borin'], ['copywriter', 'quill']];
  for (const [stage, owner] of expected) {
    const current = run({ stage });
    assert.equal(agentForRun(current), owner);
    assert.equal(liveSceneState(snapshot([current]), true).tasks[0].owner, owner);
  }
  // Planning and testing characters do not pretend to own unreported pipeline roles.
  assert.equal(agentForRun(run({ stage: 'planning' })), null);
  assert.equal(agentForRun(run({ stage: 'testing' })), null);
});

test('review belongs with Amron and completion removes ownership without fabricating a successor', () => {
  const waiting = run({ state: 'waiting', busy: null });
  assert.equal(agentForRun(waiting), 'amron');
  assert.equal(runLabel(waiting), 'Needs you');
  assert.equal(liveSceneState(snapshot([waiting]), true).tasks[0].status, 'review');
  const done = run({ state: 'done', busy: null });
  assert.equal(agentForRun(done), null);
  assert.equal(runLabel(done), 'Complete');
  assert.deepEqual(liveSceneState(snapshot([done]), true).tasks, []);
});

test('a running label alone never proves motion, and unknown stages never acquire a character', () => {
  const uncertain = [run({ busy: null }), run({ busy: undefined }), run({ state: 'idle' }), run({ stage: 'new-stage' }), run({ stage: 'constructor' }), run({ stage: '__proto__' })];
  for (const current of uncertain) {
    assert.equal(confirmedRunning(current), false);
    assert.equal(runLabel(current), 'Unconfirmed');
    assert.ok(liveSceneState(snapshot([current]), true).tasks.every(task => task.status !== 'working'));
  }
  assert.equal(agentForRun(run({ stage: 'constructor' })), null);
  assert.equal(confirmedRunning(run()), true);
  assert.equal(runLabel(run()), 'Working');
});

test('freshness requires both a recent successful receipt and a plausible server observation', () => {
  assert.equal(snapshotFresh(snapshot(), now, now), true);
  assert.equal(snapshotFresh(snapshot(), now, now + 15_000), true);
  assert.equal(snapshotFresh(snapshot(), now, now + 15_001), false);
  assert.equal(snapshotFresh({ ...snapshot(), observed_at: (now - 15_001) / 1000 }, now, now), false);
  assert.equal(snapshotFresh({ ...snapshot(), observed_at: (now + 5_001) / 1000 }, now, now), false);
  assert.equal(snapshotFresh(snapshot(), now + 1, now), false, 'clock rollback cannot turn a future receipt into fresh evidence');
  assert.equal(snapshotFresh(snapshot(), Infinity, now), false);
  assert.equal(snapshotFresh(snapshot(), 0, now), false);
  assert.equal(snapshotFresh(null, now, now), false);
});

test('disabled motion retains observed ownership without inventing activity, travel or progress', () => {
  const observed = snapshot([run(), run({ thread: 'review', state: 'waiting', busy: null }), run({ thread: 'failure', state: 'error', busy: null })]);
  const state = liveSceneState(observed, false);
  assert.deepEqual(state.tasks.map(task => [task.owner, task.status]), [['borin', 'unconfirmed'], ['amron', 'review'], ['borin', 'blocked']]);
  assert.ok(state.tasks.every(task => task.progress === 0 && task.output === ''));
  assert.deepEqual(state.events, []);
  assert.deepEqual(state.travel, []);
  assert.equal(state.time, 0);
  assert.deepEqual(liveSceneState(null, false).tasks, []);
});

test('a partial observation cannot animate even when a caller enables motion', () => {
  const partial = snapshot();
  partial.issues = [{ thread: 'unreadable-run', error_type: 'RunReadError' }];
  const state = liveSceneState(partial, true);
  assert.equal(state.tasks[0].owner, 'borin');
  assert.equal(state.tasks[0].status, 'unconfirmed');
  assert.deepEqual(state.travel, []);
});

test('a stopped run does not mask another confirmed job at the same workstation', () => {
  const source = snapshot([run({ thread: 'stopped', state: 'stopped', busy: null }), run({ thread: 'active' })]);
  const state = liveSceneState(source, true);
  assert.equal(agentTask(state, 'borin')?.id, 'active');
  assert.equal(state.tasks.find(task => task.id === 'stopped')?.status, 'blocked');
  assert.equal(source.runs[0].thread, 'stopped', 'source order stays unchanged');
});

test('run links keep reserved characters inside a single encoded identity', () => {
  for (const id of ['normal-run', 'nested/id?mode=demo#fragment', 'Amron’s quest ☽', '../escape', 'a%2Fb']) {
    const href = runHref(id);
    assert.ok(href.startsWith('/#/run/'));
    const segment = href.slice('/#/run/'.length);
    assert.equal(decodeURIComponent(segment), id);
    assert.equal(segment.includes('/'), false);
    assert.equal(segment.includes('?'), false);
    assert.equal(segment.includes('#'), false);
  }
});
