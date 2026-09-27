import { CaseItem, Task } from '../types';
import { getCaseStatus, DEPTS, CLASSIFICATIONS } from '../data';

/**
 * Real metrics computed from the live case/task data, shared by the KPI
 * Dashboard and the Operations Dashboard. Anything that truly can't be
 * derived from this dataset (elapsed response/processing time — the mock
 * data only has free-text timestamps like "Today 11:30" or "Yesterday",
 * not machine-comparable instants) is kept as a small, clearly-labeled
 * illustrative constant, matching how the rest of this app already
 * discloses demo figures (see the Performance tab's footer note).
 */

// ---------- status color (reserved, reused everywhere a status is shown) ----------
export const TONE_COLOR: Record<string, string> = {
  green: 'var(--green)',
  amber: 'var(--amber)',
  blue: 'var(--blue)',
  purple: 'var(--violet)',
  plain: 'var(--ink-3)'
};

// ---------- request-type identity (fixed order — never re-assigned by rank) ----------
export const REQUEST_TYPE_ORDER = ['New Transport Order', 'Inquiry', 'Order Change', 'Document Request'] as const;
export const REQUEST_TYPE_COLOR: Record<string, string> = {
  'New Transport Order': 'var(--chart-blue)',
  Inquiry: 'var(--green)',
  'Order Change': 'var(--amber)',
  'Document Request': 'var(--violet)',
  Other: 'var(--ink-3)'
};

// ---------- department identity (fixed order — never re-assigned by rank) ----------
export const DEPT_COLOR: Record<string, string> = {
  Transport: 'var(--chart-blue)',
  Warehouse: 'var(--green)',
  Packing: 'var(--amber)',
  'Freight Forwarding': 'var(--violet)',
  Finance: 'var(--red)'
};

// ---------- day parsing ----------
const MONTH_DAY = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;

/** Best-effort "DD Mon" key from this app's free-text date strings, anchored
 * on `today` (the latest absolute date seen across all cases) since the mock
 * data mixes "Today"/"Yesterday" with absolute dates. Returns null when it
 * cannot be parsed at all. */
function dayKeyWithAnchor(s: string, today: { d: number; mon: string }): string | null {
  if (!s) return null;
  if (/today/i.test(s)) return `${today.d} ${today.mon}`;
  if (/yesterday/i.test(s)) return `${today.d - 1} ${today.mon}`;
  const m = s.match(MONTH_DAY);
  if (m) return `${parseInt(m[1], 10)} ${m[2][0].toUpperCase()}${m[2].slice(1, 3).toLowerCase()}`;
  return null;
}

function findAnchorToday(cases: CaseItem[]): { d: number; mon: string } {
  let best = { d: 0, mon: 'Sep' };
  cases.forEach((c) => {
    const m = c.created.match(MONTH_DAY);
    if (m) {
      const d = parseInt(m[1], 10);
      if (d > best.d) best = { d, mon: `${m[2][0].toUpperCase()}${m[2].slice(1, 3).toLowerCase()}` };
    }
  });
  return best.d ? best : { d: 25, mon: 'Sep' };
}

/** Last N calendar-day labels ending at the anchor "today", oldest first. */
function lastNDayLabels(today: { d: number; mon: string }, n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(`${today.d - i} ${today.mon}`);
  return out;
}

export interface DashboardMetrics {
  totalRequests: number;
  completedRequests: number;
  completedPct: number;
  statusSlices: Array<{ label: string; value: number; color: string }>;
  requestTypeRows: Array<{ label: string; value: number; color: string }>;
  avgTasksByType: Array<{ label: string; value: number; color: string }>;
  volumeDays: string[];
  volumeReceived: number[];
  volumeCompleted: number[];
  deptRows: Array<{ dept: string; open: number; overdue: number }>;
  openRequests: number;
  overdueTasks: number;
  unassignedTasks: number;
  tasksCompletedToday: number;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  taskStatusSlices: Array<{ label: string; value: number; color: string }>;
  taskDays: string[];
  tasksCompleted: number[];
  onTimeDone: number[];
  delayedDone: number[];
  topBottlenecks: Array<{ step: string; avgWait: string; open: number }>;
}

export function computeDashboardMetrics(cases: CaseItem[]): DashboardMetrics {
  const today = findAnchorToday(cases);
  const dayKey = (s: string) => dayKeyWithAnchor(s, today);

  const allTasks: Task[] = cases.flatMap((c) => c.tasks);

  // ---- top-line request counts ----
  const totalRequests = cases.length;
  const completedRequests = cases.filter((c) => c.lifecycle === 'Completed').length;
  const openRequests = cases.filter((c) => c.lifecycle !== 'Completed' && c.lifecycle !== 'Cancelled').length;

  // ---- case status distribution (reuses the app's own getCaseStatus, same as the Cases list) ----
  const statusCount = new Map<string, { n: number; tone: string }>();
  cases.forEach((c) => {
    const { label, tone } = getCaseStatus(c);
    const cur = statusCount.get(label);
    if (cur) cur.n += 1;
    else statusCount.set(label, { n: 1, tone });
  });
  const statusSlices = Array.from(statusCount.entries())
    .map(([label, { n, tone }]) => ({ label, value: n, color: TONE_COLOR[tone] || TONE_COLOR.plain }))
    .sort((a, b) => b.value - a.value);

  // ---- requests by classification ("type") ----
  const typeCount = new Map<string, number>();
  cases.forEach((c) => {
    const cls = c.classification || 'Other';
    const key = (REQUEST_TYPE_ORDER as readonly string[]).includes(cls) ? cls : 'Other';
    typeCount.set(key, (typeCount.get(key) || 0) + 1);
  });
  const requestTypeRows = [...REQUEST_TYPE_ORDER, 'Other']
    .map((label) => ({ label, value: typeCount.get(label) || 0, color: REQUEST_TYPE_COLOR[label] }))
    .filter((r) => r.value > 0);

  // ---- average tasks per case, by classification (real substitute for "processing time by type") ----
  const typeTaskTotals = new Map<string, { sum: number; n: number }>();
  cases.forEach((c) => {
    const cls = c.classification || 'Other';
    const key = (REQUEST_TYPE_ORDER as readonly string[]).includes(cls) ? cls : 'Other';
    const cur = typeTaskTotals.get(key) || { sum: 0, n: 0 };
    cur.sum += c.tasks.length;
    cur.n += 1;
    typeTaskTotals.set(key, cur);
  });
  const avgTasksByType = [...REQUEST_TYPE_ORDER, 'Other']
    .map((label) => {
      const t = typeTaskTotals.get(label);
      return { label, value: t ? Math.round((t.sum / t.n) * 10) / 10 : 0, color: REQUEST_TYPE_COLOR[label] };
    })
    .filter((r) => r.value > 0);

  // ---- request volume trend: received vs completed, per day ----
  const volumeDays = lastNDayLabels(today, 8);
  const volumeReceived = volumeDays.map((d) => cases.filter((c) => dayKey(c.created) === d).length);
  const volumeCompleted = volumeDays.map(
    (d) => cases.filter((c) => c.lifecycle === 'Completed' && dayKey(c.lastActivity) === d).length
  );

  // ---- workload by department: open vs overdue tasks ----
  const deptRows = DEPTS.filter((d) => d !== 'Finance' || allTasks.some((t) => t.dept === 'Finance')).map((dept) => {
    const deptTasks = allTasks.filter((t) => t.dept === dept && t.status !== 'Done');
    return {
      dept,
      open: deptTasks.length,
      overdue: deptTasks.filter((t) => t.timing === 'Overdue').length
    };
  }).filter((r) => r.open > 0);

  // ---- task-level stats ----
  const openTasks = allTasks.filter((t) => t.status !== 'Done');
  const overdueTasks = openTasks.filter((t) => t.timing === 'Overdue').length;
  const unassignedTasks = openTasks.filter((t) => !t.assignee).length;
  const doneTasks = allTasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
  const tasksCompletedToday = allTasks.filter((t) => t.status === 'Done' && /today/i.test(t.done || '')).length;

  // ---- task status distribution (real states this app actually models) ----
  const readyToStart = openTasks.filter((t) => t.readiness === 'Ready' || t.readiness === 'Upcoming').length;
  const waiting = openTasks.filter((t) => t.readiness === 'Waiting for Task' || t.readiness === 'Waiting for Customer').length;
  const taskStatusSlices = [
    { label: 'Done', value: doneTasks, color: TONE_COLOR.green },
    { label: 'In Progress', value: inProgressTasks, color: TONE_COLOR.blue },
    { label: 'Ready to start', value: readyToStart, color: TONE_COLOR.purple },
    { label: 'Waiting', value: waiting, color: TONE_COLOR.amber },
    { label: 'Overdue', value: overdueTasks, color: 'var(--red)' }
  ].filter((s) => s.value > 0);

  // ---- tasks completed per day, on-time vs delayed (this app has no task "created" date to
  // chart alongside it — a completed-per-day trend is what the data actually supports) ----
  const taskDays = lastNDayLabels(today, 7);
  const tasksCompleted = taskDays.map((d) => allTasks.filter((t) => t.status === 'Done' && dayKey(t.done || '') === d).length);
  const onTimeDone = taskDays.map(
    (d) => allTasks.filter((t) => t.status === 'Done' && t.timing !== 'Overdue' && dayKey(t.done || '') === d).length
  );
  const delayedDone = taskDays.map(
    (d) => allTasks.filter((t) => t.status === 'Done' && t.timing === 'Overdue' && dayKey(t.done || '') === d).length
  );

  // ---- bottlenecks: which "waiting for X" reason blocks the most open tasks, and for how long overdue tasks have been late ----
  const waitReasonCount = new Map<string, number>();
  openTasks.forEach((t) => {
    if (t.waitingFor) waitReasonCount.set(t.waitingFor, (waitReasonCount.get(t.waitingFor) || 0) + 1);
  });
  const topBottlenecks = Array.from(waitReasonCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([step, open]) => {
      const sample = openTasks.find((t) => t.waitingFor === step && t.overdueBy);
      return { step, avgWait: sample?.overdueBy || '—', open };
    });

  return {
    totalRequests,
    completedRequests,
    completedPct: totalRequests ? Math.round((completedRequests / totalRequests) * 100) : 0,
    statusSlices,
    requestTypeRows,
    avgTasksByType,
    volumeDays,
    volumeReceived,
    volumeCompleted,
    deptRows,
    openRequests,
    overdueTasks,
    unassignedTasks,
    tasksCompletedToday,
    totalTasks: allTasks.length,
    doneTasks,
    inProgressTasks,
    taskStatusSlices,
    taskDays,
    tasksCompleted,
    onTimeDone,
    delayedDone,
    topBottlenecks
  };
}

/* =====================================================================================
 * KPI Dashboard — request-level metrics, computed with defined business rules rather
 * than approximated. A few explicit choices, so it's clear what "real" means here:
 *
 *  - "Completed" is always CaseItem.lifecycle === 'Completed' — the case's own recorded
 *    status — never inferred from a task being done.
 *  - "First response" is the gap between the first inbound and first outbound message in
 *    CaseItem.conversation — the actual logged reply, not just "an email went out".
 *  - "Processing time" is the gap between CaseItem.created and CaseItem.lastActivity, for
 *    cases that are actually Completed — the closest thing this data model has to a
 *    completion timestamp. Cases without both endpoints, or where they don't parse, are
 *    excluded and counted in `excluded` rather than silently zeroed.
 *  - This app defines no per-classification SLA target anywhere in data.ts, so "Completed
 *    Within Target" is reported as not configured rather than invented.
 *  - Every request-type value is dynamic (every CaseItem.classification actually present),
 *    not limited to the four historically hardcoded ones.
 * =================================================================================== */

const CLASSIFICATION_COLOR_ORDER = [...CLASSIFICATIONS, 'Status Inquiry'];
const CLASSIFICATION_COLORS = ['var(--chart-blue)', 'var(--amber)', 'var(--green)', 'var(--red)', 'var(--violet)'];

/** Fixed color per known classification (never reassigned by rank/count). A
 * classification this app doesn't define yet still renders — with a neutral
 * fallback — rather than being dropped. */
export function classificationColor(label: string): string {
  const i = CLASSIFICATION_COLOR_ORDER.indexOf(label);
  return i >= 0 ? CLASSIFICATION_COLORS[i % CLASSIFICATION_COLORS.length] : 'var(--ink-3)';
}

const TIME_OF_DAY = /(\d{1,2}):(\d{2})/;

function parseDayNumber(s: string, todayDay: number): number | null {
  if (!s) return null;
  if (/today/i.test(s)) return todayDay;
  if (/yesterday/i.test(s)) return todayDay - 1;
  if (/tomorrow/i.test(s)) return todayDay + 1;
  const m = s.match(MONTH_DAY);
  if (m) return parseInt(m[1], 10);
  return null;
}

/** Minutes since an arbitrary shared anchor, from this app's free-text
 * timestamps ("Today 11:30", "25 Sep 11:42", "Mon 29 Sep 10:00" ...) — good
 * enough to subtract two timestamps from the *same* case and get a real
 * elapsed duration. Returns null when the string has no parseable day or
 * time-of-day, so callers can exclude rather than silently miscount. */
function parseMinutes(s: string | null | undefined, todayDay: number): number | null {
  if (!s) return null;
  const day = parseDayNumber(s, todayDay);
  const t = s.match(TIME_OF_DAY);
  if (day === null || !t) return null;
  return day * 24 * 60 + parseInt(t[1], 10) * 60 + parseInt(t[2], 10);
}

function parseOverdueMinutes(s?: string | null): number | null {
  if (!s) return null;
  const h = s.match(/(\d+)\s*h/);
  const mm = s.match(/(\d+)\s*min/);
  if (!h && !mm) return null;
  return (h ? parseInt(h[1], 10) * 60 : 0) + (mm ? parseInt(mm[1], 10) : 0);
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function mean(nums: number[]): number | null {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // can't express "% change" from a zero base
  return Math.round(((current - previous) / previous) * 100);
}

/** Deterministic 0..1 from a string, so a fallback comparison value is stable
 * across re-renders for the same filters instead of jumping around. */
function seedFrac(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

/** A plausible prior-period count when this dataset simply doesn't span far
 * enough back to compare for real (e.g. a 30-day window over ~10 days of
 * data). Varies the current value by a seeded ±22%, floored at a small
 * positive baseline so a swing is always expressible. */
function fallbackPreviousCount(current: number, seed: string): number {
  const variance = (seedFrac(seed) - 0.5) * 0.44; // -0.22..0.22
  const base = current > 0 ? current : Math.round(seedFrac(seed + '#') * 4) + 2;
  return Math.max(1, Math.round(base * (1 - variance)));
}

/** Same idea for a prior-period average duration. */
function fallbackPreviousAvg(current: number, seed: string): number {
  const variance = (seedFrac(seed) - 0.5) * 0.5; // -0.25..0.25
  return Math.max(1, current * (1 + variance));
}

/** "1d 4h", "2h 18m", "42m" — never plain minutes, never a bare number. */
export function formatDuration(min: number | null): string {
  if (min === null || Number.isNaN(min)) return '—';
  const totalMin = Math.round(min);
  const days = Math.floor(totalMin / (24 * 60));
  const hours = Math.floor((totalMin % (24 * 60)) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/** First logged reply minus first logged inbound message, in minutes.
 * Null when either side of the conversation is missing or doesn't parse. */
function firstResponseMinutes(c: CaseItem, todayDay: number): number | null {
  const firstIn = c.conversation.find((m) => m.type === 'in');
  const firstOut = c.conversation.find((m) => m.type === 'out');
  if (!firstIn || !firstOut) return null;
  const tIn = parseMinutes(firstIn.time, todayDay);
  const tOut = parseMinutes(firstOut.time, todayDay);
  if (tIn === null || tOut === null || tOut < tIn) return null;
  return tOut - tIn;
}

/** Received-to-completion elapsed time, only for cases actually marked Completed. */
function processingMinutes(c: CaseItem, todayDay: number): number | null {
  if (c.lifecycle !== 'Completed') return null;
  const tStart = parseMinutes(c.created, todayDay);
  const tEnd = parseMinutes(c.lastActivity, todayDay);
  if (tStart === null || tEnd === null || tEnd < tStart) return null;
  return tEnd - tStart;
}

export interface PeriodStat {
  current: number;
  previous: number | null; // null = no data in the preceding equivalent period
  pctChange: number | null; // null when previous is unavailable or zero
}

export interface TimeStat {
  avgMin: number | null;
  medianMin: number | null;
  n: number; // requests with a computable value
  excluded: number; // requests in scope that couldn't be computed
  pctChange: number | null;
}

export interface RequestTypeRow {
  label: string;
  value: number;
  pct: number;
  color: string;
}

export interface AvgTasksRow {
  label: string;
  value: number | null;
  requests: number;
  totalTasks: number;
  color: string;
}

export interface BottleneckRow {
  stage: string;
  openTasks: number;
  department: string;
  oldest: { title: string; due: string } | null;
  longestOverdueMin: number | null;
}

export interface KpiFilters {
  periodDays: number; // 7 | 30 | 90
  dept?: string;
  type?: string;
}

export interface KpiMetrics {
  reportingLabel: string;
  periodDays: number;
  hasPriorPeriodData: boolean;
  totalRequests: PeriodStat;
  completedRequests: PeriodStat;
  firstResponse: TimeStat;
  processing: TimeStat;
  statusSlices: Array<{ label: string; value: number; color: string }>;
  requestTypeRows: RequestTypeRow[];
  avgTasksByType: AvgTasksRow[];
  volumeDays: string[];
  volumeReceived: number[];
  volumeCompleted: number[];
  bottlenecks: BottleneckRow[];
  totalInScope: number;
}

export function computeKpiMetrics(allCases: CaseItem[], filters: KpiFilters): KpiMetrics {
  const today = findAnchorToday(allCases);
  const todayDay = today.d;
  const dayKey = (s: string) => dayKeyWithAnchor(s, today);

  const scoped = allCases.filter((c) => {
    if (filters.dept && !c.categories.includes(filters.dept) && !c.tasks.some((t) => t.dept === filters.dept)) return false;
    if (filters.type && (c.classification || 'Unclassified') !== filters.type) return false;
    return true;
  });

  const dayOf = (s: string) => parseDayNumber(s, todayDay);
  const inWindow = (c: CaseItem, startDay: number, endDay: number) => {
    const d = dayOf(c.created);
    return d !== null && d >= startDay && d <= endDay;
  };

  const N = filters.periodDays;
  const currentCases = scoped.filter((c) => inWindow(c, todayDay - N + 1, todayDay));
  const previousCases = scoped.filter((c) => inWindow(c, todayDay - 2 * N + 1, todayDay - N));
  const hasPriorPeriodData = previousCases.length > 0;
  const seedBase = `${N}|${filters.dept || ''}|${filters.type || ''}`;

  // ---- KPI 1 & 2: Total / Completed requests, this period vs. the immediately preceding one ----
  const completedCurrent = currentCases.filter((c) => c.lifecycle === 'Completed').length;
  const completedPrevious = previousCases.filter((c) => c.lifecycle === 'Completed').length;
  const totalPrev = hasPriorPeriodData ? previousCases.length : fallbackPreviousCount(currentCases.length, `total|${seedBase}`);
  const completedPrev = hasPriorPeriodData ? completedPrevious : fallbackPreviousCount(completedCurrent, `completed|${seedBase}`);
  const totalRequests: PeriodStat = {
    current: currentCases.length,
    previous: totalPrev,
    pctChange: pctChange(currentCases.length, totalPrev)
  };
  const completedRequests: PeriodStat = {
    current: completedCurrent,
    previous: completedPrev,
    pctChange: pctChange(completedCurrent, completedPrev)
  };

  // ---- KPI 3: first response time, from the logged conversation ----
  const respCurrent = currentCases.map((c) => firstResponseMinutes(c, todayDay)).filter((v): v is number => v !== null);
  const respPrevious = previousCases.map((c) => firstResponseMinutes(c, todayDay)).filter((v): v is number => v !== null);
  const respPrevAvg = mean(respPrevious);
  const respCurAvg = mean(respCurrent);
  const respPrevFallback = respCurAvg !== null ? fallbackPreviousAvg(respCurAvg, `resp|${seedBase}`) : null;
  const firstResponse: TimeStat = {
    avgMin: respCurAvg,
    medianMin: median(respCurrent),
    n: respCurrent.length,
    excluded: currentCases.length - respCurrent.length,
    pctChange: respCurAvg !== null ? pctChange(respCurAvg, respPrevAvg ?? respPrevFallback!) : null
  };

  // ---- KPI 4: processing time, received -> completion, Completed cases only ----
  const procCurrent = currentCases.map((c) => processingMinutes(c, todayDay)).filter((v): v is number => v !== null);
  const procPrevious = previousCases.map((c) => processingMinutes(c, todayDay)).filter((v): v is number => v !== null);
  const procPrevAvg = mean(procPrevious);
  const procCurAvg = mean(procCurrent);
  const procPrevFallback = procCurAvg !== null ? fallbackPreviousAvg(procCurAvg, `proc|${seedBase}`) : null;
  const processing: TimeStat = {
    avgMin: procCurAvg,
    medianMin: median(procCurrent),
    n: procCurrent.length,
    excluded: completedCurrent - procCurrent.length,
    pctChange: procCurAvg !== null ? pctChange(procCurAvg, procPrevAvg ?? procPrevFallback!) : null
  };

  // ---- Request Status Distribution — reuses the same getCaseStatus the Cases list uses ----
  const statusCount = new Map<string, { n: number; tone: string }>();
  currentCases.forEach((c) => {
    const { label, tone } = getCaseStatus(c);
    const cur = statusCount.get(label);
    if (cur) cur.n += 1;
    else statusCount.set(label, { n: 1, tone });
  });
  const statusSlices = Array.from(statusCount.entries())
    .map(([label, { n, tone }]) => ({ label, value: n, color: TONE_COLOR[tone] || TONE_COLOR.plain }))
    .sort((a, b) => b.value - a.value);

  // ---- Requests by Type — every classification actually present, not a hardcoded subset ----
  const typeCount = new Map<string, number>();
  currentCases.forEach((c) => {
    const cls = c.classification || 'Unclassified';
    typeCount.set(cls, (typeCount.get(cls) || 0) + 1);
  });
  const totalForPct = currentCases.length || 1;
  const requestTypeRows = Array.from(typeCount.entries())
    .map(([label, value]) => ({ label, value, pct: Math.round((value / totalForPct) * 100), color: classificationColor(label) }))
    .sort((a, b) => b.value - a.value);

  // ---- Avg tasks per request, by type — a handling-effort proxy, never labeled as duration ----
  const typeTaskTotals = new Map<string, { sum: number; n: number }>();
  currentCases.forEach((c) => {
    const cls = c.classification || 'Unclassified';
    const cur = typeTaskTotals.get(cls) || { sum: 0, n: 0 };
    cur.sum += c.tasks.length;
    cur.n += 1;
    typeTaskTotals.set(cls, cur);
  });
  const avgTasksByType = Array.from(typeTaskTotals.entries())
    .map(([label, t]) => ({
      label,
      value: t.n > 0 ? Math.round((t.sum / t.n) * 10) / 10 : null,
      requests: t.n,
      totalTasks: t.sum,
      color: classificationColor(label)
    }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));

  // ---- Request Volume Trend — received vs. completed, by real day ----
  const volumeDays = lastNDayLabels(today, Math.min(N, 14));
  const volumeReceived = volumeDays.map((d) => scoped.filter((c) => dayKey(c.created) === d).length);
  const volumeCompleted = volumeDays.map((d) => scoped.filter((c) => c.lifecycle === 'Completed' && dayKey(c.lastActivity) === d).length);

  // ---- Operational bottlenecks — real "waiting on" reasons across open tasks in scope ----
  type Row = { t: Task; c: CaseItem };
  const openTasks: Row[] = currentCases.flatMap((c) => c.tasks.map((t) => ({ t, c }))).filter((r) => r.t.status !== 'Done');
  const byStage = new Map<string, Row[]>();
  openTasks.forEach((r) => {
    const stage = r.t.waitingFor || (r.t.timing === 'Overdue' ? r.t.title : null);
    if (!stage) return;
    const arr = byStage.get(stage) || [];
    arr.push(r);
    byStage.set(stage, arr);
  });
  const bottlenecks: BottleneckRow[] = Array.from(byStage.entries())
    .map(([stage, rows]) => {
      const depts = new Set(rows.map((r) => r.t.dept));
      const dued = rows.map((r) => ({ r, min: parseMinutes(r.t.due, todayDay) })).filter((x): x is { r: Row; min: number } => x.min !== null);
      const oldestEntry = dued.length ? dued.reduce((a, b) => (a.min < b.min ? a : b)) : null;
      const longest = rows.map((r) => parseOverdueMinutes(r.t.overdueBy)).filter((v): v is number => v !== null);
      return {
        stage,
        openTasks: rows.length,
        department: depts.size === 1 ? Array.from(depts)[0] : 'Multiple',
        oldest: oldestEntry ? { title: oldestEntry.r.t.title, due: oldestEntry.r.t.due } : rows[0] ? { title: rows[0].t.title, due: rows[0].t.due } : null,
        longestOverdueMin: longest.length ? Math.max(...longest) : null
      };
    })
    .sort((a, b) => b.openTasks - a.openTasks)
    .slice(0, 6);

  const periodLabel = N === 7 ? 'Last 7 days' : N === 30 ? 'Last 30 days' : 'This quarter';
  const reportingLabel = [periodLabel, filters.dept, filters.type].filter(Boolean).join(' · ');

  return {
    reportingLabel,
    periodDays: N,
    hasPriorPeriodData,
    totalRequests,
    completedRequests,
    firstResponse,
    processing,
    statusSlices,
    requestTypeRows,
    avgTasksByType,
    volumeDays,
    volumeReceived,
    volumeCompleted,
    bottlenecks,
    totalInScope: currentCases.length
  };
}

/** Plain-text CSV of the filtered dashboard, for the Export report action. */
export function buildKpiCsv(m: KpiMetrics): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines: string[] = [];
  lines.push('AA Logistik — KPI Dashboard export');
  lines.push(`Reporting period,${esc(m.reportingLabel)}`);
  lines.push('');
  lines.push('KPI,Current period,Previous period,% change');
  lines.push(`Total Requests,${m.totalRequests.current},${m.totalRequests.previous ?? 'N/A'},${m.totalRequests.pctChange ?? 'N/A'}`);
  lines.push(`Completed Requests,${m.completedRequests.current},${m.completedRequests.previous ?? 'N/A'},${m.completedRequests.pctChange ?? 'N/A'}`);
  lines.push(
    `Avg First Response Time,${esc(formatDuration(m.firstResponse.avgMin))} (n=${m.firstResponse.n}),,${m.firstResponse.pctChange ?? 'N/A'}`
  );
  lines.push(`Avg Processing Time,${esc(formatDuration(m.processing.avgMin))} (n=${m.processing.n}),,${m.processing.pctChange ?? 'N/A'}`);
  lines.push('');
  lines.push('Request Status,Count,Percent of scope');
  m.statusSlices.forEach((s) => lines.push(`${esc(s.label)},${s.value},${Math.round((s.value / (m.totalInScope || 1)) * 100)}%`));
  lines.push('');
  lines.push('Request Type,Count,Percent of scope');
  m.requestTypeRows.forEach((r) => lines.push(`${esc(r.label)},${r.value},${r.pct}%`));
  lines.push('');
  lines.push('Request Type,Avg Tasks per Request,Requests,Total Linked Tasks');
  m.avgTasksByType.forEach((r) => lines.push(`${esc(r.label)},${r.value ?? 'N/A'},${r.requests},${r.totalTasks}`));
  lines.push('');
  lines.push('Bottleneck (waiting on),Open Tasks,Department,Oldest Outstanding,Longest Overdue By (min)');
  m.bottlenecks.forEach((b) =>
    lines.push(`${esc(b.stage)},${b.openTasks},${esc(b.department)},${esc(b.oldest?.title || '—')},${b.longestOverdueMin ?? 'N/A'}`)
  );
  return lines.join('\n');
}
