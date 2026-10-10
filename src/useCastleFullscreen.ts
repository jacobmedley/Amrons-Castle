import { useEffect, useRef, useState } from 'react';

export function useCastleFullscreen() {
  const containerRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const nativeFullscreen = useRef(false);

  useEffect(() => {
    const sync = () => {
      const active = document.fullscreenElement === containerRef.current;
      if (active) {
        nativeFullscreen.current = true;
        setExpanded(true);
      } else if (nativeFullscreen.current) {
        nativeFullscreen.current = false;
        setExpanded(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) setExpanded(false);
    };
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('keydown', escape, true);
    };
  }, []);

  const toggle = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (expanded) {
      if (document.fullscreenElement === container) {
        try { await document.exitFullscreen(); } catch { /* CSS view still exits below. */ }
      }
      setExpanded(false);
      return;
    }
    setExpanded(true);
    try { await container.requestFullscreen?.(); } catch { /* Keep the viewport-filling fallback. */ }
  };

  return { containerRef, expanded, toggle };
}
