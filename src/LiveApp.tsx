import { useEffect, useMemo, useRef, useState } from 'react';
import { CastleTurret } from '@phosphor-icons/react/dist/csr/CastleTurret';
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { ArrowsOut } from '@phosphor-icons/react/dist/csr/ArrowsOut';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { Minus } from '@phosphor-icons/react/dist/csr/Minus';
import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { Crown } from '@phosphor-icons/react/dist/csr/Crown';
import { Scroll } from '@phosphor-icons/react/dist/csr/Scroll';
import { Compass } from '@phosphor-icons/react/dist/csr/Compass';
import { Scene, type SceneHandle } from './Scene';
import { Portrait } from './App';
import { loadAssets, type Assets } from './assets';
import { agents, rooms, type RoomId } from './model';
import { agentForRun, agentRoles, confirmedRunning, liveSceneState, runHref, runLabel, snapshotFresh, type LiveRun, type LiveSnapshot } from './live';
import { useLiveCastle } from './useLiveCastle';

function LiveStatus({ run, stale }: { run: LiveRun; stale: boolean }) {
  const label = runLabel(run);
  const kind = label === 'Working' ? 'working' : label === 'Needs you' ? 'review' : label === 'Complete' ? 'complete' : label === 'Unconfirmed' ? 'unconfirmed' : 'blocked';
  return <span className={`status-badge ${stale ? 'unconfirmed' : kind}`}><i/>{stale ? `Last recorded: ${label}` : label}</span>;
}

function ModelDetails({ agentId, snapshot }: { agentId: string | null; snapshot: LiveSnapshot | null }) {
  const roleId = agentId ? agentRoles[agentId] : undefined;
  const role = roleId ? snapshot?.roles[roleId] : undefined;
  const amron = agentId === 'amron';
  return <section className="execution-details" aria-label="Model and effort">
    <div className="execution-heading"><h3>Model & effort</h3><span>{role ? 'Current configuration' : amron ? 'Human direction' : 'Unassigned'}</span></div>
    <dl><div><dt>Requested model</dt><dd>{amron ? 'Preserve active lead' : role?.requested_model || 'Not reported'}</dd></div>
      <div><dt>Requested effort</dt><dd>{amron ? 'Unreported' : role?.requested_effort || 'Not reported'}</dd></div>
      <div><dt>Runtime model</dt><dd>Unverified</dd></div><div><dt>Runtime effort</dt><dd>Unverified</dd></div></dl>
    <small>{role ? 'Current role configuration, not proof of what a particular run used. Runtime-accepted settings are not exposed by Genesis.' : amron ? 'Amron coordinates human decisions. The active lead model and effort are not exposed by this dashboard.' : 'No automatic role is assigned here. No model or effort is inferred from historical work.'}</small>
  </section>;
}

export function LiveApp() {
  const { snapshot, receivedAt, now, error, retry } = useLiveCastle();
  const [assets, setAssets] = useState<Assets | null>(null), [assetError, setAssetError] = useState('');
  const [view, setView] = useState<'castle' | 'work'>('castle');
  const [selected, setSelected] = useState<string | null>(null), [selectedRun, setSelectedRun] = useState<string | null>(null), [selectedRoom, setSelectedRoom] = useState<RoomId | null>(null);
  const [filter, setFilter] = useState('all'), [paused, setPaused] = useState(false), [scale, setScale] = useState(1);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scene = useRef<SceneHandle>(null), panel = useRef<HTMLElement>(null), returnFocus = useRef<HTMLElement | null>(null);
  const fresh = !error && snapshotFresh(snapshot, receivedAt, now);
  const completeObservation = fresh && snapshot?.issues.length === 0;
  const sceneState = useMemo(() => liveSceneState(snapshot, completeObservation), [snapshot, completeObservation]);
  const runs = snapshot?.runs ?? [];
  const working = runs.filter(confirmedRunning).length, reviews = runs.filter(run => run.state === 'waiting').length;
  const selectedAgent = agents.find(agent => agent.id === selected), run = runs.find(item => item.thread === selectedRun), room = rooms.find(item => item.id === selectedRoom);
  const rememberTrigger = () => { const active = document.activeElement; if (active instanceof HTMLElement && !panel.current?.contains(active)) returnFocus.current = active.matches('button,a[href],[tabindex]') ? active : null; };
  const selectAgent = (id: string) => { rememberTrigger(); setSelected(id); setSelectedRun(null); setSelectedRoom(null); };
  const selectRun = (id: string) => { rememberTrigger(); setSelectedRun(id); setSelected(null); setSelectedRoom(null); };
  const selectRoom = (id: RoomId) => { rememberTrigger(); setSelectedRoom(id); setSelected(null); setSelectedRun(null); };
  const closeDetails = () => {
    setSelected(null); setSelectedRun(null); setSelectedRoom(null);
    const previous = returnFocus.current;
    (previous?.isConnected && previous.getClientRects().length && getComputedStyle(previous).visibility !== 'hidden' ? previous : document.querySelector<HTMLElement>('.brand'))?.focus({ preventScroll: true });
  };
  useEffect(() => { let cancelled = false; loadAssets().then(value => { if (!cancelled) setAssets(value); }).catch(() => { if (!cancelled) setAssetError('Castle artwork could not load. Reload after reconnecting to the dashboard.'); }); return () => { cancelled = true; }; }, []);
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetails(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);
  useEffect(() => {
    if (!selected && !selectedRun && !selectedRoom) return;
    panel.current?.querySelector('.panel-scroll')?.scrollTo({ top: 0 }); panel.current?.focus({ preventScroll: true });
    if (matchMedia('(max-width:780px)').matches) panel.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [selected, selectedRun, selectedRoom]);
  useEffect(() => { if (view === 'castle' && selectedRoom) { const frame = requestAnimationFrame(() => scene.current?.focusRoom(selectedRoom)); return () => cancelAnimationFrame(frame); } }, [view, selectedRoom]);
  const agentRuns = (id: string) => runs.filter(item => agentForRun(item) === id);
  const runRow = (item: LiveRun) => <button key={item.thread} className="compact-task" onClick={() => selectRun(item.thread)}><span><small>{item.stage.replaceAll('_', ' ')}</small><strong>{item.task || item.thread}</strong><LiveStatus run={item} stale={!fresh}/></span><ArrowRight size={14}/></button>;
  const assignedLabel = (id: string) => {
    const assigned = agentRuns(id);
    if (!completeObservation) return 'Activity unconfirmed';
    if (assigned.some(item => item.state === 'waiting')) return 'Needs you';
    if (assigned.some(confirmedRunning)) return completeObservation ? 'Working' : 'Activity unconfirmed';
    return assigned.length ? 'Check recorded work' : id === 'amron' ? 'No decisions waiting' : agentRoles[id] ? 'Ready for work' : 'No automatic assignment';
  };
  const statusText = error || (!snapshot ? 'Connecting to Genesis…' : !fresh ? 'Observation is out of date. Motion is paused until a fresh update arrives.' : snapshot.issues.length ? `${snapshot.issues.length} record${snapshot.issues.length === 1 ? '' : 's'} could not be read. This view is incomplete; motion is paused.` : runs.length ? `${working} confirmed working · ${reviews} need you · ${runs.filter(item => item.state === 'done').length} complete` : 'The castle is quiet. No recorded runs yet.');
  const filteredRuns = runs.filter(item => filter === 'all' || (filter === 'working' ? confirmedRunning(item) : filter === 'attention' ? !['done', 'waiting'].includes(item.state) && !confirmedRunning(item) : item.state === filter));

  return <div className="app-shell live-app">
    <header className="topbar"><a className="brand" href="/" aria-label="Genesis dashboard"><span className="brand-mark"><CastleTurret size={28} weight="duotone"/></span><span>Amron’s Castle<small>GENESIS COMMAND CENTER</small></span></a>
      <nav aria-label="Main navigation"><button className={view === 'castle' ? 'active' : ''} aria-current={view === 'castle' ? 'page' : undefined} onClick={() => setView('castle')}><CastleTurret size={18}/>The castle</button><button className={view === 'work' ? 'active' : ''} aria-current={view === 'work' ? 'page' : undefined} onClick={() => setView('work')}><Scroll size={18}/>Recorded work<span className="nav-count">{runs.length}</span></button></nav>
      <div className="header-actions"><a className="dashboard-return" href="/">Dashboard</a><a className="demo-label demo-link" href="./index.html?demo=1&dashboard=1" target="_blank" rel="noopener">Try the demo<ArrowRight size={13}/></a></div>
    </header>
    <main><section className="page-heading"><div><p className="eyebrow">YOUR AGENTS, IN THEIR ELEMENT</p><h1>The realm, connected.</h1><p>Persistent characters. Recorded work. Your decisions.</p></div><button className="quiet-button" onClick={retry}>Refresh</button></section>
      <div className={`execution-summary live-observation ${!completeObservation ? 'observation-warning' : ''}`}><span><i className="execution-dot"/><strong>Genesis observations</strong><span>Requested settings ≠ runtime acceptance</span></span><a href="./index.html?demo=1&dashboard=1" target="_blank" rel="noopener">Open demo<ArrowRight size={14}/></a></div>
      <div className="live-health"><p role="status">{statusText}{!fresh && snapshot ? ' Last recorded work is retained.' : ''}</p><small>{receivedAt ? `Last checked ${new Date(receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Read-only connection · no model calls from this page'}</small></div>
      <div className="realm-layout"><section className="realm-main" aria-label={view === 'castle' ? 'Castle overview' : 'Recorded work'}>
        <div className="realm-toolbar"><div className="realm-title"><span className="realm-sigil"><Compass size={18}/></span><strong>{view === 'castle' ? 'Castle of Amron' : 'The work ledger'}</strong><span className="toolbar-divider"/><span className="quiet-text">{fresh ? 'Observed checkpoints' : 'Awaiting fresh observations'}</span></div></div>
        {view === 'castle' ? <div className="map-wrap">{assets ? <Scene ref={scene} assets={assets} state={sceneState} paused={paused || reduced || !completeObservation} reduced={reduced} selected={selected} onSelect={selectAgent} onRoom={selectRoom} onScale={setScale} animateIdle={false}/> : <div className="asset-loading"><CastleTurret size={38}/><strong>{assetError || 'Opening the castle gates…'}</strong>{assetError && <button onClick={() => location.reload()}>Reload</button>}</div>}
          <div className="map-controls"><button aria-label="Zoom out" onClick={() => scene.current?.zoom(.8)}><Minus size={16}/></button><span>{Math.round(scale * 100)}%</span><button aria-label="Zoom in" onClick={() => scene.current?.zoom(1.25)}><Plus size={16}/></button><i/><button className="fit-button" onClick={() => scene.current?.fit()}><ArrowsOut size={16}/><span>Fit castle</span></button></div>
          <button className="motion-button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? <Play size={15}/> : <Pause size={15}/>} {paused ? 'Resume motion' : 'Pause motion'}</button>
        </div> : <div className="quest-board"><div className="quest-filters" aria-label="Filter recorded work">{['all', 'working', 'waiting', 'done', 'attention'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{({ all: 'All work', working: 'Working', waiting: 'Needs you', done: 'Complete', attention: 'Check status' })[value]}</button>)}</div>
          <div className="quest-cards">{filteredRuns.map(item => <button className={`quest-card ${selectedRun === item.thread ? 'selected' : ''}`} key={item.thread} onClick={() => selectRun(item.thread)}><div><span className="quest-number">{item.stage.replaceAll('_', ' ')}</span><LiveStatus run={item} stale={!fresh}/></div><h2>{item.task || item.thread}</h2><p>{item.status || 'Open this run to inspect its checkpoint, outputs and history.'}</p><footer><span>{agents.find(agent => agent.id === agentForRun(item))?.name || (item.state === 'done' ? 'Great Hall archive' : 'Assignment unconfirmed')}</span><ArrowRight size={18}/></footer></button>)}</div>
          {runs.length > 0 && filteredRuns.length === 0 && <div className="empty-state"><h2>No work in this view.</h2><p>Choose another filter to explore recorded work.</p></div>}{runs.length === 0 && <div className="empty-state"><h2>{completeObservation ? 'A quiet castle.' : 'Waiting for observations.'}</h2><p>{completeObservation ? 'There are no recorded runs. The demo is available without starting work.' : 'Your last confirmed work will appear when Genesis responds.'}</p></div>}
        </div>}
        <div className="map-footer"><span>{completeObservation ? working : '—'} working</span><button onClick={() => { setView('work'); setFilter('waiting'); }}>{reviews} need you</button><span>{runs.filter(item => item.state === 'done').length} complete</span><small>{reduced ? 'Reduced motion enabled' : paused ? 'Motion paused · observations continue' : 'Drag to explore · Scroll to zoom'}</small></div>
      </section>
      <aside ref={panel} className="detail-panel" aria-label="Realm details" tabIndex={-1}><div className="panel-top"><p className="eyebrow">{selectedRun ? 'RECORDED RUN' : selectedAgent ? 'MEET YOUR AGENT' : room ? 'EXPLORE THE CASTLE' : 'THE WAR ROOM'}</p>{(selectedRun || selectedAgent || room) && <button className="icon-button" aria-label="Close details" onClick={closeDetails}><X size={17}/></button>}</div><div className="panel-scroll">
        {selectedRun ? run ? <><div className="task-heading"><LiveStatus run={run} stale={!fresh}/><h2>{run.task || run.thread}</h2><p>{run.status || 'Recorded checkpoint'}</p></div><p className="live-run-stage">Stage: {run.stage.replaceAll('_', ' ')}<br/>{agentForRun(run) ? `With ${agents.find(agent => agent.id === agentForRun(run))?.name}` : run.state === 'done' ? 'Completed work in the Great Hall archive' : 'No confirmed character assignment'}</p><ModelDetails agentId={agentForRun(run)} snapshot={snapshot}/><a className="primary-button" href={runHref(run.thread)}>{run.state === 'waiting' ? 'Open review in dashboard' : 'Inspect run & outputs'}<ArrowRight size={16}/></a><p className="live-note">Review, edit, approve and retry through the existing dashboard controls. Opening this link does not start work.</p><p className="live-note">{run.updated ? `Checkpoint recorded ${new Date(run.updated).toLocaleString()}.` : 'Checkpoint time not reported.'}</p></> : <><h2>This run is no longer in the observation.</h2><p className="live-note">The view may be incomplete or the run may have changed. Refresh or open the dashboard to inspect it.</p><a className="primary-button" href={runHref(selectedRun)}>Open recorded run<ArrowRight size={16}/></a></> : selectedAgent ? <><div className="profile-heading"><Portrait agent={selectedAgent} assets={assets} large/><span><small>{selectedAgent.folk}</small><h2>{selectedAgent.name}</h2><p>{selectedAgent.title}</p></span></div><p className="profile-description">{selectedAgent.description}</p><p className="live-agent-status">{assignedLabel(selectedAgent.id)}</p><ModelDetails agentId={selectedAgent.id} snapshot={snapshot}/><button className="location-link" onClick={() => { setView('castle'); selectRoom(selectedAgent.room); }}><Compass size={16}/>{rooms.find(item => item.id === selectedAgent.room)?.name}<ArrowRight size={14}/></button><section className="panel-section"><h3>Recorded work</h3>{agentRuns(selectedAgent.id).map(runRow)}{!agentRuns(selectedAgent.id).length && <p className="live-note">{selectedAgent.id === 'mira' || selectedAgent.id === 'flint' ? 'This specialist is part of the persistent cast. Genesis has no separate automated role assigned here yet.' : 'No assigned runs appear in the available observation. Completed runs remain in the work ledger.'}</p>}</section></> : room ? <><div className="room-details-heading"><Compass size={30}/><h2>{room.name}</h2><p>{room.purpose}</p></div><div className="agent-list">{agents.filter(agent => agent.room === room.id).map(agent => <button key={agent.id} onClick={() => selectAgent(agent.id)}><Portrait agent={agent} assets={assets}/><span><strong>{agent.name}</strong><small>{assignedLabel(agent.id)}</small></span><ArrowRight size={14}/></button>)}</div>{room.id === 'hall' && <button className="primary-button" onClick={() => { setView('work'); setFilter('all'); }}>Open work ledger<ArrowRight size={16}/></button>}{room.id === 'grounds' && <p className="profile-description">A quiet corner of the realm between great quests.</p>}</> : <><button className="queen-card" onClick={() => selectAgent('amron')}><Portrait agent={agents[0]} assets={assets} large/><span><span className="queen-label"><Crown size={12}/> YOUR COMMANDER</span><strong>Queen Amron</strong><small>Strategy, wisdom & a steady hand.</small></span></button><div className="panel-divider"/><section className="panel-section"><h3>Awaiting your word</h3>{runs.filter(item => item.state === 'waiting').map(runRow)}{!reviews && <p className="live-note">{completeObservation ? 'No recorded decisions waiting.' : 'Waiting for a confirmed observation.'}</p>}</section><section className="panel-section"><h3>Recent recorded work</h3>{runs.slice(0, 4).map(runRow)}{snapshot && !runs.length && <p className="live-note">No runs in the available observation.</p>}</section><a className="secondary-button" href="./index.html?demo=1&dashboard=1" target="_blank" rel="noopener">Explore the interactive demo<ArrowRight size={15}/></a></>}
      </div><div className="panel-foot"><span className="live-label">GENESIS</span><span>{fresh ? 'Checkpoint observations · no inferred model activity' : 'Activity unconfirmed · motion paused'}</span></div></aside></div>
      <section className="cast-section"><div className="cast-heading"><h2>The fellowship</h2><span>Persistent identities. Shared purpose.</span><small>7 AGENTS</small></div><div className="cast-roster">{agents.map(agent => <button key={agent.id} className={`cast-card ${selected === agent.id ? 'selected' : ''}`} onClick={() => selectAgent(agent.id)}><Portrait agent={agent} assets={assets}/><span><strong>{agent.name}</strong><small>{agent.title}</small><small className="live-roster-status">{assignedLabel(agent.id)}</small></span></button>)}</div></section>
      <footer className="page-footer"><span><CastleTurret size={14}/>A little magic. Meaningful work.</span><span>Genesis dashboard · <a href="./index.html?demo=1&dashboard=1" target="_blank" rel="noopener">Interactive demo ↗</a></span></footer>
    </main>
  </div>;
}
