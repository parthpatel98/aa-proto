import React, { useState } from 'react';
import { CaseItem, Task } from '../types';
import { SearchIcon } from '../icons';
import { useCurrentUser } from '../UserContext';

interface WorkViewProps {
  cases: CaseItem[];
  onOpenTaskDrawer: (caseId: string, taskId: string) => void;
  onTaskAction: (caseId: string, taskId: string, action: 'take' | 'start' | 'complete') => void;
  initialDept?: string;
}

export const WorkView: React.FC<WorkViewProps> = ({
  cases,
  onOpenTaskDrawer,
  onTaskAction,
  initialDept
}) => {
  const currentUser = useCurrentUser();
  const [scope, setScope] = useState<'me' | 'dept' | 'all'>('me');
  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState(initialDept || '');

  // Flatten all tasks
  const allTasks: Array<Task & { caseId: string; customer: string; casePrio: string }> = [];
  cases.forEach((c) => {
    c.tasks.forEach((t) => {
      allTasks.push({ ...t, caseId: c.id, customer: c.customer, casePrio: c.priority });
    });
  });

  let rows = allTasks.filter((t) => t.status !== 'Done');

  if (deptFilter) rows = rows.filter((t) => t.dept === deptFilter);

  if (scope === 'me') rows = rows.filter((t) => t.assignee === currentUser.name);
  else if (scope === 'dept') rows = rows.filter((t) => t.dept === currentUser.dept);

  if (q) {
    const term = q.toLowerCase();
    rows = rows.filter((t) => (t.title + t.caseId + t.customer + (t.assignee || '')).toLowerCase().includes(term));
  }

  const timingOrder = { Overdue: 0, 'Due Soon': 1, 'On Track': 2 };
  rows.sort((a, b) => timingOrder[a.timing] - timingOrder[b.timing] || (a.status === 'In Progress' ? -1 : 0));

  const scopeNote = {
    me: '',
    dept: `Everything in ${currentUser.dept}, including work nobody has picked up yet.`,
    all: 'All visible work across departments.'
  }[scope];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Work</h1>
          <p>View and manage all tasks assigned to you</p>
        </div>
      </div>

      <div className="filterbar">
        <div className="segmented">
          <button aria-pressed={scope === 'me'} onClick={() => setScope('me')}>Me</button>
          <button aria-pressed={scope === 'dept'} onClick={() => setScope('dept')}>My department</button>
          <button aria-pressed={scope === 'all'} onClick={() => setScope('all')}>All</button>
        </div>
        {scopeNote && <span className="small muted">{scopeNote}</span>}
        {deptFilter && (
          <button className="chip blue cursor-pointer" onClick={() => setDeptFilter('')}>
            Department: {deptFilter} ✕
          </button>
        )}
        <div style={{ flex: 1 }} />
        <div className="search">
          <SearchIcon />
          <input
            placeholder="Task, case or customer"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="tablewrap">
        <div className="tablescroll">
          <table className="t">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Task</th>
                <th>Department</th>
                <th>Assignee</th>
                <th>Status and readiness</th>
                <th>Due</th>
                <th>Customer impact</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="muted" style={{ padding: 22 }}>
                    Nothing in this scope. Try My department or All.
                  </td>
                </tr>
              ) : (
                rows.map((t) => {
                  const cls = t.timing === 'Overdue' ? 'failed' : t.timing === 'Due Soon' ? 'unattended' : '';
                  return (
                    <tr
                      key={`${t.caseId}-${t.id}`}
                      className={cls}
                      onClick={() => onOpenTaskDrawer(t.caseId, t.id)}
                    >
                      <td>
                        <span className={`chip ${t.priority === 'Urgent' ? 'red' : t.priority === 'High' ? 'amber' : 'plain'}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <div className="cell-main">{t.title}</div>
                        <div className="cell-sub">
                          <span className="mono" style={{ fontWeight: 700 }}>#{t.caseId}</span> · {t.customer}
                        </div>
                      </td>
                      <td className="nowrap">{t.dept}</td>
                      <td className="nowrap">
                        {t.assignee ? (
                          <span className="row">
                            <span className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>
                              {t.assignee.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                            </span>
                            {t.assignee.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="chip amber">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`chip ${t.status === 'In Progress' ? 'blue' : t.status === 'Done' ? 'green' : ''}`}>
                          {t.status === 'In Progress' ? 'In progress' : t.status === 'To Do' ? 'To do' : t.status}
                        </span>{' '}
                        {t.status !== 'Done' && (
                          <span className={`chip ${t.readiness === 'Ready' ? 'green' : t.readiness === 'Waiting for Customer' ? 'blue' : ''}`}>
                            {t.readiness === 'Waiting for Task' ? 'Waiting for task' : t.readiness === 'Waiting for Customer' ? 'Waiting for customer' : t.readiness}
                          </span>
                        )}
                        {t.waitingFor && <div className="cell-sub">{t.waitingFor}</div>}
                      </td>
                      <td className="nowrap">
                        <div>{t.due}</div>
                        {t.timing === 'Overdue' && (
                          <div style={{ marginTop: 3 }}>
                            <span className="chip red">Overdue {t.overdueBy || ''}</span>
                          </div>
                        )}
                        {t.timing === 'Due Soon' && (
                          <div style={{ marginTop: 3 }}>
                            <span className="chip amber">Due soon</span>
                          </div>
                        )}
                      </td>
                      <td className="nowrap">
                        {t.milestone ? (
                          <span className="chip blue">Customer-visible</span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="nowrap" onClick={(e) => e.stopPropagation()}>
                        {t.status === 'In Progress' ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onTaskAction(t.caseId, t.id, 'complete')}
                          >
                            Complete
                          </button>
                        ) : !t.assignee ? (
                          <button
                            className="btn btn-sm"
                            onClick={() => onTaskAction(t.caseId, t.id, 'take')}
                          >
                            Take
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm"
                            onClick={() => onTaskAction(t.caseId, t.id, 'start')}
                          >
                            Start
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="tablefoot">
          {rows.length} open tasks. Overdue work is shown, never reassigned automatically.
        </div>
      </div>
    </>
  );
};
