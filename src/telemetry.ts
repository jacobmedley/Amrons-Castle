export type UsageSource = 'tokenuse' | 'cloud' | 'external';
export type UsageWindow = 0 | 1 | 7 | 30;
export type UsageCounts = { input: number | null; output: number | null; cache: number | null; writes: number | null; calls: number | null; sessions: number | null; unknown: number | null };
export type UsageView = { source: UsageSource; label: string; window: string; observedAt: number | null; stale: boolean; available: boolean; partial: boolean; counts: UsageCounts; daily: { day: string; calls: number | null }[]; notes: string[] };
export type UsageSnapshot = Record<UsageSource, UsageView>;
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export const validCount = (value: unknown): number | null => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
const stamp = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value * 1000 : null;
export const windowLabel = (days: UsageWindow) => ({ 0: 'All retained', 1: 'Last 24 hours', 7: 'Last 7 days', 30: 'Last 30 days' })[days];
function countFields(value: unknown, tokenUse = false): UsageCounts {
  const row = object(value) ? value : {};
  return { input: validCount(row[tokenUse ? 'input_tokens' : 'input']), output: validCount(row[tokenUse ? 'output_tokens' : 'output']), cache: validCount(row[tokenUse ? 'cache_read_tokens' : 'cache_read']), writes: validCount(row[tokenUse ? 'cache_write_tokens' : 'cache_write']), calls: validCount(row[tokenUse ? 'calls' : 'attempts']), sessions: tokenUse ? validCount(row.sessions) : null, unknown: tokenUse ? null : validCount(row.unknown) };
}
export function parseUsage(value: unknown): UsageSnapshot {
  if (!object(value) || value.loading || !object(value.cloud) || !object(value.external) || ![0, 1, 7, 30].includes(value.window_days as number)) throw new Error('Usage observations are not ready.');
  const days = value.window_days as UsageWindow;
  const notices = Array.isArray(value.notices) ? value.notices.filter((note): note is string => typeof note === 'string').slice(0, 20) : [];
  const base = (source: 'cloud' | 'external', label: string): UsageView => {
    const counts = countFields(value[source]);
    return { source, label, window: windowLabel(days), observedAt: stamp(value.observed_at), stale: value.stale !== false || !!value.error, available: true, partial: counts.unknown !== 0 || notices.length > 0 || Object.entries(counts).some(([key, count]) => key !== 'sessions' && count === null), counts, daily: [], notes: ['Coverage is limited to retained receipts. Sources overlap and are never added together.', ...notices] };
  };
  const token = object(value.token_use) ? value.token_use : {}, counts = countFields(token.totals, true);
  const daily = Array.isArray(token.daily) ? token.daily.flatMap(item => object(item) && typeof item.day === 'string' && /^(?:\d{4}-)?\d{2}-\d{2}$/.test(item.day) ? [{ day: item.day, calls: validCount(item.calls) }] : []).slice(0, 32).sort((a, b) => a.day.localeCompare(b.day)) : [];
  return { cloud: base('cloud', 'Genesis cloud'), external: base('external', 'Desktop CLI receipts'), tokenuse: { source: 'tokenuse', label: 'Token Use', window: typeof token.reporting_month === 'string' && /^\d{4}-\d{2}$/.test(token.reporting_month) ? `Month ${token.reporting_month}` : 'This month', observedAt: stamp(token.retrieved_at), stale: token.stale !== false || !!token.error, available: token.available === true, partial: counts.input === null || counts.output === null || counts.cache === null || counts.writes === null || counts.calls === null, counts, daily, notes: ['Local archive coverage; source age is not reported.', 'Reported output is preserved. An earlier source audit found Codex reasoning may be counted twice by Token Use; no correction is inferred here.', 'Token Use, desktop CLI and Genesis records overlap. These views are not an account total.'] } };
}
export function cachePercent(counts: UsageCounts): number | null {
  const { input, cache, writes } = counts;
  if (input === null || cache === null || writes === null) return null;
  const total = input + cache + writes;
  return total > 0 && Number.isSafeInteger(total) ? cache / total * 100 : null;
}
export function usageStale(view: UsageView, now: number): boolean {
  return view.stale || view.observedAt === null || view.observedAt > now + 5000 || now - view.observedAt > (view.source === 'tokenuse' ? 900_000 : 120_000);
}
export const formatCount = (value: number | null) => value === null ? '—' : new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
