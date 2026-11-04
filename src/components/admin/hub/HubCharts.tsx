'use client';

type Point = { label: string; value: number };

function niceMax(values: number[]) {
  const max = Math.max(0, ...values);
  if (max === 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / pow) * pow;
}

export function LineChart({
  data,
  color = '#2563EB',
  fill = false,
  height = 210,
  valuePrefix = '',
}: {
  data: Point[];
  color?: string;
  fill?: boolean;
  height?: number;
  valuePrefix?: string;
}) {
  const w = 640;
  const h = height;
  const pad = { l: 42, r: 12, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = niceMax(data.map((d) => d.value));
  const n = Math.max(data.length, 1);

  const coords = data.map((d, i) => {
    const x = pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = pad.t + innerH - (d.value / max) * innerH;
    return { x, y, ...d };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = coords.length
    ? `${line} L ${coords[coords.length - 1].x} ${pad.t + innerH} L ${coords[0].x} ${pad.t + innerH} Z`
    : '';

  const ticks = 4;
  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} role="img">
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = pad.t + (innerH * i) / ticks;
        const val = max - (max * i) / ticks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#E5EAF2" strokeWidth="1" />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#64748B">
              {valuePrefix}
              {Math.round(val).toLocaleString('en-IN')}
            </text>
          </g>
        );
      })}
      {fill && area && <path d={area} fill={color} opacity="0.12" />}
      {line && <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinejoin="round" />}
      {coords.map((c, i) =>
        i % labelStep === 0 ? (
          <text key={c.label + i} x={c.x} y={h - 8} textAnchor="middle" fontSize="10" fill="#64748B">
            {c.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

export function BarChart({
  data,
  color = '#2563EB',
  height = 210,
}: {
  data: Point[];
  color?: string;
  height?: number;
}) {
  const w = 640;
  const h = height;
  const pad = { l: 42, r: 12, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = niceMax(data.map((d) => d.value));
  const gap = 6;
  const barW = data.length ? Math.max(6, innerW / data.length - gap) : 0;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} role="img">
      {data.map((d, i) => {
        const bh = (d.value / max) * innerH;
        const x = pad.l + i * (barW + gap);
        const y = pad.t + innerH - bh;
        const show = data.length <= 12 || i % Math.ceil(data.length / 8) === 0;
        return (
          <g key={d.label + i}>
            <rect x={x} y={y} width={barW} height={Math.max(bh, 0)} rx="4" fill={color} opacity="0.9" />
            {show && (
              <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize="10" fill="#64748B">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({
  data,
  colors = ['#2563EB', '#8B5CF6', '#16A34A', '#F59E0B', '#EF4444', '#0EA5E9'],
}: {
  data: Point[];
  colors?: string[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 58;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, alignItems: 'center', padding: '0 8px 8px' }}>
      <svg viewBox="0 0 160 160" width="160" height="160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#E5EAF2" strokeWidth="18" />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={d.label}
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="18"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="18" fontWeight="800" fill="#111827">
          {data.reduce((s, d) => s + d.value, 0)}
        </text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#64748B">
          enrollments
        </text>
      </svg>
      <div>
        {data.map((d, i) => (
          <div key={`donut-item-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: colors[i % colors.length] }} />
              {d.label}
            </span>
            <strong>{d.value}</strong>
          </div>
        ))}
        {data.length === 0 && <div style={{ color: '#64748B', fontSize: 13 }}>No enrollment distribution yet.</div>}
      </div>
    </div>
  );
}

export function Sparkline({ values, color = '#2563EB' }: { values: number[]; color?: string }) {
  const w = 120;
  const h = 28;
  const max = Math.max(1, ...values);
  const n = Math.max(values.length, 1);
  const pts = values.map((v, i) => {
    const x = n === 1 ? w / 2 : (i / (n - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const line = pts.length ? `M ${pts.map((p) => p.replace(',', ' ')).join(' L ')}` : '';
  const area = pts.length
    ? `${line} L ${w} ${h} L 0 ${h} Z`
    : '';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="28" preserveAspectRatio="none">
      <path d={area} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function ProgressList({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.length === 0 && <div style={{ color: '#64748B', fontSize: 13 }}>No completion data yet.</div>}
      {items.map((item, i) => (
        <div key={`progress-item-${i}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: '#111827', fontWeight: 600 }}>{item.label}</span>
            <span style={{ color: '#64748B' }}>{Math.round(item.value)}%</span>
          </div>
          <div style={{ height: 7, background: '#E5EAF2', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.max(0, item.value))}%`, height: '100%', background: '#8B5CF6' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
