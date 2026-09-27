import React, { useState } from 'react';
import { Section, OpsTab, InsTab, AdmTab, CaseItem, InboxMessage, NotificationItem, Task, CaseField } from './types';
import { INITIAL_CASES, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, MAILBOXES, USERS, generateTasksForDepartment } from './data';
import { DEFAULT_USER, UserProvider } from './UserContext';
import { MarkSymbol } from './icons';
import { Login } from './components/Login';
import { Appbar } from './components/Appbar';
import { InboxView } from './components/InboxView';
import { CasesView } from './components/CasesView';
import { WorkView } from './components/WorkView';
import { CaseWorkspace } from './components/CaseWorkspace';
import { KpiDashboardView } from './components/KpiDashboardView';
import { OperationsDashboardView } from './components/OperationsDashboardView';
import { PerformanceView } from './components/PerformanceView';
import { AdminView } from './components/AdminView';
import { ModalsAndDrawers } from './components/ModalsAndDrawers';
import { Sidebar } from './components/Sidebar';
import { ThemeSwitcher } from './components/ThemeSwitcher';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aa-user');
      return USERS.find((user) => user.name === saved) || DEFAULT_USER;
    } catch { return DEFAULT_USER; }
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('aa-session');
    } catch {
      return false;
    }
  });

  const [section, setSection] = useState<Section>('ops');
  const [opsTab, setOpsTab] = useState<OpsTab>('inbox');
  const [insTab, setInsTab] = useState<InsTab>('kpis');
  const [admTab, setAdmTab] = useState<AdmTab>('users');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aa-sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aa-sidebar-collapsed', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseTab, setCaseTab] = useState<string>('overview');

  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [messages, setMessages] = useState<InboxMessage[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modals & Drawers state
  const [selectedTaskInfo, setSelectedTaskInfo] = useState<{ caseId: string; taskId: string } | null>(null);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [classifyMsg, setClassifyMsg] = useState<InboxMessage | null>(null);
  const [matchMsg, setMatchMsg] = useState<InboxMessage | null>(null);
  const [opterCase, setOpterCase] = useState<CaseItem | null>(null);
  const [composerData, setComposerData] = useState<{ c: CaseItem; kind: string } | null>(null);
  const [addTaskCase, setAddTaskCase] = useState<CaseItem | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isSignOutPrompt, setIsSignOutPrompt] = useState(false);

  // Pre-selected search customer for cases tab
  const [searchCustomer, setSearchCustomer] = useState('');
  const [workDeptFilter, setWorkDeptFilter] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState('');
  const [caseClassificationFilter, setCaseClassificationFilter] = useState('');
  const [caseCommFilter, setCaseCommFilter] = useState('');

  // Toast feedback
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; kind?: string }>>([]);

  const toast = (text: string, kind?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const logActivity = (c: CaseItem, actor: string, kind: any, text: string, detail?: string) => {
    c.activity.push({ time: 'Just now', actor, kind, text, detail: detail || '' });
    c.lastActivity = 'just now';
  };

  const handleOpenCase = (id: string, initialTab: string = 'overview') => {
    setActiveCaseId(id);
    setCaseTab(initialTab);
    setSection('case');
  };

  const handleTaskAction = (caseId: string, taskId: string, action: 'take' | 'start' | 'complete') => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const task = c.tasks.find((t) => t.id === taskId);
        if (!task) return c;

        if (action === 'take') {
          task.assignee = currentUser.name;
          logActivity(c, currentUser.name, 'Tasks', `Task "${task.title}" assigned to ${currentUser.name}`);
          toast(`You now own "${task.title}"`);
        } else if (action === 'start') {
          task.status = 'In Progress';
          if (!task.assignee) task.assignee = currentUser.name;
          logActivity(c, currentUser.name, 'Tasks', `Task "${task.title}" changed To Do → In Progress`);
          toast(`Started "${task.title}"`);
        } else if (action === 'complete') {
          task.status = 'Done';
          task.done = 'Just now';
          task.readiness = 'Ready';
          task.timing = 'On Track';
          logActivity(c, currentUser.name, 'Tasks', `Task "${task.title}" completed by ${currentUser.name}`);
          toast(`Completed "${task.title}"`, 'good');

          // Clear dependencies
          c.tasks.filter((x) => x.dep === task.id && x.status !== 'Done').forEach((x) => {
            x.readiness = 'Ready';
            x.waitingFor = null;
            logActivity(c, 'System', 'Tasks', `Dependency cleared — "${x.title}" is ready`);
          });
        }
        return { ...c };
      })
    );
  };

  const handleCompleteTask = (c: CaseItem, t: Task) => {
    handleTaskAction(c.id, t.id, 'complete');
  };

  const handleConfirmOpter = (c: CaseItem) => {
    const num = String(246412 + cases.filter((x) => x.records.some((r) => r.type === 'Opter order')).length);
    c.records.push({ type: 'Opter order', number: num, created: 'Just now', status: 'Planned', wi: c.workItems[0]?.name || 'Transport' });
    logActivity(c, 'System', 'Orders', `Opter order ${num} created`, `Created by ${currentUser.name} after review`);

    const opterTask = c.tasks.find((t) => t.title.toLowerCase().includes('create opter'));
    if (opterTask) {
      opterTask.status = 'Done';
      opterTask.done = 'Just now';
    }

    setOpterCase(null);
    setCases([...cases]);
    toast(`Opter order ${num} created`, 'good');
  };

  const handleSendEmail = (c: CaseItem, to: string, from: string, subj: string, body: string, kind: string) => {
    c.conversation.push({
      type: 'out',
      from,
      to,
      time: 'Just now',
      subject: subj,
      body,
      attachments: []
    });
    c.comm.lastOut = 'Just now';
    c.comm.state = kind === 'missing' ? 'Waiting for Customer' : 'Acknowledged';
    logActivity(c, currentUser.name, 'Communication', `Email sent to ${to}`, `Subject: ${subj}`);

    setComposerData(null);
    setCases([...cases]);
    toast(`Email sent to ${to}`, 'good');
  };

  const handleSaveField = (c: CaseItem, f: CaseField, val: string) => {
    f.v = val;
    f.edited = true;
    f.rev = 'High Confidence';
    delete f.conflict;
    f.src = `Confirmed by ${currentUser.name}`;
    logActivity(c, currentUser.name, 'Data', `Field "${f.k}" updated`, `Value: ${val}`);

    setCases([...cases]);
    toast(`"${f.k}" updated`);
  };

  const handleAddNote = (c: CaseItem, text: string, _files: File[]) => {
    c.conversation.push({
      type: 'internal',
      from: currentUser.name,
      time: 'Just now',
      body: text,
      attachments: []
    });
    logActivity(c, currentUser.name, 'Communication', 'Internal note added');
    setCases([...cases]);
    toast('Note added');
  };

  const handleSaveHeader = (c: CaseItem, updated: Partial<CaseItem>) => {
    Object.assign(c, updated);

    // If categories/departments are set, verify that workflow tasks exist for each department
    const targetDepts = updated.categories || c.categories || [];
    const addedDepts: string[] = [];

    targetDepts.forEach((dept) => {
      if (dept && dept !== 'Other / Unclassified') {
        const hasDeptTasks = c.tasks.some((t) => t.dept === dept);
        if (!hasDeptTasks) {
          const generated = generateTasksForDepartment(c, dept);
          if (generated.length > 0) {
            c.tasks.push(...generated);
            addedDepts.push(dept);
          }
        }
      }
    });

    if (addedDepts.length > 0) {
      logActivity(c, currentUser.name, 'Tasks', `Workflow tasks generated for ${addedDepts.join(', ')} department${addedDepts.length > 1 ? 's' : ''}`);
      setCases([...cases]);
      toast(`Saved: Tasks generated for ${addedDepts.join(', ')}`, 'good');
    } else {
      logActivity(c, currentUser.name, 'System', 'Case details edited');
      setCases([...cases]);
      toast('Case details updated');
    }
  };

  const handleCompleteCase = (c: CaseItem) => {
    c.lifecycle = 'Completed';
    c.conditions = [];
    c.comm.state = 'No Action Required';
    logActivity(c, currentUser.name, 'System', 'Case completed', 'All tasks done and customer informed');
    setCases([...cases]);
    toast('Case completed', 'good');
  };

  const handleConfirmClassify = (
    m: InboxMessage,
    payload: { customer: string; cats: string[]; cls: string; prio: string }
  ) => {
    const id = String(325854 + cases.length);
    const newCase: CaseItem = {
      id,
      customer: payload.customer,
      contact: m.sender.split('@')[0],
      email: m.sender,
      title: m.subject,
      categories: payload.cats,
      caseClass: payload.cls,
      priority: payload.prio as any,
      lifecycle: 'Active',
      conditions: [],
      created: 'Just now',
      lastActivity: 'just now',
      origin: 'manual',
      comm: { state: 'Response Required', lastIn: 'Today ' + m.time, lastOut: null },
      summary: `${payload.customer} emailed about "${m.subject}". Classified as ${payload.cats.join(' + ')} / ${payload.cls}.`,
      workItems: payload.cats.map((cat, i) => ({ id: `wi${i + 1}`, name: `${cat} work`, dept: cat })),
      tasks: [
        {
          id: 'T1',
          wi: 'wi1',
          title: 'Validate transport details',
          dept: 'Transport',
          assignee: currentUser.name,
          status: 'To Do',
          readiness: 'Ready',
          priority: 'High',
          due: 'Today 14:00',
          timing: 'On Track',
          milestone: false
        },
        {
          id: 'T2',
          wi: 'wi1',
          title: 'Create Opter order',
          dept: 'Transport',
          assignee: null,
          status: 'To Do',
          readiness: 'Waiting for Task',
          waitingFor: 'Validate transport details',
          dep: 'T1',
          priority: 'High',
          due: 'Today 16:00',
          timing: 'On Track',
          milestone: false
        }
      ],
      data: [
        {
          group: 'Extracted request data',
          fields: [
            { k: 'Customer', v: payload.customer, src: 'Email', rev: 'High Confidence' },
            { k: 'Subject', v: m.subject, src: 'Email', rev: 'High Confidence' }
          ]
        }
      ],
      records: [],
      conversation: [
        {
          type: 'in',
          from: `${payload.customer} <${m.sender}>`,
          to: m.mailbox,
          time: 'Today ' + m.time,
          subject: m.subject,
          body: m.body,
          attachments: []
        }
      ],
      activity: [
        { time: 'Just now', actor: currentUser.name, kind: 'System', text: 'Case created from inbox message' }
      ]
    };

    m.caseId = id;
    m.state = 'Processed';
    m.attention = false;

    setCases([newCase, ...cases]);
    setMessages([...messages]);
    setClassifyMsg(null);
    toast(`Case ${id} created`, 'good');
    handleOpenCase(id, 'work');
  };

  const handleConfirmMatch = (m: InboxMessage, targetCaseId: string) => {
    const targetCase = cases.find((c) => c.id === targetCaseId);
    if (!targetCase) return;

    m.caseId = targetCase.id;
    m.match = null;
    m.state = 'Processed';
    m.attention = false;

    targetCase.conversation.push({
      type: 'in',
      from: `${targetCase.customer} <${m.sender}>`,
      to: m.mailbox,
      time: 'Today ' + m.time,
      subject: m.subject,
      body: m.body,
      attachments: []
    });
    logActivity(targetCase, currentUser.name, 'Communication', `Email linked to case: ${m.subject}`);

    setCases([...cases]);
    setMessages([...messages]);
    setMatchMsg(null);
    toast(`Email linked to ${targetCase.id}`, 'good');
    handleOpenCase(targetCase.id, 'conversation');
  };

  const handleSkipMsg = (m: InboxMessage, reason: string) => {
    m.state = 'Skipped';
    m.attention = false;
    m.skipReason = reason;
    setMessages([...messages]);
    setClassifyMsg(null);
    toast(`Email skipped — ${reason.toLowerCase()}`);
  };

  const handleSimulateReply = () => {
    const c = cases.find((x) => x.id === '325855');
    if (!c) return;

    c.conversation.push({
      type: 'in',
      from: `${c.contact} <${c.email}>`,
      to: 'transport@aalogistik.se',
      time: 'Just now',
      subject: 'Re: Additional information required for your transport request',
      body: 'Hi Malin,\n\nDimensions are 120x80x105, two EUR pallets, not stackable.\nDelivery is Ringön, the delivery note is correct.\n\nPer',
      attachments: []
    });

    // Update missing fields
    const f = c.data[0].fields;
    const dim = f.find((x) => x.k === 'Dimensions');
    if (dim) { dim.v = '120 × 80 × 105 cm'; dim.rev = 'High Confidence'; }
    const pal = f.find((x) => x.k === 'Pallets');
    if (pal) { pal.v = '2 (EUR, not stackable)'; pal.rev = 'High Confidence'; }
    const del = f.find((x) => x.k === 'Delivery location');
    if (del) { del.v = 'Ringön, Göteborg'; del.rev = 'High Confidence'; delete del.conflict; }

    c.comm.state = 'Response Required';
    c.conditions = c.conditions.filter((x) => x !== 'Missing Information' && x !== 'Waiting for Customer');

    const t3 = c.tasks.find((t) => t.title === 'Create Opter order');
    if (t3) { t3.readiness = 'Ready'; t3.waitingFor = null; }

    logActivity(c, 'AI', 'Data', 'Structured data updated from customer reply');

    setCases([...cases]);
    toast('Customer reply received — missing data filled in and ready for Opter!', 'good');
  };

  const handleSimulateAcceptance = () => {
    const c = cases.find((x) => x.id === '325856');
    if (!c) return;

    c.accepted = true;
    c.conversation.push({
      type: 'in',
      from: `${c.contact} <${c.email}>`,
      to: 'transport@aalogistik.se',
      time: 'Just now',
      subject: 'Re: Quote — Västerås to Stockholm, week 40',
      body: 'Price accepted. Please book it for Friday.\n\nKarin',
      attachments: []
    });
    c.comm.state = 'Response Required';
    c.conditions = c.conditions.filter((x) => x !== 'Waiting for Customer');
    logActivity(c, 'AI', 'System', 'Acceptance detected — conversion to Confirmed Order suggested');

    setCases([...cases]);
    toast('Quote accepted! Click "Convert to confirmed order" on the case banner.', 'good');
  };

  const handleRunJourney = (k: string) => {
    setIsDemoOpen(false);
    if (k === 'j1') {
      handleOpenCase('325854', 'overview');
      toast('Journey 1: Clean transport order running across 3 departments');
    } else if (k === 'j2') {
      handleOpenCase('325855', 'data');
      toast('Journey 2: Customer clarification & data conflict');
    } else if (k === 'j3') {
      setSection('ops');
      setOpsTab('inbox');
      const m1 = messages.find((m) => m.id === 'M1');
      if (m1) setMatchMsg(m1);
      toast('Journey 3: Match incoming email to existing case');
    } else if (k === 'j4') {
      handleOpenCase('325854', 'work');
      toast('Journey 4: Multi-department swimlanes & dependencies');
    } else if (k === 'j5') {
      handleSimulateAcceptance();
      handleOpenCase('325856', 'overview');
    } else if (k === 'j6') {
      setSection('ops');
      setOpsTab('inbox');
      setSelectedMsgId('M4');
      toast('Journey 6: Processing failure handled gracefully');
    }
  };

  const activeCase = activeCaseId ? cases.find((c) => c.id === activeCaseId) : null;

  return (
    <>
      <MarkSymbol />
      <ThemeSwitcher />

          <Login
            isOpen={!isLoggedIn}
        onSignIn={(user) => {
          setCurrentUser(user);
          try { localStorage.setItem('aa-user', user.name); } catch {}
          setIsLoggedIn(true);
          toast(`Signed in as ${user.name}`, 'good');
        }}
      />

      <UserProvider user={currentUser}>
      <div id="app" className={`app-root ${sidebarCollapsed ? 'sidebar-is-collapsed' : 'sidebar-is-expanded'}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          section={section}
          setSection={setSection}
          opsTab={opsTab}
          setOpsTab={setOpsTab}
          insTab={insTab}
          setInsTab={setInsTab}
          admTab={admTab}
          setAdmTab={setAdmTab}
          attentionInboxCount={messages.filter((m) => m.attention).length}
        />

        <div
          className="main-layout-container"
          onClick={() => {
            if (!sidebarCollapsed) {
              setSidebarCollapsed(true);
              try {
                localStorage.setItem('aa-sidebar-collapsed', '1');
              } catch {}
            }
          }}
        >
          <Appbar
            sidebarCollapsed={sidebarCollapsed}
            section={section}
            setSection={setSection}
            opsTab={opsTab}
            setOpsTab={setOpsTab}
            insTab={insTab}
            setInsTab={setInsTab}
            admTab={admTab}
            setAdmTab={setAdmTab}
            onOpenCase={handleOpenCase}
            onOpenMsgDrawer={(id) => setSelectedMsgId(id)}
            cases={cases}
            messages={messages}
            notifications={notifications}
            onMarkAllRead={() => {
              setNotifications(notifications.map((n) => ({ ...n, unread: false })));
              toast('All notifications marked as read');
            }}
            onOpenDemo={() => setIsDemoOpen(true)}
            onSignOutPrompt={() => setIsSignOutPrompt(true)}
            onSelectSearchCustomer={(cust) => {
              setSection('ops');
              setOpsTab('cases');
              setSearchCustomer(cust);
            }}
            activeCaseId={activeCaseId}
          />

          <main className="page">
          {section === 'ops' && (
            <>
              {opsTab === 'inbox' && (
                <InboxView
                  messages={messages}
                  mailboxes={MAILBOXES}
                  cases={cases}
                  onOpenCase={handleOpenCase}
                  onOpenMsgDrawer={(id) => setSelectedMsgId(id)}
                  onOpenClassify={(m) => setClassifyMsg(m)}
                  onOpenMatch={(m) => setMatchMsg(m)}
                  onDoRequiredAction={(m) => {
                    if (m.caseId) {
                      handleOpenCase(m.caseId, m.reply ? 'conversation' : 'overview');
                    } else if (m.match) {
                      setMatchMsg(m);
                    } else {
                      setClassifyMsg(m);
                    }
                  }}
                  onAssignToMe={(m) => {
                    m.assignee = currentUser.name;
                    setMessages([...messages]);
                    toast('Assigned to you');
                  }}
                  onMarkHandled={(m) => {
                    m.attention = false;
                    m.state = 'Processed';
                    setMessages([...messages]);
                    toast('Marked as handled');
                  }}
                  onBulkAction={(action, ids) => {
                    if (action === 'me') {
                      setMessages(
                        messages.map((m) => (ids.includes(m.id) ? { ...m, assignee: currentUser.name } : m))
                      );
                      toast(`${ids.length} messages assigned to you`);
                    }
                  }}
                />
              )}

              {opsTab === 'cases' && (
                <CasesView
                  cases={cases}
                  onOpenCase={handleOpenCase}
                  initialSearchCustomer={searchCustomer}
                  initialStatus={caseStatusFilter}
                  initialClassification={caseClassificationFilter}
                  initialComm={caseCommFilter}
                />
              )}

              {opsTab === 'work' && (
                <WorkView
                  cases={cases}
                  onOpenTaskDrawer={(cId, tId) => setSelectedTaskInfo({ caseId: cId, taskId: tId })}
                  onTaskAction={handleTaskAction}
                  initialDept={workDeptFilter}
                />
              )}
            </>
          )}

          {section === 'case' && activeCase && (
            <CaseWorkspace
              c={activeCase}
              tab={caseTab}
              setTab={setCaseTab}
              opsTab={opsTab}
              onNavigateOps={(t) => {
                setSection('ops');
                setOpsTab(t);
              }}
              onOpenTaskDrawer={(cId, tId) => setSelectedTaskInfo({ caseId: cId, taskId: tId })}
              onCompleteTask={handleCompleteTask}
              onOpenComposer={(c, kind) => setComposerData({ c, kind })}
              onOpenOpterModal={(c) => setOpterCase(c)}
              onOpenSuggestedTasks={(c) => {
                const targetDepts = c.categories && c.categories.length > 0 ? c.categories : ['Transport'];
                const addedDepts: string[] = [];
                targetDepts.forEach((dept) => {
                  if (dept && dept !== 'Other / Unclassified') {
                    const hasTasks = c.tasks.some((t) => t.dept === dept);
                    if (!hasTasks) {
                      const generated = generateTasksForDepartment(c, dept);
                      if (generated.length > 0) {
                        c.tasks.push(...generated);
                        addedDepts.push(dept);
                      }
                    }
                  }
                });
                if (addedDepts.length > 0) {
                  logActivity(c, currentUser.name, 'Tasks', `Workflow tasks added for ${addedDepts.join(', ')}`);
                  setCases([...cases]);
                  toast(`Generated template tasks for ${addedDepts.join(', ')}`, 'good');
                } else {
                  toast('All template tasks for active departments are already in place');
                }
              }}
              onOpenAddTask={(c) => setAddTaskCase(c)}
              onOpenConfirmClassification={(c) => {
                c.intake = false;
                c.lifecycle = 'Active';
                logActivity(c, currentUser.name, 'System', 'Classification confirmed');
                setCases([...cases]);
                toast('Work generated from templates', 'good');
              }}
              onOpenConvertModal={(c) => {
                c.caseClass = 'Confirmed Order';
                c.accepted = false;
                logActivity(c, currentUser.name, 'System', 'Inquiry converted to Confirmed Order');
                setCases([...cases]);
                toast('Converted to Confirmed Order', 'good');
              }}
              onSimulateReply={handleSimulateReply}
              onSimulateAcceptance={handleSimulateAcceptance}
              onSaveField={handleSaveField}
              onAddNote={handleAddNote}
              onSaveHeader={handleSaveHeader}
              onCompleteCase={handleCompleteCase}
              toast={toast}
            />
          )}

          {section === 'insights' && (() => {
            const onDrillDown = (target: {
              ops: OpsTab;
              f?: string;
              status?: string;
              classification?: string;
              comm?: string;
              q?: string;
              dept?: string;
              case?: string;
            }) => {
              setSection('ops');
              setOpsTab(target.ops);
              if (target.dept) setWorkDeptFilter(target.dept);
              if (target.q) setSearchCustomer(target.q);
              if (target.status) setCaseStatusFilter(target.status);
              if (target.classification) setCaseClassificationFilter(target.classification);
              if (target.comm) setCaseCommFilter(target.comm);
              if (target.case) handleOpenCase(target.case);
            };
            if (insTab === 'kpis') return <KpiDashboardView cases={cases} onDrillDown={onDrillDown} toast={toast} />;
            if (insTab === 'overview') return <OperationsDashboardView cases={cases} onDrillDown={onDrillDown} />;
            return <PerformanceView cases={cases} onDrillDown={onDrillDown} />;
          })()}

          {section === 'admin' && (
            <AdminView admTab={admTab} />
          )}
        </main>
        </div>
      </div>
      </UserProvider>

      <ModalsAndDrawers
        selectedTaskInfo={selectedTaskInfo}
        onCloseTaskDrawer={() => setSelectedTaskInfo(null)}
        onTaskAction={handleTaskAction}
        onReassignTask={(caseId, taskId, newAssignee) => {
          setCases(
            cases.map((c) => {
              if (c.id !== caseId) return c;
              const t = c.tasks.find((x) => x.id === taskId);
              if (t) {
                t.assignee = newAssignee;
                logActivity(c, currentUser.name, 'Tasks', `Task "${t.title}" reassigned to ${newAssignee || 'Unassigned'}`);
              }
              return { ...c };
            })
          );
          toast(`Reassigned to ${newAssignee || 'Nobody'}`);
        }}
        onChangeDueTask={(caseId, taskId, newDue) => {
          setCases(
            cases.map((c) => {
              if (c.id !== caseId) return c;
              const t = c.tasks.find((x) => x.id === taskId);
              if (t) {
                t.due = newDue;
                t.timing = 'On Track';
                logActivity(c, currentUser.name, 'Tasks', `Due time changed for "${t.title}"`);
              }
              return { ...c };
            })
          );
          toast('Due time updated');
        }}
        onAddTaskNote={(caseId, taskId, text) => {
          setCases(
            cases.map((c) => {
              if (c.id !== caseId) return c;
              const t = c.tasks.find((x) => x.id === taskId);
              if (t) {
                t.notes = t.notes || [];
                t.notes.push({ by: currentUser.name, time: 'Just now', text });
                logActivity(c, currentUser.name, 'Tasks', `Note added to "${t.title}"`);
              }
              return { ...c };
            })
          );
          toast('Note added');
        }}
        onOpenCase={handleOpenCase}
        selectedMsgId={selectedMsgId}
        onCloseMsgDrawer={() => setSelectedMsgId(null)}
        onOpenClassify={(m) => {
          setSelectedMsgId(null);
          setClassifyMsg(m);
        }}
        onOpenMatch={(m) => {
          setSelectedMsgId(null);
          setMatchMsg(m);
        }}
        classifyMsg={classifyMsg}
        onCloseClassify={() => setClassifyMsg(null)}
        onConfirmClassify={handleConfirmClassify}
        onSkipMsg={handleSkipMsg}
        matchMsg={matchMsg}
        onCloseMatch={() => setMatchMsg(null)}
        onConfirmMatch={handleConfirmMatch}
        opterCase={opterCase}
        onCloseOpter={() => setOpterCase(null)}
        onConfirmOpter={handleConfirmOpter}
        composerData={composerData}
        onCloseComposer={() => setComposerData(null)}
        onSendEmail={handleSendEmail}
        addTaskCase={addTaskCase}
        onCloseAddTask={() => setAddTaskCase(null)}
        onSaveNewTask={(c, taskData) => {
          c.tasks.push({
            id: `T${c.tasks.length + 1}`,
            wi: c.workItems[0]?.id || 'wi1',
            title: taskData.title,
            dept: taskData.dept,
            assignee: taskData.assignee,
            status: 'To Do',
            readiness: 'Ready',
            priority: taskData.priority,
            due: taskData.due,
            timing: 'On Track',
            milestone: taskData.milestone
          });
          logActivity(c, currentUser.name, 'Tasks', `Task "${taskData.title}" added`);
          setAddTaskCase(null);
          setCases([...cases]);
          toast('Task added');
        }}
        isDemoOpen={isDemoOpen}
        onCloseDemo={() => setIsDemoOpen(false)}
        onRunJourney={handleRunJourney}
        isSignOutPrompt={isSignOutPrompt}
        onCloseSignOut={() => setIsSignOutPrompt(false)}
        onConfirmSignOut={() => {
          try {
            localStorage.removeItem('aa-session');
          } catch {}
          setIsLoggedIn(false);
          setIsSignOutPrompt(false);
          toast('Signed out');
        }}
        cases={cases}
        messages={messages}
      />

      {/* Toasts */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind || ''}`}>
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
