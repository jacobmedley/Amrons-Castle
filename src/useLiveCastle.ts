import { useEffect, useState } from 'react';
import { parseLiveSnapshot, type LiveSnapshot } from './live';

export function useLiveCastle() {
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let request: AbortController | null = null;
    const load = async () => {
      if (cancelled || request) return;
      clearTimeout(timer);
      if (document.hidden) { timer = setTimeout(load, 6000); return; }
      const controller = new AbortController(); request = controller;
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch('/api/castle', { signal: controller.signal, cache: 'no-store', credentials: 'same-origin' });
        if (response.status === 401 || response.status === 403) throw new Error('Sign-in required. Open the dashboard to reconnect.');
        if (!response.ok) throw new Error('Dashboard updates are unavailable. Retrying automatically.');
        const data = parseLiveSnapshot(await response.json());
        if (!cancelled) { setSnapshot(data); setReceivedAt(Date.now()); setNow(Date.now()); setError(''); }
      } catch (failure) {
        if (!cancelled) setError(failure instanceof TypeError ? 'Dashboard connection interrupted. Retrying automatically.' : failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'The dashboard did not respond. Retrying automatically.');
      } finally {
        clearTimeout(timeout); request = null;
        if (!cancelled) timer = setTimeout(load, 6000);
      }
    };
    const visibility = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', visibility);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    void load();
    return () => { cancelled = true; clearTimeout(timer); clearInterval(clock); request?.abort(); document.removeEventListener('visibilitychange', visibility); };
  }, [refresh]);
  return { snapshot, receivedAt, now, error, retry: () => setRefresh(value => value + 1) };
}
