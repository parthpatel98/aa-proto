import React, { useState } from 'react';
import { AdmTab } from '../types';
import { USERS, DEPTS, CATEGORIES, CASE_CLASSES, CUSTOMER_RULES, REQ_PROFILES, MAILBOXES, TEMPLATES } from '../data';
import { useCurrentUser } from '../UserContext';

interface AdminViewProps {
  admTab: AdmTab;
}

export const AdminView: React.FC<AdminViewProps> = ({ admTab }) => {
  const currentUser = useCurrentUser();
  const [selectedTplId, setSelectedTplId] = useState(TEMPLATES[0].id);

  const tpl = TEMPLATES.find((x) => x.id === selectedTplId) || TEMPLATES[0];

  const deptCounts: Record<string, number> = {
    Transport: 23,
    Warehouse: 3,
    Packing: 3,
    'Freight Forwarding': 2,
    Finance: 6
  };

  return (
    <>
      {/* 1. USERS */}
      {admTab === 'users' && (
        <>
          <div className="page-head">
            <div>
              <h1>Users</h1>
              <p>Who can work in the system and where they sit</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>DEPARTMENT</th>
                    <th>ROLE</th>
                    <th>DEFAULT WORK SCOPE</th>
                    <th>ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.map((u) => (
                    <tr key={u.name}>
                      <td>
                        <div className="row">
                          <span className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{u.init}</span>
                          <span className="cell-main">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.dept}</td>
                      <td>{u.role}</td>
                      <td>{u.name === currentUser.name ? 'Me' : 'My department'}</td>
                      <td><span className="chip green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 2. DEPARTMENTS */}
      {admTab === 'depts' && (
        <>
          <div className="page-head">
            <div>
              <h1>Departments</h1>
              <p>Tasks are owned by a department first, a person second</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>DEPARTMENT</th>
                    <th>HEAD</th>
                    <th>OPEN TASKS</th>
                    <th>SHARED MAILBOX</th>
                    <th>ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPTS.map((d) => {
                    const mb = MAILBOXES.find((m) => m.dept === d);
                    return (
                      <tr key={d}>
                        <td className="cell-main">{d}</td>
                        <td>{d === 'Transport' ? 'Andreas Backström' : d === 'Warehouse' ? 'Anna Svensson' : '—'}</td>
                        <td className="num">{deptCounts[d] || 0}</td>
                        <td className="mono tiny">{mb ? mb.addr : '—'}</td>
                        <td><span className="chip green">Active</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 3. CATEGORIES */}
      {admTab === 'cats' && (
        <>
          <div className="page-head">
            <div>
              <h1>Categories</h1>
              <p>What kind of service a request is about</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>CATEGORY</th>
                    <th>DEFAULT DEPARTMENT</th>
                    <th>WHAT IT COVERS</th>
                    <th>ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((c) => (
                    <tr key={c.name}>
                      <td className="cell-main">{c.name}</td>
                      <td>{c.dept}</td>
                      <td className="muted">{c.desc}</td>
                      <td><span className="chip green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 4. CASE CLASSES */}
      {admTab === 'classes' && (
        <>
          <div className="page-head">
            <div>
              <h1>Case classes</h1>
              <p>What the customer actually wants, which drives the work and the required data</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>CASE CLASS</th>
                    <th>MEANING</th>
                    <th>REQUIRED DATA PROFILE</th>
                    <th>ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {CASE_CLASSES.map((c) => (
                    <tr key={c.name}>
                      <td className="cell-main">{c.name}</td>
                      <td className="muted">{c.desc}</td>
                      <td>{c.profile}</td>
                      <td><span className="chip green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 5. TASK TEMPLATES */}
      {admTab === 'templates' && (
        <>
          <div className="page-head">
            <div>
              <h1>Task templates</h1>
              <p>Templates suggest the work. People can still change anything on the case.</p>
            </div>
          </div>
          <div className="split">
            <div>
              <div className="listnav">
                {TEMPLATES.map((x) => (
                  <button
                    key={x.id}
                    aria-current={selectedTplId === x.id}
                    onClick={() => setSelectedTplId(x.id)}
                  >
                    <div className="cell-main">{x.cat} + {x.cls}</div>
                    <div className="cell-sub">
                      {x.customer ? `${x.customer} override · ${x.tasks.length} tasks` : `Applies to every customer · ${x.tasks.length} tasks`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h3>{tpl.cat} + {tpl.cls}</h3>
                {tpl.customer && <span className="chip violet" style={{ marginLeft: 8 }}>{tpl.customer}</span>}
                <div className="spacer" />
                <button className="btn btn-sm">Add task</button>
              </div>
              <div className="tasklist">
                {tpl.tasks.map((t, i) => (
                  <div key={i} className="taskrow" style={{ cursor: 'default' }}>
                    <span className="num muted" style={{ width: 18 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div className="cell-main">{t.t}</div>
                      <div className="taskmeta tiny muted">
                        <span>{t.d}</span>
                        <span>·</span>
                        <span>due {t.due}</span>
                        {(t as any).cond && (
                          <>
                            <span>·</span>
                            <span>only when: {(t as any).cond}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="row" style={{ gap: 5 }}>
                      {t.ms && <span className="chip blue">Customer-visible</span>}
                      <span className="chip plain">{t.type}</span>
                      <span className={`chip ${t.p === 'High' ? 'amber' : 'plain'}`}>{t.p}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tablefoot">
                Order sets the default sequence. Dependencies are kept to one predecessor per task on purpose — this is not a workflow engine.
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. CUSTOMERS & RULES */}
      {admTab === 'customers' && (
        <>
          <div className="page-head">
            <div>
              <h1>Customers & rules</h1>
              <p>Rules that adjust priority and add tasks for a specific customer</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>SENDER DOMAINS</th>
                    <th>DEFAULT PRIORITY</th>
                    <th>RULES</th>
                  </tr>
                </thead>
                <tbody>
                  {CUSTOMER_RULES.map((c) => (
                    <tr key={c.customer}>
                      <td className="cell-main">{c.customer}</td>
                      <td className="mono tiny">{c.domains}</td>
                      <td>
                        <span className={`chip ${c.prio === 'High' ? 'amber' : 'plain'}`}>{c.prio}</span>
                      </td>
                      <td className="muted">{c.rules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 7. REQUIRED DATA PROFILES */}
      {admTab === 'profiles' && (
        <>
          <div className="page-head">
            <div>
              <h1>Required data</h1>
              <p>What must be known before the next step can happen</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>PROFILE</th>
                    <th>CASE CLASS</th>
                    <th>REQUIRED FIELDS</th>
                    <th>BLOCKS</th>
                  </tr>
                </thead>
                <tbody>
                  {REQ_PROFILES.map((p) => (
                    <tr key={p.name}>
                      <td className="cell-main">{p.name}</td>
                      <td>{p.cls}</td>
                      <td>
                        {p.fields.map((f) => (
                          <span key={f} className="chip plain tiny" style={{ marginRight: 4 }}>
                            {f}
                          </span>
                        ))}
                      </td>
                      <td className="muted">{p.blocks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="note" style={{ marginTop: 14 }}>
            Changing a profile changes what counts as complete, and therefore when an Opter order can be created.
          </div>
        </>
      )}

      {/* 8. MAILBOXES */}
      {admTab === 'mailboxes' && (
        <>
          <div className="page-head">
            <div>
              <h1>Mailboxes</h1>
              <p>Where messages arrive and which sender address people can write from</p>
            </div>
          </div>
          <div className="card">
            <div className="tablescroll">
              <table className="t">
                <thead>
                  <tr>
                    <th>MAILBOX</th>
                    <th>ADDRESS</th>
                    <th>DEPARTMENT</th>
                    <th>DEFAULT SENDER</th>
                    <th>ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {MAILBOXES.map((m) => (
                    <tr key={m.id}>
                      <td className="cell-main">{m.name}</td>
                      <td className="mono tiny">{m.addr}</td>
                      <td>{m.dept}</td>
                      <td>{m.def ? <span className="chip blue">Default</span> : '—'}</td>
                      <td><span className="chip green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="note" style={{ marginTop: 14 }}>
            Which mailbox a message arrives in is a hint, never a classification on its own.
          </div>
        </>
      )}
    </>
  );
};
