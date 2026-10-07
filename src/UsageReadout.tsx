import { useEffect, useState } from 'react';
import { cachePercent, formatCount, parseUsage, usageStale, windowLabel, type UsageSnapshot, type UsageSource, type UsageWindow } from './telemetry';

function useUsage(enabled: boolean, days: UsageWindow) {
  const [data, setData] = useState<UsageSnapshot | null>(null), [error, setError] = useState(''), [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!enabled) return;
    let stopped = false, request: AbortController | null = null, timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      if (stopped || request) return;
      clearTimeout(timer);
      if (document.hidden) { timer = setTimeout(load, 30_000); return; }
      const controller = new AbortController(); request = controller;
      const deadline = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`/api/observe?days=${days}`, { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) throw new Error();
        const next = parseUsage(await response.json());
        if (!stopped) { setData(next); setError(''); setNow(Date.now()); }
      } catch { if (!stopped) setError('Usage feed unavailable. Retained values are last known.'); }
      finally { clearTimeout(deadline); request = null; if (!stopped) timer = setTimeout(load, 30_000); }
    };
    const visibility = () => { if (!document.hidden) void load(); };
    const clock = setInterval(() => setNow(Date.now()), 10_000);
    document.addEventListener('visibilitychange', visibility); void load();
    return () => { stopped = true; request?.abort(); clearTimeout(timer); clearInterval(clock); document.removeEventListener('visibilitychange', visibility); };
  }, [enabled, days]);
  return { data, error, now };
}

export function Telemetry({ live = false }: { live?: boolean }) {
  const [source, setSource] = useState<UsageSource>('tokenuse'), [days, setDays] = useState<UsageWindow>(7);
  const { data, error, now } = useUsage(live, days), view = data?.[source];
  const available = !!view?.available, stale = !!view && (usageStale(view, now) || !!error);
  const counts = available ? view.counts : null, reuse = counts ? cachePercent(counts) : null;
  const quality = !live ? 'Demo · no models running' : !available ? error || 'Usage unavailable' : stale ? 'Last known' : view.partial ? 'Partial coverage' : 'Recorded usage';
  const daily = available ? view.daily : [], peak = Math.max(1, ...daily.map(day => day.calls ?? 0));
  return <details className={`telemetry ${live ? '' : 'telemetry-demo'}`} aria-label="Usage readout">
    <summary>
      <span className="telemetry-origin"><span className="tiny-label">ROYAL LEDGER</span><strong>{live ? view?.label ?? 'Token Use' : 'Demo realm'}</strong><small>{live ? view?.window ?? 'This month' : 'No usage consumed'}</small></span>
      {live ? <><span className="metric"><small>Fresh input</small><strong>{formatCount(counts?.input ?? null)}</strong></span>
      <span className="metric cache-metric"><small>Cache reused</small><strong>{formatCount(counts?.cache ?? null)}{reuse !== null && <em>{reuse.toFixed(1)}%</em>}</strong><span className="meter" aria-hidden="true"><i style={{ width: `${reuse ?? 0}%` }}/></span></span>
      <span className="metric"><small>Reported output</small><strong>{formatCount(counts?.output ?? null)}</strong></span>
      <span className="metric"><small>Recorded calls</small><strong>{formatCount(counts?.calls ?? null)}</strong></span>
      <span className="activity-trace"><small>{daily.length ? 'Daily calls' : 'Activity history'}</small>{daily.length ? <span className="spark-bars" role="img" aria-label={`${daily.length} recorded days. Expand for daily call counts.`}>{daily.map(day => <i key={day.day} className={day.calls === null ? 'missing' : ''} style={{ height: `${day.calls === null ? 5 : Math.max(3, day.calls / peak * 100)}%` }}/>)}</span> : <strong>—</strong>}</span></> : <span className="demo-ledger-note">No model calls. Usage appears in the connected realm.</span>}
      <span className={`telemetry-state ${stale || !available ? 'muted' : ''}`}><small>{quality}</small><span>Details <b aria-hidden="true">⌄</b></span></span>
    </summary>
    <div className="telemetry-expanded">
      {live && <div className="telemetry-filters"><label>Source<select value={source} onChange={event => setSource(event.target.value as UsageSource)}><option value="tokenuse">Token Use</option><option value="cloud">Genesis cloud</option><option value="external">Desktop CLI receipts</option></select></label><label>Window<select value={source === 'tokenuse' ? 'month' : days} disabled={source === 'tokenuse'} onChange={event => setDays(Number(event.target.value) as UsageWindow)}>{source === 'tokenuse' ? <option value="month">Current calendar month</option> : ([1, 7, 30, 0] as UsageWindow[]).map(day => <option key={day} value={day}>{windowLabel(day)}</option>)}</select></label><p>{quality}{view?.observedAt ? ` · Retrieved ${new Date(view.observedAt).toLocaleString()}` : ''}</p></div>}
      <dl className="ledger-facts"><div><dt>Account allowance</dt><dd>Not connected<small>The host feed does not expose provider quota or reset time.</small></dd></div><div><dt>Tokens saved</dt><dd>Not measured<small>No supported counterfactual baseline. Cache reuse is measured separately.</small></dd></div><div><dt>Cache writes</dt><dd>{formatCount(counts?.writes ?? null)}</dd></div><div><dt>{source === 'tokenuse' ? 'Sessions' : 'Unknown attempts'}</dt><dd>{formatCount(source === 'tokenuse' ? counts?.sessions ?? null : counts?.unknown ?? null)}</dd></div></dl>
      <p className="telemetry-note">{live ? 'Allowance is an account limit, not a token or dollar balance. No billed cost is inferred. ' : 'This simulation makes no model calls and does not query account telemetry. '}Cache reuse measures cached input, not tokens or money saved.</p>
      {live && view?.notes.map(note => <p className="telemetry-note" key={note}>{note}</p>)}
      {daily.length > 0 && <details className="daily-table"><summary>Daily call counts</summary><table><caption>{view?.label} · {view?.window} · recorded days</caption><thead><tr><th scope="col">Day</th><th scope="col">Calls</th></tr></thead><tbody>{daily.map(day => <tr key={day.day}><th scope="row">{day.day}</th><td>{day.calls === null ? 'Not reported' : day.calls.toLocaleString()}</td></tr>)}</tbody></table></details>}
    </div>
  </details>;
}
