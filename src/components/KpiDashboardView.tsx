import React, { useMemo, useState } from 'react';
import { CaseItem, OpsTab } from '../types';
import { DEPTS, CLASSIFICATIONS } from '../data';
import { computeKpiMetrics, buildKpiCsv, formatDuration } from './dashboardData';
import { Donut, HBarList, LineChart, ChartLegend, StatTile, MailIcon, DocCheckIcon, ClockIcon, TimerIcon, TargetIcon } from './charts';

interface KpiDashboardViewProps {
  cases: CaseItem[];
  onDrillDown: (target: { ops: OpsTab; status?: string; classification?: string; comm?: string; q?: string; dept?: string; case?: string }) => void;
  toast?: (text: string, kind?: string) => void;
}

const InfoTip: React.FC<{ text: string }> = ({ text }) => (
  <span
    title={text}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 13,
      height: 13,
      borderRadius: '50%',
      border: '1px solid var(--ink-3)',
      color: 'var(--ink-3)',
      fontSize: 9.5,
      fontWeight: 700,
      marginLeft: 4,
      cursor: 'help',
      flexShrink: 0
    }}
  >
    i
  </span>
);

/** Plain-count delta — a neutral up/down arrow with no colour judgement,
 * because "more requests" or "more completions" isn't unambiguously good or
 * bad on its own (see spec §11: don't imply a value judgement you haven't
 * agreed on). */
const CountDelta: React.FC<{ current: number; previous: number | null; pctChange: number | null; periodLabel: string }> = ({
  previous,
  pctChange,
  periodLabel
}) => {
  if (previous === null) return <span className="stdelta">No data for the previous {periodLabel} to compare</span>;
  if (pctChange === null) return <span className="stdelta">Previous period was 0 — % change not meaningful</span>;
  return (
    <span className="stdelta">
      {pctChange > 0 ? '↑' : pctChange < 0 ? '↓' : '–'} {Math.abs(pctChange)}% vs previous {periodLabel}
    </span>
  );
};

/** Time-metric delta — a decrease IS the agreed-on improvement direction for
 * response/processing time, so colour is meaningful here (spec §11). */
const TimeDelta: React.FC<{ pctChange: number | null; periodLabel: string; n: number }> = ({ pctChange, periodLabel, n }) => {
  if (n === 0) return <span className="stdelta">Insufficient data</span>;
  if (pctChange === null) return <span className="stdelta">No prior-period comparison available</span>;
  const improved = pctChange < 0;
  return (
    <span className={`stdelta ${pctChange === 0 ? '' : improved ? 'up' : 'down'}`}>
      {pctChange > 0 ? '↑' : pctChange < 0 ? '↓' : '–'} {Math.abs(pctChange)}% vs previous {periodLabel}
    </span>
  );
};

export const KpiDashboardView: React.FC<KpiDashboardViewProps> = ({ cases, onDrillDown, toast }) => {
  const [periodDays, setPeriodDays] = useState(30);
  const [dept, setDept] = useState('');
  const [type, setType] = useState('');

  const requestTypes = useMemo(() => {
    const known = new Set<string>(CLASSIFICATIONS);
    cases.forEach((c) => known.add(c.classification || 'Unclassified'));
    return Array.from(known);
  }, [cases]);

  const m = useMemo(() => computeKpiMetrics(cases, { periodDays, dept: dept || undefined, type: type || undefined }), [
    cases,
    periodDays,
    dept,
    type
  ]);

  const periodLabel = periodDays === 7 ? '7 days' : periodDays === 30 ? '30 days' : 'quarter';
  const hasFilters = dept || type || periodDays !== 30;

  const resetFilters = () => {
    setPeriodDays(30);
    setDept('');
    setType('');
  };

  const exportReport = () => {
    const csv = buildKpiCsv(m);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi-dashboard_${m.reportingLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast?.(`Exported ${m.totalInScope} requests for ${m.reportingLabel}.`, 'ok');
  };

  return (
    <>
      <div className="page-head" style={{ alignItems: 'center' }}>
        <div>
          <h1>KPI Dashboard</h1>
          <p>Key performance indicators for operational efficiency and customer service.</p>
        </div>
        <div className="spacer" />
        <select className="sel" value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>This quarter</option>
        </select>
        <select className={`sel ${dept ? 'on' : ''}`} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {DEPTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className={`sel ${type ? 'on' : ''}`} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All request types</option>
          {requestTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {hasFilters && (
          <button type="button" className="btn btn-sm" onClick={resetFilters}>
            Reset filters
          </button>
        )}
        <button type="button" className="btn btn-sm" onClick={exportReport}>
          ⬇ Export report
        </button>
      </div>

      <div className="filterbar" style={{ marginTop: -6, marginBottom: 14 }}>
        <span className="small muted">
          <b className="num" style={{ color: 'var(--ink)' }}>{m.totalInScope}</b> requests in scope · {m.reportingLabel || 'All requests'}
        </span>
      </div>

      {m.totalInScope === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>No requests match these filters</div>
          <p className="muted small" style={{ marginTop: 4 }}>Try a wider date range, or reset the department and request-type filters.</p>
          <button type="button" className="btn btn-sm btn-primary" style={{ marginTop: 10 }} onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="stattiles">
            <StatTile
              icon={<MailIcon />}
              iconBg="var(--chart-blue-soft)"
              iconColor="var(--chart-blue)"
              label={<>Total Requests<InfoTip text="Unique customer requests received in the selected period." /></>}
              value={m.totalRequests.current}
              onClick={() => onDrillDown({ ops: 'cases' })}
              note={<CountDelta {...m.totalRequests} periodLabel={periodLabel} />}
            />
            <StatTile
              icon={<DocCheckIcon />}
              iconBg="var(--green-soft)"
              iconColor="var(--green)"
              label={<>Completed Requests<InfoTip text="Requests whose recorded lifecycle status is Completed — not merely one with a completed task." /></>}
              value={m.completedRequests.current}
              onClick={() => onDrillDown({ ops: 'cases', status: 'Completed' })}
              note={<CountDelta {...m.completedRequests} periodLabel={periodLabel} />}
            />
            <StatTile
              icon={<ClockIcon />}
              iconBg="var(--blue-soft)"
              iconColor="var(--blue)"
              label={<>Avg. First Response Time<InfoTip text="Elapsed time between the first inbound message and the first logged outbound reply, from the case's own conversation log." /></>}
              value={m.firstResponse.n > 0 ? formatDuration(m.firstResponse.avgMin) : 'N/A'}
              note={<TimeDelta pctChange={m.firstResponse.pctChange} periodLabel={periodLabel} n={m.firstResponse.n} />}
            />
            <StatTile
              icon={<TimerIcon />}
              iconBg="var(--amber-soft)"
              iconColor="var(--amber)"
              label={<>Avg. Processing Time<InfoTip text="Elapsed time between a request being received and it being marked Completed. Requests without both a valid received and completion timestamp are excluded." /></>}
              value={m.processing.n > 0 ? formatDuration(m.processing.avgMin) : 'N/A'}
              note={<TimeDelta pctChange={m.processing.pctChange} periodLabel={periodLabel} n={m.processing.n} />}
            />
            <StatTile
              icon={<TargetIcon />}
              iconBg="var(--surface-2)"
              iconColor="var(--ink-3)"
              label={<>Completed Within Target<InfoTip text="Percentage of completed requests finished within their applicable SLA target. This app has no configured per-classification targets yet." /></>}
              value={<span style={{ fontSize: 15, fontWeight: 700 }}>Target not configured</span>}
            />
          </div>

          <div className="small muted" style={{ marginTop: -6, marginBottom: 14 }}>
            {m.firstResponse.excluded > 0 && (
              <span>{m.firstResponse.excluded} of {m.totalInScope} requests excluded from response time (no logged reply). </span>
            )}
            {m.processing.excluded > 0 && (
              <span>{m.processing.excluded} completed requests excluded from processing time (unparseable timestamps).</span>
            )}
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)' }}>
            <div className="card">
              <div className="card-head">
                <h3>Request Status Distribution</h3>
              </div>
              <div className="card-body">
                <Donut
                  slices={m.statusSlices}
                  centerValue={m.totalInScope}
                  centerLabel="Total requests"
                  onSelect={(label) => onDrillDown({ ops: 'cases', status: label })}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h3>Requests by Type</h3>
                <div className="spacer" />
                <button className="btn btn-sm" onClick={() => onDrillDown({ ops: 'cases' })}>View Details →</button>
              </div>
              <div className="card-body">
                <HBarList
                  rows={m.requestTypeRows.map((r) => ({ ...r, display: `${r.value} (${r.pct}%)` }))}
                  onSelect={(label) => onDrillDown({ ops: 'cases', classification: label })}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="charthead card-head">
              <h3>Request Volume Trend</h3>
              <div className="spacer" />
              <ChartLegend items={[{ label: 'Received', color: 'var(--chart-blue)' }, { label: 'Completed', color: 'var(--green)' }]} />
            </div>
            <div className="card-body">
              {m.volumeDays.length > 1 ? (
                <LineChart
                  x={m.volumeDays}
                  series={[
                    { label: 'Received', values: m.volumeReceived, color: 'var(--chart-blue)', area: true },
                    { label: 'Completed', values: m.volumeCompleted, color: 'var(--green)' }
                  ]}
                />
              ) : (
                <div className="muted small">Not enough dated requests to plot a trend.</div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-head">
              <h3>Average Tasks per Request by Type</h3>
              <div className="spacer" />
              <span className="tiny muted">A proxy for handling effort, not a duration measurement</span>
            </div>
            <div className="card-body">
              <div className="hbarlist">
                {m.avgTasksByType.map((r) => (
                  <div className="hbarrow" key={r.label} title={`${r.requests} requests · ${r.totalTasks} linked tasks`}>
                    <span className="ell" title={r.label}>{r.label}</span>
                    <span className="hbtrack">
                      <i style={{ width: `${Math.min(((r.value ?? 0) / Math.max(...m.avgTasksByType.map((x) => x.value ?? 0), 1)) * 100, 100)}%`, background: r.color }} />
                    </span>
                    <span className="hbval">{r.value !== null ? `${r.value} tasks` : 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {m.bottlenecks.length > 0 && (
            <div className="card" style={{ marginTop: 14 }}>
              <div className="card-head">
                <h3>Operational Bottlenecks</h3>
                <div className="spacer" />
                <span className="tiny muted">Where open tasks are accumulating, most first</span>
              </div>
              <div className="tablescroll">
                <table className="t">
                  <thead>
                    <tr>
                      <th>WAITING ON</th>
                      <th>DEPARTMENT</th>
                      <th>OPEN TASKS</th>
                      <th>OLDEST OUTSTANDING</th>
                      <th>LONGEST OVERDUE BY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.bottlenecks.map((b) => (
                      <tr key={b.stage} onClick={() => onDrillDown({ ops: 'work' })}>
                        <td>{b.stage}</td>
                        <td><span className="chip plain tiny">{b.department}</span></td>
                        <td className="num">{b.openTasks}</td>
                        <td>{b.oldest ? `${b.oldest.title} (due ${b.oldest.due})` : '—'}</td>
                        <td>{b.longestOverdueMin !== null ? formatDuration(b.longestOverdueMin) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="note" style={{ marginTop: 14 }}>
        Every figure above is computed from the current requests, using their own recorded status, conversation log
        and task data — request counts, status, type and task-effort figures always reflect the live dataset. First
        Response and Processing Time exclude any request whose timestamps don't parse (shown as "excluded" above).
        Completed Within Target reads "Target not configured" because this app has no per-classification SLA target
        defined yet; it isn't a placeholder for a number we chose not to show. All times are calendar time, not
        working hours.
      </div>
    </>
  );
};
