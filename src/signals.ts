import { agentForRun, confirmedRunning, type LiveSnapshot } from './live';
import { type DemoState, type Status } from './model';

export type SignalEntry = { id: string; title: string; agentId: string | null; status: Status; order: number | null; version: string };
export type QueueCursor = Pick<SignalEntry, 'id' | 'order'>;
export const signalLabels: Record<Status, string> = { working: 'Working', review: 'Needs you', complete: 'Complete', blocked: 'Blocked', unconfirmed: 'Unconfirmed' };
export const signalIcons: Record<Status, string> = { working: '✦', review: '!', complete: '✓', blocked: '◇', unconfirmed: '?' };
const priority: Status[] = ['review', 'blocked', 'working', 'unconfirmed', 'complete'];
const orderValue = (value: number | null) => value !== null && Number.isFinite(value) ? value : Infinity;
export function compareEntries(a: QueueCursor, b: QueueCursor): number {
  const first = orderValue(a.order), second = orderValue(b.order);
  return (first === second ? 0 : first < second ? -1 : 1) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
export const orderedQueue = (entries: SignalEntry[], status: Status) => entries.filter(entry => entry.status === status).sort(compareEntries);
export function nextInQueue(queue: SignalEntry[], cursor?: QueueCursor): SignalEntry | undefined {
  if (!cursor) return queue[0];
  const index = queue.findIndex(entry => entry.id === cursor.id);
  return index >= 0 ? queue[(index + 1) % queue.length] : queue.find(entry => compareEntries(entry, cursor) > 0) ?? queue[0];
}
export function demoSignals(state: DemoState): SignalEntry[] {
  return state.tasks.map(task => ({ id: task.id, title: task.title, agentId: task.owner, status: task.status, order: task.updatedAt ?? 0, version: `${task.status}:${task.owner}:${task.stage}` }));
}
export function liveSignals(snapshot: LiveSnapshot | null): SignalEntry[] {
  return (snapshot?.runs ?? []).map(run => {
    const status: Status = run.state === 'done' ? 'complete' : run.state === 'waiting' ? 'review' : ['error', 'stopped'].includes(run.state) ? 'blocked' : confirmedRunning(run) ? 'working' : 'unconfirmed';
    const date = run.updated ? Date.parse(run.updated) : NaN;
    return { id: run.thread, title: run.task || run.thread, agentId: agentForRun(run), status, order: Number.isFinite(date) ? date : null, version: `${status}:${run.stage}:${agentForRun(run)}` };
  });
}
export function agentSignal(entries: SignalEntry[], agentId: string) {
  const assigned = entries.filter(entry => entry.agentId === agentId);
  const status = priority.find(candidate => assigned.some(entry => entry.status === candidate));
  return { status, count: status ? assigned.filter(entry => entry.status === status).length : 0, assigned, idle: !assigned.some(entry => entry.status !== 'complete') };
}
export type SignalNotice = { id: number; entry: SignalEntry; read: boolean };
export type NoticeState = { versions: Record<string, string>; notices: SignalNotice[]; nextId: number; ready: boolean };
export const emptyNotices = (): NoticeState => ({ versions: {}, notices: [], nextId: 1, ready: false });
export function observeSignals(state: NoticeState, entries: SignalEntry[]): NoticeState {
  const versions = Object.fromEntries(entries.map(entry => [entry.id, entry.version]));
  const changes = state.ready ? entries.filter(entry => state.versions[entry.id] !== entry.version) : [];
  const added = changes.sort(compareEntries).map((entry, index) => ({ id: state.nextId + index, entry, read: false }));
  return { versions, ready: true, nextId: state.nextId + added.length, notices: [...added.reverse(), ...state.notices].slice(0, 40) };
}
