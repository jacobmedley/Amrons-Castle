import { cleanDisplayName } from './characterNames';

export type HostPet = { id: string; name: string; artwork_revision: string };
export type HostDotTask = { id: string; title: string; state: 'working' | 'waiting' | 'complete' | 'unknown' };
export type HostDot = { id: string; name: string; tasks: HostDotTask[] };
export type HostIdentity = {
  schema_version: 1;
  source: 'chatgpt_work';
  observed_at: number;
  pet: { availability: 'available'; selected: HostPet | null } | { availability: 'unavailable' };
  dot: { availability: 'available'; selected: HostDot | null } | { availability: 'unavailable' };
};

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const identifier = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 160 && !/[\u0000-\u001f\u007f]/u.test(value);
const displayName = (value: unknown): value is string => typeof value === 'string' && cleanDisplayName(value) === value;

export function parseHostIdentity(value: unknown): HostIdentity {
  if (!record(value) || value.schema_version !== 1 || value.source !== 'chatgpt_work' || typeof value.observed_at !== 'number' || !Number.isFinite(value.observed_at) || value.observed_at <= 0) throw new Error('Host identity observation is unreadable.');
  const pet = value.pet, dot = value.dot;
  if (!record(pet) || !record(dot) || !['available', 'unavailable'].includes(String(pet.availability)) || !['available', 'unavailable'].includes(String(dot.availability))) throw new Error('Host identity coverage is unreadable.');
  if (pet.availability === 'available' && !('selected' in pet) || dot.availability === 'available' && !('selected' in dot)) throw new Error('Host identity selection is unreadable.');
  if (pet.availability === 'available' && pet.selected !== null) {
    const selected = pet.selected;
    if (!record(selected) || !identifier(selected.id) || !displayName(selected.name) || !identifier(selected.artwork_revision)) throw new Error('Selected pet is unreadable.');
  }
  if (dot.availability === 'available' && dot.selected !== null) {
    const selected = dot.selected;
    if (!record(selected) || !identifier(selected.id) || !displayName(selected.name) || !Array.isArray(selected.tasks) || selected.tasks.length > 100) throw new Error('Selected dot is unreadable.');
    const ids = new Set<string>();
    for (const task of selected.tasks) {
      if (!record(task) || !identifier(task.id) || ids.has(task.id) || typeof task.title !== 'string' || task.title.length > 200 || /[\u0000-\u001f\u007f]/u.test(task.title) || !['working', 'waiting', 'complete', 'unknown'].includes(String(task.state))) throw new Error('Dot task observation is unreadable.');
      ids.add(task.id);
    }
  }
  if (pet.availability === 'unavailable' && 'selected' in pet || dot.availability === 'unavailable' && 'selected' in dot) throw new Error('Unavailable identity cannot claim a selection.');
  return value as HostIdentity;
}

export function identityFresh(identity: HostIdentity | null, receivedAt: number, now: number): boolean {
  return !!identity && receivedAt > 0 && receivedAt <= now && now - receivedAt <= 30_000 && identity.observed_at * 1000 <= now + 5_000 && now - identity.observed_at * 1000 <= 30_000;
}
