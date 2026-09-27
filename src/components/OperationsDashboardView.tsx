import React, { useMemo, useState } from 'react';
import { CaseItem, OpsTab, Task } from '../types';
import { DEPTS } from '../data';
import { computeDashboardMetrics } from './dashboardData';
import { Donut, BarChart, StackedBarChart, ChartLegend, StatTile, MailIcon, AlarmIcon, PersonIcon, CheckCircleIcon, ClockIcon, TimerIcon } from './charts';

interface OperationsDashboardViewProps {
  cases: CaseItem[];
  onDrillDown: (target: { ops: OpsTab; f?: string; status?: string; comm?: string; q?: string; dept?: string; case?: string }) => void;
}

type AttnTab = 'overdue' | 'unassigned' | 'awaiting' | 'blocked';

export const OperationsDashboardView: React.FC<OperationsDashboardViewProps> = ({ cases, onDrillDown }) => {
  const [range, setRange] = useState('today');
  const [dept, setDept] = useState('');
  const [attnTab, setAttnTab] = useState<AttnTab>('overdue');

  const filtered = useMemo(
    () => cases.filter((c) => !dept || c.categories.includes(dept) || c.tasks.some((t) => t.dept === dept)),
    [cases, dept]
  );
  const m = useMemo(() => computeDashboardMetrics(filtered), [filtered]);

  // Task rows enriched with their parent case, for the attention tables below.
  const enriched = useMemo(
    () => filtered.flatMap((c) => c.tasks.map((t) => ({ t, c }))),
    [filtered]
  );
  const openEnriched = enriched.filter((r) => r.t.status !== 'Done');

  const overdueRows = openEnriched.filter((r) => r.t.timing === 'Overdue');
  const unassignedRows = openEnriched.filter((r) => !r.t.assignee);
  const blockedRows = openEnriched.filter((r) => r.t.readiness === 'Waiting for Task' || r.t.readiness === 'Waiting for Customer');
  const awaitingRows = filtered
    .filter((c) => c.comm.state === 'Response Required' || c.comm.state === 'Waiting for Customer')
    .map((c) => ({ c }));

  const attnRows: { overdue: typeof overdueRows; unassigned: typeof unassignedRows; blocked: typeof blockedRows } & Record<string, unknown> = {
    overdue: overdueRows,
    unassigned: unassignedRows,
    blocked: blockedRows
  } as any;

  return (
    <>
      <div className="page-head" style={{ alignItems: 'center' }}>
        <div>
          <h1>Operations Dashboard</h1>
          <p>Real-time view of customer requests and operational tasks.</p>
        </div>
        <div className="spacer" />
        <select className="sel" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This week</option>
        </select>
        <select className={`sel ${dept ? 'on' : ''}`} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {DEPTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="stattiles">
        <StatTile
          icon={<MailIcon />}
          iconBg="var(--chart-blue-soft)"
          iconColor="var(--chart-blue)"
          label="Open Requests"
          value={m.openRequests}
          onClick={() => onDrillDown({ ops: 'cases' })}
        />
        <StatTile
          icon={<AlarmIcon />}
          iconBg="var(--red-soft)"
          iconColor="var(--red)"
          label="Overdue Tasks"
          value={m.overdueTasks}
          onClick={() => onDrillDown({ ops: 'work', f: 'Overdue' })}
        />
        <StatTile
          icon={<PersonIcon />}
          iconBg="var(--amber-soft)"
          iconColor="var(--amber)"
          label="Unassigned Tasks"
          value={m.unassignedTasks}
          onClick={() => onDrillDown({ ops: 'work' })}
        />
        <StatTile
          icon={<CheckCircleIcon />}
          iconBg="var(--green-soft)"
          iconColor="var(--green)"
          label="Tasks Completed Today"
          value={m.tasksCompletedToday}
          onClick={() => onDrillDown({ ops: 'work' })}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr) minmax(0,1fr)' }}>
        <div className="card">
          <div className="card-head">
            <h3>Tasks by Status</h3>
          </div>
          <div className="card-body">
            {m.taskStatusSlices.length === 0 ? (
              <div className="muted small">No open tasks match the current filters.</div>
            ) : (
              <Donut
                slices={m.taskStatusSlices}
                centerValue={m.totalTasks}
                centerLabel="Total tasks"
                size={112}
                onSelect={(label) => onDrillDown({ ops: 'work', f: label })}
              />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Request Volume</h3>
            <div className="spacer" />
            <span className="tiny muted">Last 8 days</span>
          </div>
          <div className="card-body">
            <BarChart
              points={m.volumeDays.map((d, i) => ({ x: d, y: m.volumeReceived[i] }))}
              color="var(--chart-blue)"
              onSelect={() => onDrillDown({ ops: 'cases' })}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Workload by Department</h3>
            <div className="spacer" />
            <ChartLegend items={[{ label: 'Open', color: 'var(--chart-blue)' }, { label: 'Overdue', color: 'var(--red)' }]} />
          </div>
          <div className="card-body">
            {m.deptRows.length === 0 ? (
              <div className="muted small">No open department tasks match the current filters.</div>
            ) : (
              <div className="bars">
                {m.deptRows.map((r) => (
                  <div className="bar" key={r.dept} onClick={() => onDrillDown({ ops: 'work', dept: r.dept })} style={{ cursor: 'pointer' }}>
                    <span className="ell">{r.dept}</span>
                    <span className="track">
                      <i style={{ width: `${((r.open - r.overdue) / r.open) * 100}%`, background: 'var(--chart-blue)' }} />
                      <i style={{ width: `${(r.overdue / r.open) * 100}%`, background: 'var(--red)' }} />
                    </span>
                    <span className="num tiny muted">{r.open}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h3>Work Requiring Attention</h3>
          <div className="spacer" />
          <button className="btn btn-sm" onClick={() => onDrillDown({ ops: 'work' })}>View All →</button>
        </div>
        <div className="segmented" style={{ margin: '0 16px 12px' }}>
          <button aria-pressed={attnTab === 'overdue'} onClick={() => setAttnTab('overdue')}>Overdue Tasks {overdueRows.length}</button>
          <button aria-pressed={attnTab === 'unassigned'} onClick={() => setAttnTab('unassigned')}>Unassigned Tasks {unassignedRows.length}</button>
          <button aria-pressed={attnTab === 'awaiting'} onClick={() => setAttnTab('awaiting')}>Awaiting Response {awaitingRows.length}</button>
          <button aria-pressed={attnTab === 'blocked'} onClick={() => setAttnTab('blocked')}>Blocked Tasks {blockedRows.length}</button>
        </div>

        <div className="tablescroll">
          {attnTab === 'awaiting' ? (
            <table className="t">
              <thead>
                <tr>
                  <th>REQUEST</th>
                  <th>CUSTOMER</th>
                  <th>COMMUNICATION STATE</th>
                  <th>LAST ACTIVITY</th>
                </tr>
              </thead>
              <tbody>
                {awaitingRows.length === 0 ? (
                  <tr><td colSpan={4} className="muted small" style={{ textAlign: 'center', padding: 18 }}>Nothing is waiting on a reply right now.</td></tr>
                ) : (
                  awaitingRows.slice(0, 10).map(({ c }) => (
                    <tr key={c.id} onClick={() => onDrillDown({ ops: 'cases', case: c.id })}>
                      <td>{c.title}</td>
                      <td>{c.customer}</td>
                      <td><span className="chip amber">{c.comm.state}</span></td>
                      <td className="nowrap muted tiny">{c.lastActivity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="t">
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>CUSTOMER</th>
                  <th>DEPARTMENT</th>
                  <th>OWNER</th>
                  <th>DUE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {(attnRows[attnTab] as Array<{ t: Task; c: CaseItem }>).length === 0 ? (
                  <tr><td colSpan={6} className="muted small" style={{ textAlign: 'center', padding: 18 }}>Nothing here right now.</td></tr>
                ) : (
                  (attnRows[attnTab] as Array<{ t: Task; c: CaseItem }>).slice(0, 10).map(({ t, c }) => (
                    <tr key={t.id + c.id} onClick={() => onDrillDown({ ops: 'work' })}>
                      <td>{t.title}</td>
                      <td>{c.customer}</td>
                      <td><span className="chip plain tiny">{t.dept}</span></td>
                      <td>{t.assignee || <span className="muted">Unassigned</span>}</td>
                      <td className="nowrap">{t.due}</td>
                      <td>
                        <span className={`chip tiny ${t.timing === 'Overdue' ? 'red' : t.readiness === 'Ready' ? 'blue' : 'amber'}`}>
                          {t.timing === 'Overdue' ? 'Overdue' : t.readiness}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', marginTop: 14 }}>
        <div className="card">
          <div className="card-head">
            <h3>Response & Processing Performance</h3>
          </div>
          <div className="card-body">
            <div className="stattiles" style={{ marginBottom: 0, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
              <StatTile icon={<ClockIcon />} iconBg="var(--chart-blue-soft)" iconColor="var(--chart-blue)" label="Avg. First Response Time" value="2h 15m" note="Illustrative" />
              <StatTile icon={<TimerIcon />} iconBg="var(--amber-soft)" iconColor="var(--amber)" label="Avg. Processing Time" value="1d 6h" note="Illustrative" />
              <StatTile icon={<CheckCircleIcon />} iconBg="var(--green-soft)" iconColor="var(--green)" label="Completion Rate" note="Share of requests marked Completed — no SLA target is configured to measure 'within target'" value={`${m.completedPct}%`} onClick={() => onDrillDown({ ops: 'cases', status: 'Completed' })} />
              <StatTile icon={<MailIcon />} iconBg="var(--violet-soft)" iconColor="var(--violet)" label="Awaiting First Response" value={awaitingRows.length} onClick={() => onDrillDown({ ops: 'cases', comm: 'pending' })} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Task Completion Trend</h3>
            <div className="spacer" />
            <ChartLegend items={[{ label: 'On Time', color: 'var(--green)' }, { label: 'Delayed', color: 'var(--red)' }]} />
          </div>
          <div className="card-body">
            <StackedBarChart
              x={m.taskDays}
              series={[
                { label: 'On Time', values: m.onTimeDone, color: 'var(--green)' },
                { label: 'Delayed', values: m.delayedDone, color: 'var(--red)' }
              ]}
            />
          </div>
        </div>
      </div>

      {m.topBottlenecks.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head">
            <h3>Top Bottlenecks</h3>
            <div className="spacer" />
            <span className="tiny muted">What open tasks are waiting on, most common first</span>
          </div>
          <div className="tablescroll">
            <table className="t">
              <thead>
                <tr>
                  <th>#</th>
                  <th>WAITING ON</th>
                  <th>LONGEST OVERDUE BY</th>
                  <th>OPEN TASKS</th>
                </tr>
              </thead>
              <tbody>
                {m.topBottlenecks.map((b, i) => (
                  <tr key={b.step} onClick={() => onDrillDown({ ops: 'work' })}>
                    <td><span className={`chip tiny ${i === 0 ? 'red' : i < 2 ? 'amber' : 'plain'}`}>{i + 1}</span></td>
                    <td>{b.step}</td>
                    <td className="nowrap">{b.avgWait}</td>
                    <td className="num">{b.open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="note" style={{ marginTop: 14 }}>
        Every figure above is computed live from the current cases and tasks, except Avg. First Response Time and Avg.
        Processing Time, which stay illustrative until this prototype's data carries real event timestamps.
      </div>
    </>
  );
};
