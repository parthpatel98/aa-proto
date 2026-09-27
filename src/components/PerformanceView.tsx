import React, { useState } from 'react';
import { CaseItem, OpsTab } from '../types';
import { DEPTS, CUSTOMERS, CASE_CLASSES } from '../data';

interface PerformanceViewProps {
  cases: CaseItem[];
  onDrillDown: (target: { ops: OpsTab; f?: string; q?: string; dept?: string; case?: string }) => void;
}

/** Detailed, target-tracked KPI tiles — kept from the previous Insights section
 * unchanged; the KPI Dashboard and Operations Dashboard cover the at-a-glance
 * view, this covers per-metric target tracking with trend sparklines. */
export const PerformanceView: React.FC<PerformanceViewProps> = ({ onDrillDown }) => {
  const [period, setPeriod] = useState('30d');
  const [dept, setDept] = useState('');
  const [customer, setCustomer] = useState('');
  const [cls, setCls] = useState('');

  const renderSparkline = (
    pts: number[],
    target: number,
    color: string,
    area: boolean = false,
    width: number = 300,
    height: number = 46
  ) => {
    const mn = Math.min(...pts, target);
    const mx = Math.max(...pts, target);
    const r = mx - mn || 1;
    const X = (i: number) => 3 + (i / (pts.length - 1)) * (width - 6);
    const Y = (v: number) => height - 4 - ((v - mn) / r) * (height - 9);
    const pointsStr = pts.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');

    return (
      <svg
        className="spark"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      >
        <line
          x1={3}
          x2={width - 3}
          y1={Y(target).toFixed(1)}
          y2={Y(target).toFixed(1)}
          stroke="var(--ink-3)"
          strokeDasharray="3 3"
          strokeWidth="1"
          opacity="0.45"
          vectorEffect="non-scaling-stroke"
        />
        {area && (
          <polygon
            points={`${X(0).toFixed(1)},${height} ${pointsStr} ${X(pts.length - 1).toFixed(1)},${height}`}
            fill="var(--blue)"
            opacity="0.08"
          />
        )}
        <polyline
          points={pointsStr}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={X(pts.length - 1).toFixed(1)}
          cy={Y(pts[pts.length - 1]).toFixed(1)}
          r="3.2"
          fill={color}
          stroke="#fff"
          strokeWidth="1.2"
        />
      </svg>
    );
  };

  return (
    <>
      <div className="page-head" style={{ alignItems: 'center' }}>
        <div>
          <h1>Performance</h1>
        </div>
        <div className="spacer" />
        <span className="small muted">11 of 26 KPIs shown</span>
      </div>

      <div className="filterbar">
        <select className="sel" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="30d">Last 30 days</option>
          <option value="7d">Last 7 days</option>
          <option value="q">This quarter</option>
        </select>
        <select className={`sel ${dept ? 'on' : ''}`} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {DEPTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className={`sel ${customer ? 'on' : ''}`} value={customer} onChange={(e) => setCustomer(e.target.value)}>
          <option value="">All customers</option>
          {CUSTOMERS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={`sel ${cls ? 'on' : ''}`} value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="">All case classes</option>
          {CASE_CLASSES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <span className="small muted" style={{ marginLeft: 'auto' }}>
          <b className="num" style={{ color: 'var(--ink)' }}>214</b> cases · Last 30 days · all departments · all customers · all case classes
        </span>
      </div>

      {/* Overall Health */}
      <div className="card phealth" style={{ marginTop: 14 }}>
        <div className="phl">
          <div className="label">Overall health · Last 30 days</div>
          <div className="phv">
            <span className="big">7</span>
            <span>of 9 KPIs on target</span>
          </div>
          <div className="phverdict warn">Mostly on track</div>
          <div className="phbar">
            <i className="good" style={{ width: '78%' }} />
            <i className="warn" style={{ width: '11%' }} />
            <i className="bad" style={{ width: '11%' }} />
          </div>
          <div className="phleg">
            <span><i className="good" />7 on target</span>
            <span><i className="warn" />1 watch</span>
            <span><i className="bad" />1 off target</span>
          </div>
          <div className="tiny muted" style={{ marginTop: 8 }}>
            4 improving · 1 getting worse vs previous 30 days
          </div>
        </div>

        <div className="phc">
          <div className="label">Needs attention</div>
          <div className="phrow" onClick={() => onDrillDown({ ops: 'inbox' })}>
            <span className="phdot bad" />
            <span className="ell" style={{ flex: 1 }}>AI processing failures</span>
            <b className="redt num">2.4%</b>
            <span className="tiny muted num" style={{ width: 92, textAlign: 'right' }}>target ≤ 2%</span>
          </div>
          <div className="phrow" onClick={() => onDrillDown({ ops: 'cases' })}>
            <span className="phdot warn" />
            <span className="ell" style={{ flex: 1 }}>Cases with a late customer update</span>
            <b className="ambt num">6</b>
            <span className="tiny muted num" style={{ width: 92, textAlign: 'right' }}>target ≤ 4</span>
          </div>
        </div>

        <div className="phc">
          <div className="label">Improving most</div>
          <div className="phrow" onClick={() => onDrillDown({ ops: 'work' })}>
            <span className="phdot good" />
            <span className="ell" style={{ flex: 1 }}>Tasks completed late</span>
            <b className="num">7%</b>
            <span style={{ width: 92, textAlign: 'right' }}><span className="kd up">▼ 1 pts</span></span>
          </div>
          <div className="phrow" onClick={() => onDrillDown({ ops: 'cases' })}>
            <span className="phdot good" />
            <span className="ell" style={{ flex: 1 }}>Extracted fields corrected</span>
            <b className="num">7%</b>
            <span style={{ width: 92, textAlign: 'right' }}><span className="kd up">▼ 1 pts</span></span>
          </div>
          <div className="phrow" onClick={() => onDrillDown({ ops: 'cases' })}>
            <span className="phdot good" />
            <span className="ell" style={{ flex: 1 }}>Median case completion</span>
            <b className="num">5 h 12 min</b>
            <span style={{ width: 92, textAlign: 'right' }}><span className="kd up">▼ 20 min</span></span>
          </div>
          <div className="phrow" onClick={() => onDrillDown({ ops: 'cases' })}>
            <span className="phdot good" />
            <span className="ell" style={{ flex: 1 }}>Classification corrected by a person</span>
            <b className="num">11%</b>
            <span style={{ width: 92, textAlign: 'right' }}><span className="kd up">▼ 1 pts</span></span>
          </div>
        </div>
      </div>

      {/* Group 1: CUSTOMER */}
      <div className="pgroup" style={{ marginTop: 20 }}>
        <div className="pghead">
          <h3>CUSTOMER</h3>
          <span className="tiny muted">how quickly customers hear from us</span>
          <div className="spacer" />
          <span className="gmini"><i className="phdot good" />2 on target</span>
          <span className="gmini"><i className="phdot warn" />1 watch</span>
        </div>
        <div className="ktiles ptiles">
          <div className="ktile ptile good" onClick={() => onDrillDown({ ops: 'cases' })}>
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">First meaningful response</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">42 min</div>
              <div className="kt">Target ≤ 1 h</div>
              <div className="spacer" />
              <span className="kd flat">No change</span>
            </div>
            {renderSparkline([46, 45, 43, 44, 42, 42, 42], 60, 'var(--green)', false, 240, 34)}
            <div className="kdesc">Median across 214 cases</div>
          </div>

          <div className="ktile ptile warn" onClick={() => onDrillDown({ ops: 'cases' })}>
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Cases with a late customer update</div>
              <div className="spacer" />
              <span className="chip amber kst">Watch</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">6</div>
              <div className="kt">Target ≤ 4</div>
              <div className="spacer" />
              <span className="kd flat">No change</span>
            </div>
            {renderSparkline([6, 5, 7, 6, 6, 6, 6], 4, 'var(--amber)', false, 240, 34)}
            <div className="kdesc">Promised timing moved without telling the customer</div>
          </div>

          <div className="ktile ptile good" onClick={() => onDrillDown({ ops: 'cases' })}>
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Requests needing clarification</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">31%</div>
              <div className="kt">Target ≤ 35%</div>
              <div className="spacer" />
              <span className="kd up">▲ 2 pts</span>
            </div>
            {renderSparkline([29, 30, 32, 33, 30, 31, 31], 35, 'var(--green)', false, 240, 34)}
            <div className="kdesc">A direct measure of incoming request quality</div>
          </div>
        </div>
      </div>

      {/* Group 2: OPERATIONAL */}
      <div className="pgroup" style={{ marginTop: 20 }}>
        <div className="pghead">
          <h3>OPERATIONAL</h3>
          <span className="tiny muted">how the work itself runs</span>
          <div className="spacer" />
          <span className="gmini"><i className="phdot good" />2 on target</span>
        </div>
        <div className="ktiles ptiles">
          <div className="ktile ptile good" onClick={() => onDrillDown({ ops: 'cases' })}>
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Median case completion</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">5 h 12 min</div>
              <div className="kt">Target ≤ 6 h</div>
              <div className="spacer" />
              <span className="kd up">▼ 20 min</span>
            </div>
            {renderSparkline([340, 330, 325, 320, 315, 320, 312], 360, 'var(--green)', false, 240, 34)}
            <div className="kdesc">Excluding time waiting for the customer</div>
          </div>

          <div className="ktile ptile good" onClick={() => onDrillDown({ ops: 'work' })}>
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Tasks completed late</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">7%</div>
              <div className="kt">Target ≤ 8%</div>
              <div className="spacer" />
              <span className="kd up">▼ 1 pts</span>
            </div>
            {renderSparkline([10, 9, 8, 9, 8, 7, 7], 8, 'var(--green)', false, 240, 34)}
            <div className="kdesc">Down from 11% in the previous 30 days</div>
          </div>

          <div className="ktile ptile info">
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Tasks per case</div>
              <div className="spacer" />
              <span className="chip plain kst">Context</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">4.6</div>
              <div className="kt">For context</div>
              <div className="spacer" />
              <span className="kd flat">▼ 0.3</span>
            </div>
            {renderSparkline([5.0, 4.8, 4.7, 4.8, 4.6, 4.6, 4.6], 5.0, 'var(--ink-3)', false, 240, 34)}
            <div className="kdesc">Higher on multi-department cases</div>
          </div>

          <div className="ktile ptile info">
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Median wait for a customer reply</div>
              <div className="spacer" />
              <span className="chip plain kst">Context</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">2 h 40 min</div>
              <div className="kt">For context</div>
              <div className="spacer" />
              <span className="kd flat">▼ 5 min</span>
            </div>
            {renderSparkline([170, 165, 168, 162, 160, 165, 160], 180, 'var(--ink-3)', false, 240, 34)}
            <div className="kdesc">Measured separately from our own handling time</div>
          </div>
        </div>
      </div>

      {/* Group 3: AUTOMATION */}
      <div className="pgroup" style={{ marginTop: 20 }}>
        <div className="pghead">
          <h3>AUTOMATION</h3>
          <span className="tiny muted">how much the AI actually carries</span>
          <div className="spacer" />
          <span className="gmini"><i className="phdot good" />3 on target</span>
          <span className="gmini"><i className="phdot bad" />1 off target</span>
        </div>
        <div className="ktiles ptiles">
          <div className="ktile ptile good">
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Classifications accepted unchanged</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">89%</div>
              <div className="kt">Target ≥ 88%</div>
              <div className="spacer" />
              <span className="kd up">▲ 4 pts</span>
            </div>
            {renderSparkline([84, 85, 87, 88, 87, 88, 89], 88, 'var(--green)', false, 240, 34)}
            <div className="kdesc">Corrections are recorded to improve this</div>
          </div>

          <div className="ktile ptile good">
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Classification corrected by a person</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">11%</div>
              <div className="kt">Target ≤ 12%</div>
              <div className="spacer" />
              <span className="kd up">▼ 1 pts</span>
            </div>
            {renderSparkline([14, 13, 12, 13, 12, 11, 11], 12, 'var(--green)', false, 240, 34)}
            <div className="kdesc">Mostly forwarded threads and unknown senders</div>
          </div>

          <div className="ktile ptile good">
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">Extracted fields corrected</div>
              <div className="spacer" />
              <span className="chip green kst">On target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">7%</div>
              <div className="kt">Target ≤ 8%</div>
              <div className="spacer" />
              <span className="kd up">▼ 1 pts</span>
            </div>
            {renderSparkline([9, 8, 8, 7, 7, 7, 7], 8, 'var(--green)', false, 240, 34)}
            <div className="kdesc">Highest on scanned attachments</div>
          </div>

          <div className="ktile ptile bad" onClick={() => onDrillDown({ ops: 'inbox' })}>
            <button className="kpix">✕</button>
            <div className="row" style={{ gap: 8 }}>
              <div className="kn">AI processing failures</div>
              <div className="spacer" />
              <span className="chip red kst">Off target</span>
            </div>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end', margin: '6px 0' }}>
              <div className="kv">2.4%</div>
              <div className="kt">Target ≤ 2%</div>
              <div className="spacer" />
              <span className="kd down">▼ 0.1 pts</span>
            </div>
            {renderSparkline([2.8, 2.6, 2.5, 2.6, 2.5, 2.4, 2.4], 2.0, 'var(--red)', false, 240, 34)}
            <div className="kdesc">Every one stays visible in the inbox</div>
          </div>
        </div>
      </div>

      <div className="note" style={{ marginTop: 14 }}>
        These figures, targets and trends are illustrative demo values. Each tile shows the value, its target (dashed line), status and the last seven periods. Click a tile to open the work behind it.
      </div>
    </>
  );
};
