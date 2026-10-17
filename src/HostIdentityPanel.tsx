import type { HostIdentity } from './hostIdentity';

export function HostIdentityPanel({ identity, current, artworkReady, artworkError, status }: { identity: HostIdentity | null; current: boolean; artworkReady: boolean; artworkError: string; status: string }) {
  const pet = current && identity?.pet.availability === 'available' ? identity.pet.selected : null;
  const dot = current && identity?.dot.availability === 'available' ? identity.dot.selected : null;
  return <section className="panel-section host-identity" aria-label="ChatGPT identity connection">
    <h3>ChatGPT connection</h3>
    <p className="live-note">{current ? 'Read-only host observation. Local display names do not change ChatGPT identities or permissions.' : status}</p>
    <div className="identity-row"><strong>Castle companion</strong><span>{pet ? artworkReady ? `${pet.name} · appearance connected` : artworkError ? `${pet.name} · artwork unavailable; LOKI shown` : `${pet.name} · loading appearance; LOKI shown` : current && identity?.pet.availability === 'available' ? 'No pet selected · LOKI shown' : 'Selection unavailable · LOKI shown'}</span></div>
    <div className="identity-row"><strong>Coordinator dot</strong><span>{dot ? dot.name : current && identity?.dot.availability === 'available' ? 'No dot selected' : 'Identity unavailable'}</span></div>
    {dot && <><h4>Delegated tasks</h4>{dot.tasks.length ? <ul className="dot-task-list">{dot.tasks.map(task => <li key={task.id}><span>{task.title || 'Untitled task'}</span><small>{task.state === 'unknown' ? 'Status unconfirmed' : task.state === 'waiting' ? 'Needs review in ChatGPT' : task.state === 'working' ? 'Host reports working' : 'Complete'}</small></li>)}</ul> : <p className="live-note">No delegated tasks in this observation.</p>}<p className="live-note">Open ChatGPT to inspect tasks and handle decisions.</p></>}
  </section>;
}
