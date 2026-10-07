import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agents, createDemo, demoReducer, type DemoState, type Status } from '../src/model.ts';
import { executionForAgent, sampleModelLabel, sampleEffortLabel } from '../src/execution.ts';

function assignmentFor(id: string) {
  const assignment = executionForAgent(id);
  assert.ok(assignment, `Missing assignment for ${id}`);
  return assignment;
}

function assertNoRuntime(id: string) {
  assert.deepEqual(assignmentFor(id).runtime, { state: 'not-running', model: null, effort: null });
}

function advance(state: DemoState, seconds: number) {
  for (let second = 0; second < seconds; second++) state = demoReducer(state, { type: 'tick', seconds: 1 });
  return state;
}

const moonwell = (state: DemoState) => state.tasks.find(task => task.id === 'moonwell')!;
const assignments = () => Object.fromEntries(agents.map(agent => [agent.id, assignmentFor(agent.id)]));

test('every persistent character has the intended illustrative model and effort, with Amron honestly unreported', () => {
  const expected = {
    amron: ['Preserve active lead', null],
    orin: ['GPT-5.6 Sol', 'high'],
    mira: ['GPT-5.6 Sol', 'high'],
    liora: ['GPT-5.6 Sol', 'high'],
    quill: ['GPT-5.6 Sol', 'medium'],
    borin: ['GPT-5.6 Sol', 'high'],
    flint: ['Claude Sonnet 5', 'medium'],
  } as const;
  assert.deepEqual(agents.map(agent => agent.id).sort(), Object.keys(expected).sort());
  for (const [id, [modelLabel, effort]] of Object.entries(expected)) {
    const assignment = assignmentFor(id);
    assert.equal(sampleModelLabel(assignment), modelLabel, `${id} model label`);
    assert.equal(assignment.sample.effort, effort, `${id} sample effort`);
    assertNoRuntime(id);
    if (id === 'amron') {
      assert.equal(assignment.sample.model, null);
      assert.equal(assignment.sample.profile, 'director');
      assert.equal(sampleEffortLabel(assignment), 'Unreported');
    } else {
      assert.ok(assignment.sample.model);
      assert.ok(assignment.sample.profile);
      assert.equal(sampleEffortLabel(assignment).toLowerCase(), effort);
    }
  }
});

test('unknown identities never receive an invented model assignment', () => {
  for (const id of ['', 'unknown-wizard', 'constructor', '__proto__', 'toString']) {
    assert.equal(executionForAgent(id), undefined, id);
  }
});

test('working, approval, blocked and completed sample tasks all remain explicitly not running models', () => {
  const state = createDemo();
  const statuses = new Set<Status>();
  for (const task of state.tasks) {
    statuses.add(task.status);
    assertNoRuntime(task.owner);
  }
  assert.deepEqual([...statuses].sort(), ['blocked', 'complete', 'review', 'working']);
});

test('the real six-approval journey changes the displayed assignment with ownership and never mutates identities', () => {
  let state = createDemo();
  const originalAgents = structuredClone(agents);
  const originalAssignments = structuredClone(assignments());
  const owners = ['orin', 'liora', 'borin', 'quill', 'flint', 'amron'];

  for (let stage = 0; stage < owners.length; stage++) {
    const owner = owners[stage];
    assert.equal(moonwell(state).owner, owner);
    assert.equal(moonwell(state).stage, stage);
    assert.equal(moonwell(state).status, 'review');
    assert.deepEqual(assignmentFor(moonwell(state).owner), originalAssignments[owner]);
    assertNoRuntime(owner);

    // Passage of time cannot accept a review or change whose settings are shown.
    const waiting = advance(state, 60);
    assert.equal(moonwell(waiting).owner, owner);
    assert.equal(moonwell(waiting).status, 'review');
    assert.deepEqual(assignmentFor(moonwell(waiting).owner), originalAssignments[owner]);

    state = demoReducer(waiting, { type: 'approve', id: 'moonwell' });
    if (stage < owners.length - 1) {
      assert.equal(moonwell(state).owner, owners[stage + 1]);
      assert.equal(moonwell(state).status, 'working');
      assert.deepEqual(assignmentFor(moonwell(state).owner), originalAssignments[owners[stage + 1]]);
      assertNoRuntime(moonwell(state).owner);
      state = advance(state, 30);
    }
  }

  assert.equal(moonwell(state).status, 'complete');
  assert.equal(moonwell(state).owner, 'amron');
  assert.equal(sampleModelLabel(assignmentFor('amron')), 'Preserve active lead');
  assert.equal(sampleEffortLabel(assignmentFor('amron')), 'Unreported');
  assert.deepEqual(agents, originalAgents);
  assert.deepEqual(assignments(), originalAssignments);
});

test('requesting changes, resolving a blocker and resetting preserve honest assignments through actual transitions', () => {
  let state = createDemo();
  state = demoReducer(state, { type: 'approve', id: 'moonwell' });
  state = advance(state, 30);
  const owner = moonwell(state).owner;
  const before = structuredClone(assignmentFor(owner));
  state = demoReducer(state, { type: 'revise', id: 'moonwell', feedback: 'Make the phone invitation clearer.' });
  assert.equal(moonwell(state).owner, owner);
  assert.equal(moonwell(state).status, 'working');
  assert.deepEqual(assignmentFor(moonwell(state).owner), before);
  assertNoRuntime(owner);
  state = advance(state, 30);
  assert.equal(moonwell(state).status, 'review');
  assert.equal(moonwell(state).feedback, 'Make the phone invitation clearer.');
  assert.deepEqual(assignmentFor(moonwell(state).owner), before);

  state = demoReducer(state, { type: 'unblock', id: 'archive' });
  assert.equal(state.tasks.find(task => task.id === 'archive')?.status, 'working');
  assertNoRuntime('borin');
  state = demoReducer(state, { type: 'reset' });
  assert.deepEqual(state, createDemo());
  assert.equal(moonwell(state).owner, 'orin');
  assert.equal(sampleModelLabel(assignmentFor(moonwell(state).owner)), 'GPT-5.6 Sol');
  for (const agent of agents) assertNoRuntime(agent.id);
});
