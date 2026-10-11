import { useEffect, useRef, useState } from 'react';
import { agents, type Status } from './model';
import type { CharacterNames } from './characterNames';
import { emptyNotices, nextInQueue, observeSignals, orderedQueue, signalIcons, signalLabels, type QueueCursor, type SignalEntry } from './signals';

export function useSignals(entries: SignalEntry[], confirmed = true) {
  const [cursors, setCursors] = useState<Partial<Record<Status, QueueCursor>>>({});
  const [ledger, setLedger] = useState(emptyNotices);
  // Progress and timestamps do not produce notifications; only meaningful state/owner/stage changes.
  const signature = JSON.stringify(entries.map(entry => [entry.id, entry.version]).sort());
  const latest = useRef(entries); latest.current = entries;
  useEffect(() => { if (confirmed) setLedger(previous => observeSignals(previous, latest.current)); }, [signature, confirmed]);
  const next = (status: Status) => {
    const entry = nextInQueue(orderedQueue(entries, status), cursors[status]);
    if (entry) setCursors(previous => ({ ...previous, [status]: { id: entry.id, order: entry.order } }));
    return entry;
  };
  const markRead = (id?: number) => setLedger(previous => ({ ...previous, notices: previous.notices.map(item => id === undefined || item.id === id ? { ...item, read: true } : item) }));
  const reset = (initial: SignalEntry[]) => { setCursors({}); setLedger(observeSignals(emptyNotices(), initial)); };
  return { cursors, next, ledger, markRead, reset };
}
export type SignalControls = ReturnType<typeof useSignals>;

export function QueueBadges({ entries, controls, onNavigate, confirmed = true, live = false }: { entries: SignalEntry[]; controls: SignalControls; onNavigate: (entry: SignalEntry) => void; confirmed?: boolean; live?: boolean }) {
  const statuses: Status[] = ['working', 'review', 'complete', ...(['blocked', 'unconfirmed'] as Status[]).filter(status => entries.some(entry => entry.status === status))];
  return <div className="queue-controls" aria-label="Work queues">
    <div className="queue-badges">{statuses.map(status => {
      const queue = orderedQueue(entries, status), cursor = controls.cursors[status];
      const index = cursor ? queue.findIndex(entry => entry.id === cursor.id) : -1;
      return <button className={`queue-badge ${status} ${!confirmed ? 'last-known' : ''}`} key={status} disabled={!queue.length} onClick={() => { const entry = controls.next(status); if (entry) onNavigate(entry); }} title={`${live ? 'Recorded update order' : 'Oldest state change first'}. Click again for the next task.`} aria-label={`${queue.length} ${signalLabels[status]}${!confirmed ? ', last recorded' : ''}. ${queue.length ? 'Inspect next task' : 'No tasks'}`}>
        <span className="badge-symbol" aria-hidden="true">{signalIcons[status]}</span><strong>{queue.length}</strong><span>{signalLabels[status]}</span>{index >= 0 && <small>{index + 1}/{queue.length}</small>}
      </button>;
    })}</div>
    {!confirmed && <small className="queue-coverage">Last recorded · current activity unconfirmed</small>}
  </div>;
}

export function SignalInbox({ entries, controls, onNavigate, demo = false, names }: { entries: SignalEntry[]; controls: SignalControls; onNavigate: (entry: SignalEntry) => void; demo?: boolean; names?: CharacterNames }) {
  const ref = useRef<HTMLDetailsElement>(null), trigger = useRef<HTMLElement>(null);
  const unread = controls.ledger.notices.filter(item => !item.read).length;
  const newest = controls.ledger.notices.find(item => !item.read);
  return <>
    <details ref={ref} className="signal-inbox" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); if (ref.current) ref.current.open = false; trigger.current?.focus(); } }}>
      <summary ref={trigger} aria-label={`Notifications, ${unread} unread`}><span aria-hidden="true">✧</span><span>Signals</span><b>{unread}</b></summary>
      <div className="inbox-popover"><div className="inbox-heading"><h2>{demo ? 'Demo signals' : 'Realm signals'}</h2><button onClick={() => controls.markRead()} disabled={!unread}>Mark all read</button></div>
        <p>Changes since opening the castle. {demo ? 'All activity is simulated.' : 'Read status is local to this view.'}</p>
        <ol>{controls.ledger.notices.map(item => { const current = entries.find(entry => entry.id === item.entry.id); return <li key={item.id} className={item.read ? 'read' : 'unread'}>
          <button disabled={!current} onClick={() => { controls.markRead(item.id); if (ref.current) ref.current.open = false; if (current) onNavigate(current); }}><span className={`notice-icon ${item.entry.status}`} aria-hidden="true">{signalIcons[item.entry.status]}</span><span><small>{(item.entry.agentId && names?.[item.entry.agentId]) || agents.find(agent => agent.id === item.entry.agentId)?.name || (item.entry.status === 'complete' ? 'Great Hall' : 'Unassigned')} · {signalLabels[item.entry.status]}</small><strong>{item.entry.title}</strong>{!current && <small>No longer in this observation</small>}</span></button>
        </li>; })}</ol>
        {!controls.ledger.notices.length && <div className="inbox-empty">The signal lantern is quiet.<small>New handoffs and status changes will appear here.</small></div>}
      </div>
    </details>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{newest ? `${demo ? 'Demo: ' : ''}${newest.entry.title}: ${signalLabels[newest.entry.status]}. ${unread} unread signals.` : ''}</span>
  </>;
}
