import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cachePercent, parseUsage, usageStale, validCount } from '../src/telemetry';

const totals = { input: 20, output: 8, cache_read: 70, cache_write: 10, attempts: 3, unknown: 0 };
const fixture = () => ({ window_days: 7, observed_at: 1000, stale: false, cloud: totals, external: { ...totals, input: 1000 }, notices: [], token_use: { available: true, stale: false, retrieved_at: 990, reporting_month: '2026-01', totals: { input_tokens: 100, output_tokens: 50, cache_read_tokens: 300, cache_write_tokens: 0, calls: 10, sessions: 4 }, daily: [{ day: '01-02', calls: 7 }, { day: '01-01', calls: 3 }] } });
test('usage sources and reporting windows remain independent', () => {
  const data = parseUsage(fixture());
  assert.equal(data.cloud.counts.input, 20); assert.equal(data.external.counts.input, 1000); assert.equal(data.tokenuse.counts.input, 100);
  assert.equal(data.cloud.window, 'Last 7 days'); assert.equal(data.tokenuse.window, 'Month 2026-01');
  assert.deepEqual(data.tokenuse.daily.map(day => day.calls), [3, 7]);
  assert.deepEqual(data.cloud.daily, [], 'combined host trends must not be misattributed to cloud');
  assert.equal(cachePercent(data.cloud.counts), 70);
  assert.equal(cachePercent(data.tokenuse.counts), 75);
});
test('invalid or missing measurements stay unknown, not zero', () => {
  for (const value of [null, undefined, false, '3', -1, 1.1, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.equal(validCount(value), null);
  assert.equal(validCount(0), 0);
  const raw = fixture(); (raw.cloud as Record<string, unknown>).output = '8';
  const view = parseUsage(raw).cloud;
  assert.equal(view.counts.output, null); assert.equal(view.partial, true);
  assert.equal(cachePercent({ ...view.counts, cache: null }), null);
  assert.equal(cachePercent({ ...view.counts, input: 0, cache: 0, writes: 0 }), null);
});
test('unavailable, partial, stale and future-dated observations are explicit', () => {
  assert.throws(() => parseUsage({ loading: true }));
  const raw = fixture(); raw.token_use.available = false;
  assert.equal(parseUsage(raw).tokenuse.available, false);
  const view = parseUsage(fixture()).cloud;
  assert.equal(usageStale(view, 1_010_000), false);
  assert.equal(usageStale(view, 1_121_000), true);
  assert.equal(usageStale(view, 900_000), true);
  assert.equal(usageStale({ ...view, stale: true }, 1_010_000), true);
  assert.equal(usageStale({ ...view, observedAt: null }, 1_010_000), true);
  assert.equal(parseUsage({ ...fixture(), notices: ['Coverage limited'] }).cloud.partial, true);
});
test('unknown history stays missing and unexpected fields do not enter the view', () => {
  const raw = { ...fixture(), private_transcript: 'never retain', dollars_saved: 100, quota: 72 };
  raw.token_use.daily[0].calls = null as unknown as number;
  const result = parseUsage(raw);
  assert.equal(result.tokenuse.daily[1].calls, null);
  assert.equal(JSON.stringify(result).includes('never retain'), false);
  assert.equal(Object.hasOwn(result, 'dollars_saved'), false);
  assert.equal(Object.hasOwn(result, 'quota'), false);
});
