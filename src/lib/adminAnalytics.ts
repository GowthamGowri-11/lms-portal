export type RangeKey = '7d' | '30d' | '3m' | '6m' | '1y';

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
];

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function rangeStart(key: RangeKey, now = new Date()): Date {
  const d = new Date(now);
  if (key === '7d') d.setDate(d.getDate() - 6);
  else if (key === '30d') d.setDate(d.getDate() - 29);
  else if (key === '3m') d.setMonth(d.getMonth() - 3);
  else if (key === '6m') d.setMonth(d.getMonth() - 6);
  else d.setFullYear(d.getFullYear() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function previousRange(key: RangeKey, now = new Date()): { start: Date; end: Date } {
  const end = rangeStart(key, now);
  const start = rangeStart(key, new Date(end.getTime() - 1));
  return { start, end };
}

export type SeriesPoint = { label: string; value: number };

function formatDay(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatMonth(d: Date) {
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

export function bucketCounts(
  dates: Array<string | Date | null | undefined>,
  range: RangeKey,
  now = new Date()
): SeriesPoint[] {
  const start = rangeStart(range, now);
  const parsed = dates.map(toDate).filter((d): d is Date => !!d && d >= start && d <= now);

  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30;
    const buckets = new Map<string, { label: string; value: number; order: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { label: formatDay(d), value: 0, order: i });
    }
    parsed.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) bucket.value += 1;
    });
    return Array.from(buckets.values()).map(({ label, value }) => ({ label, value }));
  }

  if (range === '1y') {
    const buckets: SeriesPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: formatMonth(d), value: 0 });
    }
    parsed.forEach((d) => {
      const idx = (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - (now.getMonth() - 11);
      if (idx >= 0 && idx < buckets.length) buckets[idx].value += 1;
    });
    return buckets;
  }

  const weeks: SeriesPoint[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    weeks.push({ label: formatDay(cursor), value: 0 });
    cursor.setDate(cursor.getDate() + 7);
  }
  parsed.forEach((d) => {
    const idx = Math.floor((d.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < weeks.length) weeks[idx].value += 1;
  });
  return weeks;
}

export function bucketSums(
  items: Array<{ at: string | Date | null | undefined; amount: number }>,
  range: RangeKey,
  now = new Date()
): SeriesPoint[] {
  const start = rangeStart(range, now);
  const valid = items
    .map((item) => ({ date: toDate(item.at), amount: item.amount || 0 }))
    .filter((item): item is { date: Date; amount: number } => !!item.date && item.date >= start && item.date <= now);

  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30;
    const buckets = new Map<string, { label: string; value: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), { label: formatDay(d), value: 0 });
    }
    valid.forEach((item) => {
      const key = item.date.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) bucket.value += item.amount;
    });
    return Array.from(buckets.values());
  }

  if (range === '1y') {
    const buckets: SeriesPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: formatMonth(d), value: 0 });
    }
    valid.forEach((item) => {
      const idx =
        (item.date.getFullYear() - now.getFullYear()) * 12 + item.date.getMonth() - (now.getMonth() - 11);
      if (idx >= 0 && idx < buckets.length) buckets[idx].value += item.amount;
    });
    return buckets;
  }

  const weeks: SeriesPoint[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    weeks.push({ label: formatDay(cursor), value: 0 });
    cursor.setDate(cursor.getDate() + 7);
  }
  valid.forEach((item) => {
    const idx = Math.floor((item.date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < weeks.length) weeks[idx].value += item.amount;
  });
  return weeks;
}

export function comparePeriod(
  dates: Array<string | Date | null | undefined>,
  range: RangeKey,
  now = new Date()
): { current: number; previous: number; pct: number | null } {
  const start = rangeStart(range, now);
  const prev = previousRange(range, now);
  let current = 0;
  let previous = 0;
  dates.forEach((value) => {
    const d = toDate(value);
    if (!d) return;
    if (d >= start && d <= now) current += 1;
    else if (d >= prev.start && d < prev.end) previous += 1;
  });
  if (previous === 0) return { current, previous, pct: current > 0 ? null : 0 };
  return { current, previous, pct: ((current - previous) / previous) * 100 };
}

export function sparklineFromSeries(series: SeriesPoint[]): number[] {
  return series.map((p) => p.value);
}

export function formatPct(pct: number | null): string | null {
  if (pct === null) return null;
  const rounded = Math.abs(pct) >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10;
  return `${pct >= 0 ? '+' : ''}${rounded}%`;
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function relativeTime(value: string | Date): string {
  const d = toDate(value);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
