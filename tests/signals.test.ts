import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agentSignal, demoSignals, emptyNotices, liveSignals, nextInQueue, observeSignals, orderedQueue, type SignalEntry } from '../src/signals';
import { createDemo, demoReducer } from '../src/model';
import type { LiveSnapshot } from '../src/live';

const entry = (id: string, order: number | null = 0, status: SignalEntry['status'] = 'review', agentId: string | null = 'amron'): SignalEntry => ({ id, title: id, agentId, order, status, version: `${status}:${agentId}:0` });
test('queues sort dates, resolve ties, put unknown times last and cycle individual tasks', () => {
  const rows = [entry('z', null), entry('b', 2), entry('a', 2), entry('old', 1), entry('done', 0, 'complete')];
  const queue = orderedQueue(rows, 'review');
  assert.deepEqual(queue.map(item => item.id), ['old', 'a', 'b', 'z']);
  assert.equal(nextInQueue(queue)?.id, 'old');
  assert.equal(nextInQueue(queue, queue[1])?.id, 'b');
  assert.equal(nextInQueue(queue, queue[3])?.id, 'old');
  assert.equal(nextInQueue([], queue[0]), undefined);
});
test('removed or transitioned cursor advances without relying on response order', () => {
  const cursor = entry('b', 2), remaining = orderedQueue([entry('c', 3), entry('a', 1)], 'review');
  assert.equal(nextInQueue(remaining, cursor)?.id, 'c');
  assert.equal(nextInQueue([remaining[0]], entry('z', null))?.id, 'a');
});
test('agent signals retain multiple tasks and prioritize attention over work', () => {
  const signal = agentSignal([entry('a'), entry('b'), entry('c', 0, 'working'), entry('d', 0, 'complete')], 'amron');
  assert.equal(signal.status, 'review'); assert.equal(signal.count, 2); assert.equal(signal.assigned.length, 4); assert.equal(signal.idle, false);
  assert.equal(agentSignal([entry('d', 0, 'complete')], 'amron').idle, true);
});
test('live queue requires a verified working process and never invents completed ownership', () => {
  const snapshot: LiveSnapshot = { schema_version: 1, observed_at: 1000, roles: {}, issues: [], runs: [
    { thread: 'one', task: 'First', state: 'waiting', stage: 'research', updated: '2026-01-01T10:00:00Z' },
    { thread: 'two', task: 'Second', state: 'waiting', stage: 'design', updated: 'invalid' },
    { thread: 'done', task: 'Finished', state: 'done', stage: 'copywriter' },
    { thread: 'unknown', task: 'Unknown', state: 'running', stage: 'unknown', busy: { pid: 3 } },
    { thread: 'missing', task: 'No PID', state: 'running', stage: 'research' },
    { thread: 'valid', task: 'Working', state: 'running', stage: 'research', busy: { pid: 2 } },
  ] };
  const result = liveSignals(snapshot);
  assert.equal(orderedQueue(result, 'review')[0].id, 'one');
  assert.deepEqual(orderedQueue(result, 'review').map(item => item.agentId), ['amron', 'amron']);
  assert.equal(result.find(item => item.id === 'done')?.agentId, null);
  assert.equal(result.find(item => item.id === 'unknown')?.agentId, null);
  assert.equal(orderedQueue(result, 'working').length, 1);
  assert.equal(orderedQueue(result, 'unconfirmed').length, 2);
});
test('notification baseline, deduplication, meaningful transitions, read state and bounded history', () => {
  let ledger = observeSignals(emptyNotices(), [entry('a')]);
  assert.equal(ledger.notices.length, 0);
  ledger = observeSignals(ledger, [entry('a', 22)]);
  assert.equal(ledger.notices.length, 0, 'timestamp-only poll must not notify');
  ledger = observeSignals(ledger, [entry('a', 23, 'working', 'liora')]);
  assert.equal(ledger.notices.length, 1);
  ledger.notices[0].read = true;
  ledger = observeSignals(ledger, [entry('a', 24, 'working', 'liora')]);
  assert.equal(ledger.notices[0].read, true);
  for (let index = 0; index < 60; index++) ledger = observeSignals(ledger, [entry('a', index, index % 2 ? 'review' : 'working')]);
  assert.equal(ledger.notices.length, 40);
  assert.equal(new Set(ledger.notices.map(item => item.id)).size, 40);
});
test('reset establishes a new baseline and the next handoff still creates a notification', () => {
  const state = createDemo();
  let ledger = observeSignals(emptyNotices(), demoSignals(state));
  const next = demoReducer(state, { type: 'approve', id: 'moonwell' });
  ledger = observeSignals(ledger, demoSignals(next));
  assert.equal(ledger.notices.length, 1); assert.equal(ledger.notices[0].entry.agentId, 'liora');
  ledger = observeSignals(emptyNotices(), demoSignals(createDemo()));
  assert.equal(ledger.notices.length, 0);
  ledger = observeSignals(ledger, demoSignals(next));
  assert.equal(ledger.notices.length, 1);
});
test('Demo state times update on review, revision, unblock and approval without changing identities', () => {
  let state = { ...createDemo(), time: 10 };
  state = demoReducer(state, { type: 'revise', id: 'moonwell', feedback: 'Focus on mobile' });
  assert.equal(state.tasks[0].updatedAt, 10); assert.equal(state.tasks[0].owner, 'orin');
  for (let i = 0; i < 14; i++) state = demoReducer(state, { type: 'tick', seconds: 2 });
  assert.equal(state.tasks[0].status, 'review'); assert.equal(state.tasks[0].updatedAt, 36);
  state = demoReducer(state, { type: 'approve', id: 'moonwell' });
  assert.equal(state.tasks[0].owner, 'liora'); assert.equal(state.tasks[0].updatedAt, 38);
});
