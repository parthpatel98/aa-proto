import React, { useState } from 'react';

/**
 * Small, dependency-free SVG chart primitives shared by the KPI Dashboard and
 * the Operations Dashboard. Colors are always passed in by the caller — never
 * hardcoded here — so callers can keep categorical vs. status assignment
 * consistent with the rest of the app (see the theme reserved in index.css:
 * --chart-blue for identity, var(--green/--blue/--amber/--red/--violet) for
 * status, var(--ink-3) for a neutral "Other" bucket).
 */

export interface Slice {
  label: string;
  value: number;
  color: string;
}

/** Donut chart with a center total and a value/percent legend. Click-through
 * on both the arc and the legend row when onSelect is given. */
export const Donut: React.FC<{
  slices: Slice[];
  centerValue: React.ReactNode;
  centerLabel: string;
  size?: number;
  onSelect?: (label: string) => void;
}> = ({ slices, centerValue, centerLabel, size = 132, onSelect }) => {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const GAP = 2.5; // px gap between segments, per mark spec
  let offset = 0;

  return (
    <div className="donutwrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-2)" strokeWidth={16} />
        {slices.map((s, i) => {
          const frac = s.value / total;
          const len = Math.max(frac * c - GAP, 0);
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -offset;
          offset += frac * c;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={16}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onClick={() => onSelect?.(s.label)}
            >
              <title>{`${s.label}: ${s.value} (${Math.round(frac * 100)}%)`}</title>
            </circle>
          );
        })}
        <text x={size / 2} y={size / 2 - 3} textAnchor="middle" fontSize={size * 0.19} fontWeight={700} fill="var(--ink)">
          {centerValue}
        </text>
        <text x={size / 2} y={size / 2 + 15} textAnchor="middle" fontSize={10} fill="var(--ink-3)">
          {centerLabel}
        </text>
      </svg>
      <div className="donutlegend">
        {slices.map((s, i) => (
          <div
            key={i}
            className="dlrow"
            onClick={() => onSelect?.(s.label)}
            role={onSelect ? 'button' : undefined}
          >
            <span className="dot" style={{ background: s.color }} />
            <span className="dllabel">{s.label}</span>
            <span className="dlval">{s.value}</span>
            <span className="dlpct">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Horizontal ranked bar list — identity or magnitude, one row per category. */
export const HBarList: React.FC<{
  rows: Array<{ label: string; value: number; display?: string; color: string }>;
  onSelect?: (label: string) => void;
}> = ({ rows, onSelect }) => {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="hbarlist">
      {rows.map((r, i) => (
        <div
          key={i}
          className="hbarrow"
          onClick={() => onSelect?.(r.label)}
          style={{ cursor: onSelect ? 'pointer' : 'default' }}
        >
          <span className="ell" title={r.label}>{r.label}</span>
          <span className="hbtrack">
            <i style={{ width: `${(r.value / max) * 100}%`, background: r.color }} />
          </span>
          <span className="hbval">{r.display ?? r.value}</span>
        </div>
      ))}
    </div>
  );
};

/*
 * A note on these three charts: the plot area uses a `viewBox="0 0 100 H"` with
 * `preserveAspectRatio="none"` so bars/lines fill the full card width at any
 * screen size. That non-uniform scaling is fine for straight geometry (rects,
 * polylines) but would badly distort `<text>` glyphs — so no chart below puts
 * text inside that SVG. Axis labels and direct value labels are plain HTML,
 * absolutely positioned by percentage over the plot, which stays crisp at any
 * width and is also what lets them wrap/truncate like normal text.
 */

const AXIS_LABEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  fontSize: 10,
  color: 'var(--ink-3)',
  transform: 'translateX(-50%)',
  whiteSpace: 'nowrap'
};

/** Vertical single-series bar chart (ordinal x, e.g. day-of-week), with direct
 * value labels on top of each bar. */
export const BarChart: React.FC<{
  points: Array<{ x: string; y: number }>;
  color: string;
  height?: number;
  onSelect?: (x: string) => void;
}> = ({ points, color, height = 170, onSelect }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.y), 1);
  const padTopPx = 22;
  const padBottomPx = 20;
  const plotH = height - padTopPx - padBottomPx;
  const bw = 100 / points.length;

  return (
    <div style={{ position: 'relative', paddingBottom: padBottomPx, paddingTop: padTopPx }}>
      <svg width="100%" height={plotH} viewBox={`0 0 100 ${plotH}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={0} x2={100} y1={plotH * f} y2={plotH * f} className="chartgrid" vectorEffect="non-scaling-stroke" />
        ))}
        {points.map((p, i) => {
          const h = (p.y / max) * plotH;
          const x = i * bw + bw * 0.22;
          const w = bw * 0.56;
          const y = plotH - h;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => onSelect?.(p.x)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
              <rect x={x} y={y} width={w} height={Math.max(h, 1)} rx={1.5} fill={color} opacity={hover === null || hover === i ? 1 : 0.55}>
                <title>{`${p.x}: ${p.y}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      {points.map((p, i) => {
        const h = (p.y / max) * plotH;
        const topPx = padTopPx + (plotH - h);
        return (
          <span key={i} style={{ position: 'absolute', top: topPx, left: `${(i + 0.5) * bw}%`, transform: 'translate(-50%, -100%)', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-2)' }}>
            {p.y}
          </span>
        );
      })}
      {points.map((p, i) => (
        <span key={i} style={{ ...AXIS_LABEL_STYLE, left: `${(i + 0.5) * bw}%` }}>
          {p.x}
        </span>
      ))}
    </div>
  );
};

/** Two-series line/area chart on one shared y-axis (never dual-axis). */
export const LineChart: React.FC<{
  x: string[];
  series: Array<{ label: string; values: number[]; color: string; area?: boolean }>;
  height?: number;
}> = ({ x, series, height = 190 }) => {
  const [hoverI, setHoverI] = useState<number | null>(null);
  const allVals = series.flatMap((s) => s.values);
  const max = Math.max(...allVals, 1);
  const padBottomPx = 20;
  const padX = 2;
  const plotH = height - padBottomPx;
  const X = (i: number) => padX + (i / (x.length - 1)) * (100 - padX * 2);
  const Y = (v: number) => plotH - (v / max) * plotH;
  const labelEvery = Math.max(Math.ceil(x.length / 7), 1);

  return (
    <div style={{ position: 'relative', paddingBottom: padBottomPx }}>
      <svg width="100%" height={plotH} viewBox={`0 0 100 ${plotH}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={0} x2={100} y1={plotH * f} y2={plotH * f} className="chartgrid" vectorEffect="non-scaling-stroke" />
        ))}
        {series.map(
          (s, si) =>
            s.area && (
              <polygon
                key={si}
                points={`${X(0)},${Y(0)} ${s.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')} ${X(s.values.length - 1)},${Y(0)}`}
                fill={s.color}
                opacity={0.08}
              />
            )
        )}
        {series.map((s, si) => (
          <polyline
            key={si}
            points={s.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {hoverI !== null && (
          <line x1={X(hoverI)} x2={X(hoverI)} y1={0} y2={plotH} stroke="var(--ink-3)" strokeDasharray="2 2" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
        {series.map((s, si) =>
          s.values.map((v, i) => (
            <circle
              key={`${si}-${i}`}
              cx={X(i)}
              cy={Y(v)}
              r={hoverI === i ? 3.2 : 2.2}
              fill={s.color}
              stroke="var(--surface)"
              strokeWidth={1}
              onMouseEnter={() => setHoverI(i)}
              onMouseLeave={() => setHoverI(null)}
            >
              <title>{`${s.label} · ${x[i]}: ${v}`}</title>
            </circle>
          ))
        )}
      </svg>
      {x.map((label, i) =>
        i % labelEvery === 0 ? (
          <span key={i} style={{ ...AXIS_LABEL_STYLE, left: `${X(i)}%` }}>
            {label}
          </span>
        ) : null
      )}
    </div>
  );
};

/** Stacked vertical bar chart — one bar per x category, N status/identity
 * segments per bar, with a 2px surface gap between segments. */
export const StackedBarChart: React.FC<{
  x: string[];
  series: Array<{ label: string; values: number[]; color: string }>;
  height?: number;
}> = ({ x, series, height = 170 }) => {
  const totals = x.map((_, i) => series.reduce((a, s) => a + s.values[i], 0));
  const max = Math.max(...totals, 1);
  const padBottomPx = 20;
  const plotH = height - padBottomPx;
  const bw = 100 / x.length;

  return (
    <div style={{ position: 'relative', paddingBottom: padBottomPx }}>
      <svg width="100%" height={plotH} viewBox={`0 0 100 ${plotH}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={0} x2={100} y1={plotH * f} y2={plotH * f} className="chartgrid" vectorEffect="non-scaling-stroke" />
        ))}
        {x.map((label, i) => {
          const xPos = i * bw + bw * 0.18;
          const w = bw * 0.64;
          let yCursor = plotH;
          return (
            <g key={i}>
              {series.map((s, si) => {
                const v = s.values[i];
                const h = (v / max) * plotH;
                if (h <= 0) return null;
                const segH = Math.max(h - 1.2, 0);
                yCursor -= h;
                return (
                  <rect key={si} x={xPos} y={yCursor + 0.6} width={w} height={segH} fill={s.color}>
                    <title>{`${s.label} · ${label}: ${v}`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
      {x.map((label, i) => (
        <span key={i} style={{ ...AXIS_LABEL_STYLE, left: `${(i + 0.5) * bw}%` }}>
          {label}
        </span>
      ))}
    </div>
  );
};

export const ChartLegend: React.FC<{ items: Array<{ label: string; color: string; round?: boolean }> }> = ({ items }) => (
  <div className="chartlegend">
    {items.map((it, i) => (
      <span className="lg" key={i}>
        <span className={`sw ${it.round ? 'round' : ''}`} style={{ background: it.color }} />
        {it.label}
      </span>
    ))}
  </div>
);

// ---------- shared icon set + stat tile for the two dashboards ----------

export const MailIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const DocCheckIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);
export const ClockIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
export const TimerIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2h4" />
    <path d="M12 14 15 11" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);
export const TargetIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);
export const PersonIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);
export const AlarmIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    <path d="M12 9v4l2.5 2.5" />
    <path d="m5 4-2 2M19 4l2 2" />
  </svg>
);
export const CheckCircleIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

export const StatTile: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: string;
  up?: boolean;
  note?: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, iconBg, iconColor, label, value, delta, up, note, onClick }) => {
  const Tag: any = onClick ? 'button' : 'div';
  return (
    <Tag className="stattile" type={onClick ? 'button' : undefined} onClick={onClick}>
      <span className="sticon" style={{ background: iconBg, color: iconColor }}>{icon}</span>
      <span className="stbody">
        <span className="stlbl">{label}</span>
        <span className="stval">{value}</span>
        {delta && (
          <span className={`stdelta ${up === undefined ? '' : up ? 'up' : 'down'}`}>
            {up !== undefined && (up ? '↑' : '↓')} {delta}
          </span>
        )}
        {note && (typeof note === 'string' ? <span className="stdelta">{note}</span> : note)}
      </span>
    </Tag>
  );
};
