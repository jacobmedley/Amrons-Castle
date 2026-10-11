import { useEffect, useState } from 'react';
import { agents } from './model';

export const companionId = 'loki';
export const characterDefaults: Record<string, string> = Object.fromEntries([...agents.map(agent => [agent.id, agent.name]), [companionId, 'LOKI']]);
export const characterIds = Object.keys(characterDefaults);
export const characterNamesKey = 'amrons-castle.character-names.v1';
export type CharacterNames = Record<string, string>;

export function cleanDisplayName(value: string): string | null {
  if (/[\u0000-\u001f\u007f]/u.test(value)) return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || Array.from(name).length > 28) return null;
  return name;
}

export function readCharacterNames(raw: string | null): CharacterNames {
  if (!raw) return { ...characterDefaults };
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || !('version' in saved) || saved.version !== 1 || !('names' in saved) || !saved.names || typeof saved.names !== 'object') return { ...characterDefaults };
    const names = saved.names as Record<string, unknown>;
    return Object.fromEntries(characterIds.map(id => [id, typeof names[id] === 'string' ? cleanDisplayName(names[id]) ?? characterDefaults[id] : characterDefaults[id]]));
  } catch { return { ...characterDefaults }; }
}

export function saveCharacterNames(names: CharacterNames): CharacterNames {
  const next = Object.fromEntries(characterIds.map(id => [id, cleanDisplayName(names[id] ?? '') ?? characterDefaults[id]]));
  try { localStorage.setItem(characterNamesKey, JSON.stringify({ version: 1, names: next })); } catch { /* The current view still works when storage is unavailable. */ }
  return next;
}

const defaultNameIds = Object.fromEntries(agents.map(agent => [agent.name, agent.id]));
export function displayStoryText(text: string, names: CharacterNames): string {
  return text.replace(/\b(?:Amron|Orin|Mira|Liora|Quill|Borin|Flint)\b/g, match => names[defaultNameIds[match]] || match);
}

export function useCharacterNames() {
  const [names, setNames] = useState<CharacterNames>(() => {
    try { return readCharacterNames(localStorage.getItem(characterNamesKey)); } catch { return { ...characterDefaults }; }
  });
  useEffect(() => {
    const onStorage = (event: StorageEvent) => { if (event.key === characterNamesKey) setNames(readCharacterNames(event.newValue)); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const update = (next: CharacterNames) => setNames(saveCharacterNames(next));
  const restore = () => { try { localStorage.removeItem(characterNamesKey); } catch { /* Keep defaults in the current view. */ } setNames({ ...characterDefaults }); };
  return { names, update, restore };
}
