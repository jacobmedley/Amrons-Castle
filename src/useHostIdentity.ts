import { useEffect, useState } from 'react';
import { parseHostIdentity, type HostIdentity } from './hostIdentity';

export function useHostIdentity() {
  const [identity, setIdentity] = useState<HostIdentity | null>(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [error, setError] = useState('');
  const [artworkError, setArtworkError] = useState('');
  const [artwork, setArtwork] = useState<ImageBitmap | null>(null);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let active: AbortController | null = null;
    let currentArtwork: ImageBitmap | null = null;
    let currentKey = '';
    const load = async () => {
      if (cancelled || active) return;
      if (document.hidden) { timer = setTimeout(load, 15_000); return; }
      const controller = new AbortController(); active = controller;
      const timeout = setTimeout(() => controller.abort(), 8_000);
      try {
        const response = await fetch('/api/castle/identity', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Identity sign-in required.' : 'Identity connection unavailable.');
        if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error('Identity connection unavailable.');
        const payload: unknown = await response.json().catch(() => { throw new Error('Identity observation unreadable.'); });
        const next = parseHostIdentity(payload);
        if (cancelled) return;
        setIdentity(next); setReceivedAt(Date.now()); setError('');
        const pet = next.pet.availability === 'available' ? next.pet.selected : null;
        const key = pet ? `${pet.id}\u0000${pet.artwork_revision}` : '';
        if (key !== currentKey) {
          currentKey = key;
          currentArtwork?.close(); currentArtwork = null; setArtwork(null); setArtworkError('');
          if (pet) {
            try {
              const imageResponse = await fetch('/api/castle/companion-artwork', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
              if (!imageResponse.ok) throw new Error('Selected pet artwork is unavailable.');
              const blob = await imageResponse.blob();
              if (!['image/png', 'image/webp'].includes(blob.type) || blob.size > 4_000_000) throw new Error('Selected pet artwork is unreadable.');
              const decoded = await createImageBitmap(blob);
              if (decoded.width > 1024 || decoded.height > 1024 || decoded.width < 1 || decoded.height < 1) { decoded.close(); throw new Error('Selected pet artwork is too large.'); }
              if (cancelled || currentKey !== key) decoded.close();
              else { currentArtwork = decoded; setArtwork(decoded); }
            } catch {
              if (!cancelled) { currentKey = ''; setArtworkError('Selected pet artwork is unavailable. LOKI remains visible.'); }
            }
          }
        }
      } catch (failure) {
        if (!cancelled) setError(failure instanceof TypeError ? 'Identity connection unavailable.' : failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'Identity connection timed out.');
      } finally {
        clearTimeout(timeout); active = null;
        if (!cancelled) timer = setTimeout(load, 15_000);
      }
    };
    const visibility = () => { if (!document.hidden) { clearTimeout(timer); void load(); } };
    document.addEventListener('visibilitychange', visibility);
    void load();
    return () => { cancelled = true; clearTimeout(timer); active?.abort(); currentArtwork?.close(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return { identity, receivedAt, error, artwork, artworkError };
}
