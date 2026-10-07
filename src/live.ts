import type { DemoState, Status } from './model';

export type RoleSettings = { requested_model: string | null; requested_effort: string | null; accepted_model: null; accepted_effort: null; provider?: string | null; profile?: string | null; source: 'current_configuration' };
export type LiveRun = { thread: string; task: string; state: string; stage: string; status?: string; updated?: string; gate?: { gate?: string } | null; busy?: { pid?: number } | null };
export type LiveSnapshot = { schema_version: 1; observed_at: number; roles: Record<string, RoleSettings>; runs: LiveRun[]; issues: { thread?: string | null; error_type?: string }[] };
export const agentRoles: Readonly<Record<string, string>> = { orin: 'research', liora: 'design', borin: 'code', quill: 'copy' };
const stageAgents: Readonly<Record<string, string>> = { research: 'orin', design: 'liora', frontend: 'borin', copywriter: 'quill' };

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export function parseLiveSnapshot(value: unknown): LiveSnapshot {
  if (!object(value) || value.schema_version !== 1 || !Number.isFinite(value.observed_at) || typeof value.observed_at !== 'number' || value.observed_at <= 0 || !object(value.roles) || !Array.isArray(value.runs) || !Array.isArray(value.issues)) throw new Error('The dashboard returned an unreadable observation.');
  const ids = new Set<string>();
  for (const run of value.runs) {
    if (!object(run) || typeof run.thread !== 'string' || !run.thread || ids.has(run.thread) || typeof run.task !== 'string' || typeof run.state !== 'string' || typeof run.stage !== 'string' || (run.busy != null && (!object(run.busy) || typeof run.busy.pid !== 'number' || !Number.isInteger(run.busy.pid) || run.busy.pid <= 0))) throw new Error('A dashboard run record could not be verified.');
    ids.add(run.thread);
    if ((run.status != null && typeof run.status !== 'string') || (run.updated != null && typeof run.updated !== 'string') || (run.gate != null && (!object(run.gate) || (run.gate.gate != null && typeof run.gate.gate !== 'string')))) throw new Error('A dashboard run description could not be verified.');
  }
  for (const role of Object.values(value.roles)) {
    if (!object(role) || role.source !== 'current_configuration' || !(role.requested_model === null || typeof role.requested_model === 'string') || !(role.requested_effort === null || typeof role.requested_effort === 'string') || role.accepted_model !== null || role.accepted_effort !== null) throw new Error('Model settings could not be verified.');
  }
  if (!value.issues.every(object)) throw new Error('Observation coverage could not be verified.');
  return value as LiveSnapshot;
}

export function agentForRun(run: LiveRun): string | null {
  if (run.state === 'done') return null;
  if (run.state === 'waiting') return 'amron';
  return Object.hasOwn(stageAgents, run.stage) ? stageAgents[run.stage] : null;
}

export function confirmedRunning(run: LiveRun): boolean {
  return run.state === 'running' && !!run.busy && Number.isInteger(run.busy.pid) && (run.busy.pid ?? 0) > 0 && Object.hasOwn(stageAgents, run.stage);
}

export function runLabel(run: LiveRun): string {
  if (run.state === 'done') return 'Complete';
  if (run.state === 'waiting') return 'Needs you';
  if (run.state === 'error') return 'Error';
  if (run.state === 'stopped') return 'Stopped';
  return confirmedRunning(run) ? 'Working' : 'Unconfirmed';
}

export function snapshotFresh(snapshot: LiveSnapshot | null, receivedAt: number, now: number): boolean {
  return !!snapshot && Number.isFinite(now) && Number.isFinite(receivedAt) && receivedAt > 0 && receivedAt <= now && now - receivedAt <= 15_000 && now - snapshot.observed_at * 1000 <= 15_000 && snapshot.observed_at * 1000 <= now + 5_000;
}

export function liveSceneState(snapshot: LiveSnapshot | null, canAnimate: boolean): DemoState {
  canAnimate = canAnimate && snapshot?.issues.length === 0;
  return { tasks: (snapshot?.runs ?? []).flatMap(run => {
    const owner = agentForRun(run);
    if (!owner) return [];
    const status: Status = run.state === 'waiting' ? 'review' : ['error', 'stopped'].includes(run.state) ? 'blocked' : canAnimate && confirmedRunning(run) ? 'working' : 'unconfirmed';
    return [{ id: run.thread, title: run.task || run.thread, description: run.status || '', owner, status, stage: 0, progress: 0, output: '', feedback: '' }];
  }).sort((a, b) => Number(b.status === 'working') - Number(a.status === 'working')), events: [], time: 0, travel: [], revision: 0 };
}

export function runHref(thread: string): string { return `/#/run/${encodeURIComponent(thread)}`; }
