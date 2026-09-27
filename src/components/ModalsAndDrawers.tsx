import React, { useState, useEffect } from 'react';
import { CaseItem, Task, InboxMessage } from '../types';
import { AiIcon, DocIcon, ClipIcon, MarkLogo } from '../icons';
import { USERS, DEPTS, CATEGORIES, CASE_CLASSES, CUSTOMERS, MAILBOXES, MSG_FILES, TEMPLATES } from '../data';
import { useCurrentUser } from '../UserContext';

interface ModalsAndDrawersProps {
  // Task Drawer
  selectedTaskInfo: { caseId: string; taskId: string } | null;
  onCloseTaskDrawer: () => void;
  onTaskAction: (caseId: string, taskId: string, action: 'take' | 'start' | 'complete') => void;
  onReassignTask: (caseId: string, taskId: string, newAssignee: string | null) => void;
  onChangeDueTask: (caseId: string, taskId: string, newDue: string) => void;
  onAddTaskNote: (caseId: string, taskId: string, text: string) => void;
  onOpenCase: (id: string, tab?: string) => void;

  // Message Drawer
  selectedMsgId: string | null;
  onCloseMsgDrawer: () => void;
  onOpenClassify: (m: InboxMessage) => void;
  onOpenMatch: (m: InboxMessage) => void;

  // Classify Modal
  classifyMsg: InboxMessage | null;
  onCloseClassify: () => void;
  onConfirmClassify: (m: InboxMessage, payload: { customer: string; cats: string[]; cls: string; prio: string }) => void;
  onSkipMsg: (m: InboxMessage, reason: string) => void;

  // Match Modal
  matchMsg: InboxMessage | null;
  onCloseMatch: () => void;
  onConfirmMatch: (m: InboxMessage, targetCaseId: string) => void;

  // Opter Modal
  opterCase: CaseItem | null;
  onCloseOpter: () => void;
  onConfirmOpter: (c: CaseItem) => void;

  // Composer Modal
  composerData: { c: CaseItem; kind: string } | null;
  onCloseComposer: () => void;
  onSendEmail: (c: CaseItem, to: string, from: string, subj: string, body: string, kind: string) => void;

  // Add Task Modal
  addTaskCase: CaseItem | null;
  onCloseAddTask: () => void;
  onSaveNewTask: (c: CaseItem, taskData: any) => void;

  // Demo Modal
  isDemoOpen: boolean;
  onCloseDemo: () => void;
  onRunJourney: (key: string) => void;

  // Sign out modal
  isSignOutPrompt: boolean;
  onCloseSignOut: () => void;
  onConfirmSignOut: () => void;

  cases: CaseItem[];
  messages: InboxMessage[];
}

export const ModalsAndDrawers: React.FC<ModalsAndDrawersProps> = ({
  selectedTaskInfo,
  onCloseTaskDrawer,
  onTaskAction,
  onReassignTask,
  onChangeDueTask,
  onAddTaskNote,
  onOpenCase,
  selectedMsgId,
  onCloseMsgDrawer,
  onOpenClassify,
  onOpenMatch,
  classifyMsg,
  onCloseClassify,
  onConfirmClassify,
  onSkipMsg,
  matchMsg,
  onCloseMatch,
  onConfirmMatch,
  opterCase,
  onCloseOpter,
  onConfirmOpter,
  composerData,
  onCloseComposer,
  onSendEmail,
  addTaskCase,
  onCloseAddTask,
  onSaveNewTask,
  isDemoOpen,
  onCloseDemo,
  onRunJourney,
  isSignOutPrompt,
  onCloseSignOut,
  onConfirmSignOut,
  cases,
  messages
}) => {
  const currentUser = useCurrentUser();
  // Reassign / Due submodals for task
  const [isReassigning, setIsReassigning] = useState(false);
  const [newAssignee, setNewAssignee] = useState('');
  const [isChangingDue, setIsChangingDue] = useState(false);
  const [newDue, setNewDue] = useState('');
  const [taskNoteText, setTaskNoteText] = useState('');

  // Message drawer inline editing state
  const [msgCust, setMsgCust] = useState('');
  const [msgCats, setMsgCats] = useState<string[]>(['Transport']);
  const [msgType, setMsgType] = useState('New Transport Order');
  const [msgPrio, setMsgPrio] = useState('Normal');
  const [drawerMode, setDrawerMode] = useState<'create' | 'link'>('create');
  const [linkCaseSearch, setLinkCaseSearch] = useState('');
  const [selectedCaseToLink, setSelectedCaseToLink] = useState('');

  // Classification modal state
  const [clCust, setClCust] = useState('');
  const [clCats, setClCats] = useState<string[]>(['Transport']);
  const [clCls, setClCls] = useState('Confirmed Order');
  const [clPrio, setClPrio] = useState('Normal');
  const [clSkipWhy, setClSkipWhy] = useState('Not a customer request');

  // Match modal state
  const [matchSearch, setMatchSearch] = useState('');
  const [selectedCaseIdToMatch, setSelectedCaseIdToMatch] = useState<string | null>(null);

  // Add task modal state
  const [atTitle, setAtTitle] = useState('');
  const [atDept, setAtDept] = useState('Transport');
  const [atUser, setAtUser] = useState('');
  const [atPrio, setAtPrio] = useState('Normal');
  const [atDue, setAtDue] = useState('Today 16:00');
  const [atDep, setAtDep] = useState('');
  const [atMs, setAtMs] = useState(false);

  // Composer fields
  const [cTo, setCTo] = useState('');
  const [cFrom, setCFrom] = useState('transport@aalogistik.se');
  const [cSubj, setCSubj] = useState('');
  const [cBody, setCBody] = useState('');
  const [composerFormat, setComposerFormat] = useState<string>('ack');

  // Task drawer mention state
  const [taskMentionQuery, setTaskMentionQuery] = useState<string | null>(null);

  const getTemplateContent = (c: CaseItem, kind: string) => {
    const first = c.contact.split(' ')[0] || 'Customer';
    const missing = c.data.flatMap((g) => g.fields).filter((f) => f.rev === 'Missing').map((f) => f.k);
    const conflict = c.data.flatMap((g) => g.fields).find((f) => f.rev === 'Conflict Detected');
    const opter = (c.records.find((r) => r.type === 'Opter order') || {}).number;

    if (kind === 'ack') {
      return {
        subj: `We have received your request — Case ${c.id}`,
        body: `Hello ${first},\n\nThank you for reaching out to AA Logistik. We have registered your request (Case ref: ${c.id}) and our operations team is reviewing the transport details now.\n\nWe will come back to you shortly with confirmed planning.\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations\ntransport@aalogistik.se`
      };
    }
    if (kind === 'missing') {
      return {
        subj: `Additional information required for transport request — Case ${c.id}`,
        body: `Hello ${first},\n\nThank you for your order request. Before we can confirm the booking and assign a carrier slot, please provide the following details:\n${missing.length > 0 ? missing.map((m) => `• ${m}`).join('\n') : '• Precise pickup time window and dock instructions'}${conflict ? `\n• Delivery address conflict detected: please confirm ${conflict.conflict?.a.split(' — ')[0]} vs ${conflict.conflict?.b.split(' — ')[0]}` : ''}\n\nPlease reply directly to this email at your earliest convenience so we can avoid delay.\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations`
      };
    }
    if (kind === 'confirm') {
      return {
        subj: `Order Confirmation — Case ${c.id}${opter ? ` (Opter ${opter})` : ''}`,
        body: `Hello ${first},\n\nWe are pleased to confirm that your shipment has been booked and planned in our system.\n\nOrder details:\n• Case reference: ${c.id}\n${opter ? `• Opter order number: ${opter}\n` : ''}• Route: ${c.title}\n• Status: Planned\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations`
      };
    }
    if (kind === 'progress') {
      return {
        subj: `Shipment Progress Update — Case ${c.id}`,
        body: `Hello ${first},\n\nThis is an operational update regarding your shipment (${c.title}).\n\nThe vehicle is on schedule and handling is proceeding according to plan.\n\nWe will keep you informed of any further milestones.\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations`
      };
    }
    if (kind === 'delay') {
      return {
        subj: `Timing Notification / Delay Advisory — Case ${c.id}`,
        body: `Hello ${first},\n\nWe want to notify you proactively that the scheduled timing for ${c.title} is at risk of delay due to traffic / loading dock congestion.\n\nOur dispatch team is actively coordinating with the carrier to minimize impact, and we will confirm an updated ETA shortly.\n\nWe apologize for any inconvenience.\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations`
      };
    }
    if (kind === 'done') {
      return {
        subj: `Shipment Completed — Case ${c.id}`,
        body: `Hello ${first},\n\nThe final delivery for order ${c.title} (Case ${c.id}) has been completed successfully.\n\nThank you for choosing AA Logistik. Please let us know if you require consignment notes or proof of delivery.\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations`
      };
    }
    // Manual / Blank
    return {
      subj: `Regarding your request — Case ${c.id}`,
      body: `Hello ${first},\n\n\n\nKind regards,\n${currentUser.name}\nAA Logistik Operations`
    };
  };

  // Sync composer initial text when composerData changes
  React.useEffect(() => {
    if (composerData) {
      const { c, kind } = composerData;
      setCTo(c.email);
      setCFrom('transport@aalogistik.se');
      setComposerFormat(kind || 'ack');
      const t = getTemplateContent(c, kind || 'ack');
      setCSubj(t.subj);
      setCBody(t.body);
    }
  }, [composerData]);

  const handleSelectTemplate = (kind: string) => {
    if (!composerData) return;
    setComposerFormat(kind);
    const t = getTemplateContent(composerData.c, kind);
    setCSubj(t.subj);
    setCBody(t.body);
  };

  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@[A-ZÅÄÖa-zåäö]+ [A-ZÅÄÖa-zåäö]+)/g);
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} className="mention" style={{ color: 'var(--blue)', fontWeight: 600, background: 'var(--blue-soft)', padding: '1px 5px', borderRadius: 4 }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const activeTaskCase = selectedTaskInfo ? cases.find((c) => c.id === selectedTaskInfo.caseId) : null;
  const activeTask = activeTaskCase ? activeTaskCase.tasks.find((t) => t.id === selectedTaskInfo?.taskId) : null;
  const activeMsg = selectedMsgId ? messages.find((m) => m.id === selectedMsgId) : null;

  useEffect(() => {
    if (activeMsg) {
      setMsgCust(activeMsg.customer || 'ABB Robotics');

      // Determine initial categories from activeMsg.ai or intent
      const initialCats: string[] = [];
      const aiText = (activeMsg.ai || '').toLowerCase();
      CATEGORIES.forEach((cat) => {
        if (cat.name !== 'Other / Unclassified' && aiText.includes(cat.name.toLowerCase())) {
          initialCats.push(cat.name);
        }
      });
      if (activeMsg.intent && Array.isArray(activeMsg.intent)) {
        activeMsg.intent.forEach((int) => {
          const matchCat = CATEGORIES.find((c) => c.name.toLowerCase() === int.toLowerCase());
          if (matchCat && !initialCats.includes(matchCat.name)) {
            initialCats.push(matchCat.name);
          }
        });
      }
      setMsgCats(initialCats.length > 0 ? initialCats : ['Transport']);

      if (aiText.includes('change') || aiText.includes('existing')) {
        setMsgType('Change Request');
      } else if (aiText.includes('inquiry')) {
        setMsgType('Inquiry');
      } else if (aiText.includes('complaint') || aiText.includes('deviation')) {
        setMsgType('Complaint / Deviation');
      } else {
        setMsgType('Confirmed Order');
      }

      setMsgPrio(activeMsg.priority || 'Normal');

      // Initialize link case selection, but always open on Classification &
      // Department first — a possible match is offered as a banner there, not
      // a takeover, so the reader always sees classification + possible tasks.
      const defaultMatchId = activeMsg.match || activeMsg.caseId || '';
      setSelectedCaseToLink(defaultMatchId || (cases[0]?.id || ''));
      setLinkCaseSearch('');
      setDrawerMode('create');
    }
  }, [activeMsg?.id]);

  const hasPossibleMatch = Boolean(
    activeMsg && (
      activeMsg.match ||
      activeMsg.caseId ||
      (activeMsg.orderRef && cases.some(c => c.records.some(r => r.number === activeMsg.orderRef) || c.data.flatMap(g => g.fields).some(f => f.v.includes(activeMsg.orderRef!)))) ||
      (activeMsg.state === 'Possible Existing Case' && activeMsg.match)
    )
  );

  const matchedCase = activeMsg
    ? (activeMsg.match ? cases.find(c => c.id === activeMsg.match) : (activeMsg.caseId ? cases.find(c => c.id === activeMsg.caseId) : null))
    : null;

  const filteredCasesForLink = cases.filter((c) => {
    const q = linkCaseSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.id.toLowerCase().includes(q) ||
      (c.displayId || '').toLowerCase().includes(q) ||
      c.customer.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.records.some((r) => r.number.toLowerCase().includes(q))
    );
  });

  // Task templates that would fire for the categories + case type currently
  // selected in the popup — this is what makes "possible tasks" live and
  // holistic rather than a guess: it's the same TEMPLATES data Administration
  // > Task templates manages, matched the same way case creation matches it.
  const matchingTemplates = activeMsg
    ? TEMPLATES.filter(
        (t) => t.active && msgCats.includes(t.cat) && t.cls === msgType && (!t.customer || t.customer === (msgCust || activeMsg.customer))
      )
    : [];
  const possibleTasks: Array<{ title: string; dept: string; priority: string; due: string; milestone: boolean; customerSpecific: boolean; cond?: string }> = [];
  {
    const seen = new Set<string>();
    matchingTemplates.forEach((t) => {
      t.tasks.forEach((task: any) => {
        const key = `${task.d}|${task.t}`;
        if (seen.has(key)) return;
        seen.add(key);
        possibleTasks.push({
          title: task.t,
          dept: task.d,
          priority: task.p,
          due: task.due,
          milestone: !!task.ms,
          customerSpecific: task.type === 'Customer-specific',
          cond: task.cond
        });
      });
    });
  }

  return (
    <>
      {/* Scrim */}
      <div
        className={`scrim ${selectedTaskInfo || selectedMsgId || classifyMsg || matchMsg || opterCase || composerData || addTaskCase || isDemoOpen || isSignOutPrompt ? 'on' : ''}`}
        onClick={() => {
          onCloseTaskDrawer();
          onCloseMsgDrawer();
          onCloseClassify();
          onCloseMatch();
          onCloseOpter();
          onCloseComposer();
          onCloseAddTask();
          onCloseDemo();
          onCloseSignOut();
        }}
      />

      {/* Task Drawer */}
      <aside className={`drawer ${selectedTaskInfo && activeTask ? 'on' : ''}`}>
        {activeTask && activeTaskCase && (
          <>
            <div className="drawer-head">
              <div>
                <div className="label">
                  <span className="mono" style={{ fontWeight: 700 }}>#{activeTaskCase.id}</span> · {activeTaskCase.customer}
                </div>
                <h3 style={{ marginTop: 3 }}>{activeTask.title}</h3>
              </div>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseTaskDrawer}>✕</button>
            </div>
            <div className="drawer-body">
              <div className="stack">
                <div className="row wrap">
                  <span className={`chip ${activeTask.status === 'Done' ? 'green' : activeTask.status === 'In Progress' ? 'blue' : ''}`}>
                    {activeTask.status}
                  </span>
                  <span className="chip">{activeTask.readiness}</span>
                  <span className="chip plain">{activeTask.priority}</span>
                  {activeTask.milestone && <span className="chip blue">Customer-visible</span>}
                </div>

                <div className="card">
                  <div className="card-body" style={{ padding: '8px 14px' }}>
                    <div className="kv"><span className="label">Department</span><span>{activeTask.dept}</span></div>
                    <div className="kv"><span className="label">Assignee</span><span>{activeTask.assignee || 'Unassigned'}</span></div>
                    <div className="kv"><span className="label">Due</span><span>{activeTask.due}</span></div>
                    <div className="kv"><span className="label">Completed</span><span>{activeTask.done || '—'}</span></div>
                  </div>
                </div>

                {/* Internal notes */}
                <div className="card">
                  <div className="card-head"><h3>Internal note</h3></div>
                  <div className="card-body">
                    <div className="mentionwrap">
                      <textarea
                        rows={2}
                        style={{ width: '100%', fontSize: 12.5, padding: 8, border: '1px solid var(--line)', borderRadius: 5, boxSizing: 'border-box' }}
                        placeholder="Add a note for colleagues. Type @ to mention someone."
                        value={taskNoteText}
                        onChange={(e) => {
                          setTaskNoteText(e.target.value);
                          const m = e.target.value.match(/@(\w*)$/);
                          if (m) setTaskMentionQuery(m[1].toLowerCase());
                          else setTaskMentionQuery(null);
                        }}
                      />
                      {taskMentionQuery !== null && (
                        <div className="mention-pop on">
                          <div className="mh2">Mention a colleague — they will be notified</div>
                          {USERS.filter((u) => u.name.toLowerCase().includes(taskMentionQuery)).map((u) => (
                            <div
                              key={u.name}
                              className="mention-opt"
                              onClick={() => {
                                setTaskNoteText(taskNoteText.replace(/@(\w*)$/, `@${u.name} `));
                                setTaskMentionQuery(null);
                              }}
                            >
                              <span className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{u.init}</span>
                              <div>
                                <div className="cell-main">{u.name}</div>
                                <div className="cell-sub">{u.role} · {u.dept}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="row" style={{ marginTop: 7, gap: 8, alignItems: 'center' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          if (!taskNoteText.trim()) return;
                          onAddTaskNote(activeTaskCase.id, activeTask.id, taskNoteText);
                          setTaskNoteText('');
                          setTaskMentionQuery(null);
                        }}
                      >
                        Add note
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => {
                          setTaskNoteText((prev) => (prev ? prev + ' @' : '@'));
                          setTaskMentionQuery('');
                        }}
                      >
                        @ Mention
                      </button>
                      <span className="tiny muted">Colleagues will be notified.</span>
                    </div>
                    {activeTask.notes && activeTask.notes.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        {activeTask.notes.map((n, i) => (
                          <div key={i} className="small" style={{ padding: '6px 0', borderTop: '1px dashed var(--line-2)' }}>
                            <b>{n.by}</b> <span className="muted tiny">{n.time}</span>
                            <div style={{ marginTop: 2 }}>{renderTextWithMentions(n.text)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="drawer-foot">
              {activeTask.status !== 'Done' && !activeTask.assignee && (
                <button className="btn" onClick={() => onTaskAction(activeTaskCase.id, activeTask.id, 'take')}>
                  Take task
                </button>
              )}
              {activeTask.status === 'To Do' && (
                <button className="btn btn-primary" onClick={() => onTaskAction(activeTaskCase.id, activeTask.id, 'start')}>
                  Start
                </button>
              )}
              {activeTask.status === 'In Progress' && (
                <button className="btn btn-primary" onClick={() => onTaskAction(activeTaskCase.id, activeTask.id, 'complete')}>
                  Complete
                </button>
              )}
              <button
                className="btn"
                onClick={() => {
                  setNewAssignee(activeTask.assignee || '');
                  setIsReassigning(true);
                }}
              >
                Reassign
              </button>
              <button
                className="btn"
                onClick={() => {
                  setNewDue(activeTask.due);
                  setIsChangingDue(true);
                }}
              >
                Change due time
              </button>
              <button
                className="btn"
                onClick={() => {
                  onCloseTaskDrawer();
                  onOpenCase(activeTaskCase.id, 'work');
                }}
              >
                Open full case
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Email Popup — email, classification, create/link case and the resulting
          possible tasks, all in one view instead of a side drawer. */}
      <div className={`modal ${selectedMsgId && activeMsg ? 'on' : ''}`}>
        <div className="modal-card" style={{ width: 'min(980px, 96vw)' }}>
        {activeMsg && (
          <>
            <div className="modal-head" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="chip blue tiny font-medium">Customer Email</span>
                  <span className="mono tiny muted">{activeMsg.date} · {activeMsg.time}</span>
                  <span className="tiny muted">·</span>
                  <span className="tiny" style={{ color: 'var(--ink-2)' }}>Routed to <b>{activeMsg.mailbox}</b></span>
                </div>
                <h3 style={{ fontSize: 15.5, margin: 0, lineHeight: 1.35, wordBreak: 'break-word' }}>
                  {activeMsg.subject}
                </h3>
              </div>
              <button className="x" onClick={onCloseMsgDrawer} title="Close" style={{ marginLeft: 12 }}>✕</button>
            </div>

            <div className="modal-body" style={{ background: '#F8FAFC', maxHeight: '76vh', overflow: 'auto' }}>
              <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'start' }}>
                <div className="stack" style={{ gap: 14 }}>
                {/* Executive Email Reader Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Sender Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderBottom: '1px solid #EDF2F7',
                      background: '#FFFFFF'
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        color: '#4338CA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12.5,
                        flexShrink: 0
                      }}
                    >
                      {activeMsg.customer.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>
                          {activeMsg.customer}
                        </span>
                        <span style={{ fontSize: 11.5, color: '#64748B' }}>
                          &lt;{activeMsg.sender}&gt;
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                        To: <span style={{ color: '#334155' }}>{activeMsg.mailbox}</span>
                      </div>
                    </div>
                    <span className={`chip tiny ${activeMsg.priority === 'High' || activeMsg.priority === 'Urgent' ? 'red' : 'plain'}`}>
                      {activeMsg.priority || 'Normal'} priority
                    </span>
                  </div>

                  {/* Clean Readable Email Body */}
                  <div
                    style={{
                      padding: '16px',
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: '#1E293B',
                      whiteSpace: 'pre-line',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {activeMsg.body}
                  </div>

                  {/* Attachments Section if any */}
                  {MSG_FILES[activeMsg.id] && MSG_FILES[activeMsg.id].length > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#F8FAFC',
                        borderTop: '1px solid #EDF2F7'
                      }}
                    >
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                        Attachments ({MSG_FILES[activeMsg.id].length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {MSG_FILES[activeMsg.id].map(([name, size, type, status], i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '6px 10px',
                              minWidth: 180,
                              flex: '1 1 calc(50% - 8px)'
                            }}
                          >
                            <span className="itile violet" style={{ width: 24, height: 24, flexShrink: 0 }}>
                              <DocIcon />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {name}
                              </div>
                              <div style={{ fontSize: 10.5, color: '#64748B' }}>
                                {type} · {size}
                              </div>
                            </div>
                            <span className="chip green tiny" style={{ fontSize: 9.5, padding: '1px 4px' }}>{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>

                <div className="stack" style={{ gap: 14 }}>
                {/* Possible match — shown only when one is actually detected. The default
                    path is always "classify and create a case" below; this is the
                    alternative, offered rather than forced. */}
                {hasPossibleMatch && drawerMode !== 'link' && (
                  <div
                    style={{
                      background: '#FFF9F0',
                      border: '1px solid #F6E4C6',
                      borderRadius: 8,
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#B06000', fontSize: 14 }}>⚠</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#8A4F06' }}>Possible Match Detected</span>
                      </div>
                      <span className="chip amber tiny" style={{ fontWeight: 600, fontSize: 10 }}>Existing Case</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {matchedCase
                        ? `Matches active case #${matchedCase.id} (${matchedCase.customer} · "${matchedCase.title}").`
                        : `This message references existing order/case #${activeMsg.match || activeMsg.orderRef}.`}
                    </p>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: '#FFFFFF', borderColor: '#D9822B', color: '#8A4F06', fontWeight: 600, fontSize: 11.5 }}
                      onClick={() => {
                        setSelectedCaseToLink(matchedCase?.id || activeMsg.match || activeMsg.orderRef || '');
                        setDrawerMode('link');
                      }}
                    >
                      Select and Link to Case #{matchedCase?.id || activeMsg.match || activeMsg.orderRef} →
                    </button>
                  </div>
                )}

                {drawerMode === 'create' && (
                  <>
                    {/* Classification & Department Section (Directly Editable in this Popup) */}
                    <div className="card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                      <div className="card-head" style={{ background: '#F8FAFC', padding: '10px 14px', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#0E6F74' }}><AiIcon /></span>
                          <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#17171D', margin: 0 }}>Classification & Department</h3>
                        </div>
                        <div className="spacer" />
                        {activeMsg.conf != null && (
                          <span className="chip green tiny" style={{ fontSize: 10.5 }}>{activeMsg.conf}% match</span>
                        )}
                      </div>
                      <div className="card-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                        {/* Customer */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7A7984', marginBottom: 4 }}>
                            Customer
                          </label>
                          <select
                            className="sel"
                            style={{ width: '100%', maxWidth: 'none', height: 34, fontSize: 12.5 }}
                            value={msgCust}
                            onChange={(e) => setMsgCust(e.target.value)}
                          >
                            {CUSTOMERS.map((cu) => (
                              <option key={cu} value={cu}>{cu}</option>
                            ))}
                          </select>
                        </div>

                        {/* Classification / Case Type */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7A7984', marginBottom: 4 }}>
                            Classification
                          </label>
                          <select
                            className="sel"
                            style={{ width: '100%', maxWidth: 'none', height: 34, fontSize: 12.5 }}
                            value={msgType}
                            onChange={(e) => setMsgType(e.target.value)}
                          >
                            {CASE_CLASSES.map((cl) => (
                              <option key={cl.name} value={cl.name}>{cl.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Department */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7A7984', marginBottom: 4 }}>
                            Department
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {CATEGORIES.filter((x) => x.name !== 'Other / Unclassified').map((cat) => {
                              const isSel = msgCats.includes(cat.name);
                              return (
                                <button
                                  key={cat.name}
                                  type="button"
                                  onClick={() => {
                                    if (isSel) {
                                      if (msgCats.length > 1) setMsgCats(msgCats.filter((x) => x !== cat.name));
                                    } else {
                                      setMsgCats([...msgCats, cat.name]);
                                    }
                                  }}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: 11.5,
                                    fontWeight: isSel ? 600 : 500,
                                    background: isSel ? '#0E6F74' : '#F4F3EF',
                                    color: isSel ? '#FFFFFF' : '#46454F',
                                    border: `1px solid ${isSel ? '#0C6368' : '#E6E3DC'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {cat.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Priority */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7A7984', marginBottom: 4 }}>
                            Priority
                          </label>
                          <select
                            className="sel"
                            style={{ width: '100%', maxWidth: 'none', height: 34, fontSize: 12.5 }}
                            value={msgPrio}
                            onChange={(e) => setMsgPrio(e.target.value)}
                          >
                            {['Normal', 'High', 'Urgent', 'Low'].map((p) => (
                              <option key={p} value={p}>{p} Priority</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Possible Tasks — live preview of what creating this case would generate,
                        from the same task templates Administration > Task templates manages. */}
                    <div className="card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                      <div className="card-head" style={{ background: '#F8FAFC', padding: '10px 14px', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#0E6F74' }}><ClipIcon /></span>
                          <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#17171D', margin: 0 }}>Possible Tasks</h3>
                        </div>
                        <div className="spacer" />
                        <span className="tiny muted" style={{ textAlign: 'right' }}>{msgCats.join(' + ')} · {msgType}</span>
                      </div>
                      <div className="card-body" style={{ padding: 12 }}>
                        {possibleTasks.length === 0 ? (
                          <div className="muted small" style={{ padding: '4px 2px' }}>
                            No task template is configured yet for {msgCats.join(' + ')} · {msgType}. Tasks can still be added by hand once the case exists.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {possibleTasks.map((pt, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '7px 9px',
                                  borderRadius: 6,
                                  background: '#FAFAFA',
                                  border: '1px solid #F0EFEA'
                                }}
                                title={pt.cond || undefined}
                              >
                                {pt.milestone && <span title="Customer-visible milestone" style={{ color: '#0E6F74', fontSize: 11 }}>◆</span>}
                                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: '#17171D', minWidth: 0 }}>
                                  {pt.title}
                                  {pt.customerSpecific && (
                                    <span className="chip amber tiny" style={{ marginLeft: 6, fontSize: 9.5, verticalAlign: 'middle' }}>
                                      {msgCust || activeMsg.customer}
                                    </span>
                                  )}
                                </span>
                                <span className="chip plain tiny" style={{ flexShrink: 0 }}>{pt.dept}</span>
                                <span className={`chip tiny ${pt.priority === 'Urgent' || pt.priority === 'High' ? 'red' : 'plain'}`} style={{ flexShrink: 0 }}>
                                  {pt.priority}
                                </span>
                                <span className="tiny muted num" style={{ flexShrink: 0, minWidth: 54, textAlign: 'right' }}>{pt.due}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {possibleTasks.length > 0 && (
                          <div className="tiny muted" style={{ marginTop: 8 }}>
                            {possibleTasks.length} task{possibleTasks.length === 1 ? '' : 's'} from {matchingTemplates.length} matching template{matchingTemplates.length === 1 ? '' : 's'} — generated automatically once the case is created.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manual fallback — offered quietly, only when nothing was auto-detected */}
                    {!hasPossibleMatch && (
                      <div className="tiny muted" style={{ textAlign: 'center' }}>
                        Not the right case?{' '}
                        <button type="button" className="btn-link tiny" onClick={() => setDrawerMode('link')}>
                          Link to an existing case instead
                        </button>
                      </div>
                    )}
                  </>
                )}

                {drawerMode === 'link' && (
                  /* Link to Existing Case Section */
                  <div className="card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <div className="card-head" style={{ background: '#F8FAFC', padding: '10px 14px', borderBottom: '1px solid #E2E8F0' }}>
                      <button
                        type="button"
                        className="btn-link tiny"
                        style={{ marginRight: 2 }}
                        onClick={() => setDrawerMode('create')}
                      >
                        ← Back
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#0E6F74', fontSize: 13 }}>🔗</span>
                        <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#17171D', margin: 0 }}>Select Existing Case to Link</h3>
                      </div>
                    </div>
                    <div className="card-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                      {hasPossibleMatch && (
                        <div style={{ background: '#FFF9F0', border: '1px solid #F6E4C6', borderRadius: 6, padding: '10px 12px', fontSize: 12 }}>
                          <div style={{ fontWeight: 700, color: '#8A4F06', marginBottom: 2 }}>
                            Suggested Match: Case #{matchedCase?.id || activeMsg.match || activeMsg.orderRef}
                          </div>
                          <div style={{ color: '#64748B', fontSize: 11.5, marginBottom: 6 }}>
                            {matchedCase ? `${matchedCase.customer} · "${matchedCase.title}"` : `Referenced in email subject/body`}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ background: '#FFFFFF', borderColor: '#D9822B', color: '#8A4F06', fontWeight: 600, fontSize: 11 }}
                            onClick={() => setSelectedCaseToLink(matchedCase?.id || activeMsg.match || activeMsg.orderRef || '')}
                          >
                            Use Suggested Case #{matchedCase?.id || activeMsg.match || activeMsg.orderRef}
                          </button>
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7A7984', marginBottom: 4 }}>
                          Search Other Cases
                        </label>
                        <input
                          className="sel"
                          style={{ width: '100%', maxWidth: 'none', height: 32, fontSize: 12 }}
                          placeholder="Search by case #, customer, title..."
                          value={linkCaseSearch}
                          onChange={(e) => setLinkCaseSearch(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7A7984', marginBottom: 4 }}>
                          Select Target Case ({filteredCasesForLink.length} available)
                        </label>
                        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 6, background: '#FAFAFA' }}>
                          {filteredCasesForLink.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                              No matching cases found
                            </div>
                          ) : (
                            filteredCasesForLink.map((c) => {
                              const isSelected = selectedCaseToLink === c.id;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => setSelectedCaseToLink(c.id)}
                                  style={{
                                    padding: '8px 10px',
                                    borderBottom: '1px solid #EDF2F7',
                                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                                    borderLeft: isSelected ? '3px solid #0E6F74' : '3px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700, fontSize: 12, color: isSelected ? '#0E6F74' : '#0F172A', fontFamily: 'monospace' }}>
                                      #{c.displayId || c.id}
                                    </span>
                                    <span className="chip plain tiny" style={{ fontSize: 9.5 }}>
                                      {c.lifecycle}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.customer}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.title}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            <div className="modal-foot" style={{ padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
              {drawerMode === 'create' ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}
                    onClick={() => {
                      onConfirmClassify(activeMsg, {
                        customer: msgCust || activeMsg.customer,
                        cats: msgCats.length > 0 ? msgCats : ['Transport'],
                        cls: msgType || 'Confirmed Order',
                        prio: msgPrio || 'Normal'
                      });
                      onCloseMsgDrawer();
                    }}
                  >
                    Create case
                  </button>

                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: 12.5 }}
                    onClick={() => setDrawerMode('link')}
                  >
                    Link to existing case
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!selectedCaseToLink}
                    style={{ flex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}
                    onClick={() => {
                      if (!selectedCaseToLink) return;
                      onConfirmMatch(activeMsg, selectedCaseToLink);
                      onCloseMsgDrawer();
                    }}
                  >
                    {selectedCaseToLink ? `Attach to Case #${selectedCaseToLink}` : 'Select a Case'}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: 12.5 }}
                    onClick={() => setDrawerMode('create')}
                  >
                    Back to Create Case
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn"
                style={{ fontSize: 12.5 }}
                onClick={onCloseMsgDrawer}
              >
                Close
              </button>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Classify Modal */}
      {classifyMsg && (
        <div className="modal on">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Classify this email</h3>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseClassify}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                <div className="card">
                  <div className="card-head"><h3>Email</h3></div>
                  <div className="card-body">
                    <div className="cell-main">{classifyMsg.subject}</div>
                    <div className="cell-sub">{classifyMsg.sender} · {classifyMsg.time}</div>
                    <div style={{ padding: '10px 0 0', whiteSpace: 'pre-line', color: 'var(--ink-2)', fontSize: 12.5 }}>
                      {classifyMsg.body}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head"><h3>Confirm or correct</h3></div>
                  <div className="card-body stack" style={{ gap: 11 }}>
                    <div>
                      <div className="label">Customer</div>
                      <select
                        className="sel"
                        style={{ width: '100%', maxWidth: 'none' }}
                        value={clCust || classifyMsg.customer}
                        onChange={(e) => setClCust(e.target.value)}
                      >
                        {CUSTOMERS.map((cu) => (
                          <option key={cu} value={cu}>{cu}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="label">Categories</div>
                      <div className="catpick">
                        {CATEGORIES.filter((x) => x.name !== 'Other / Unclassified').map((cat) => (
                          <label key={cat.name} className={clCats.includes(cat.name) ? 'on' : ''}>
                            <input
                              type="checkbox"
                              checked={clCats.includes(cat.name)}
                              onChange={(e) => {
                                if (e.target.checked) setClCats([...clCats, cat.name]);
                                else setClCats(clCats.filter((x) => x !== cat.name));
                              }}
                            />{' '}
                            {cat.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="label">Case class</div>
                      <select
                        className="sel"
                        style={{ width: '100%', maxWidth: 'none' }}
                        value={clCls}
                        onChange={(e) => setClCls(e.target.value)}
                      >
                        {CASE_CLASSES.map((cl) => (
                          <option key={cl.name} value={cl.name}>{cl.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="label">Priority</div>
                      <select
                        className="sel"
                        style={{ width: '100%', maxWidth: 'none' }}
                        value={clPrio}
                        onChange={(e) => setClPrio(e.target.value)}
                      >
                        {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-primary"
                onClick={() => {
                  onConfirmClassify(classifyMsg, {
                    customer: clCust || classifyMsg.customer,
                    cats: clCats.length > 0 ? clCats : ['Transport'],
                    cls: clCls,
                    prio: clPrio
                  });
                }}
              >
                Confirm and create case
              </button>
              <span className="skipgrp">
                <select className="sel" value={clSkipWhy} onChange={(e) => setClSkipWhy(e.target.value)}>
                  <option>Not a customer request</option>
                  <option>Duplicate of another email</option>
                  <option>Spam or newsletter</option>
                  <option>Already handled by phone</option>
                </select>
                <button className="btn" onClick={() => onSkipMsg(classifyMsg, clSkipWhy)}>
                  Skip — no case needed
                </button>
              </span>
              <button className="btn" onClick={onCloseClassify}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {matchMsg && (
        <div className="modal on">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Link this email to an existing case</h3>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseMatch}>✕</button>
            </div>
            <div className="modal-body">
              <div className="search" style={{ maxWidth: 'none', marginBottom: 12 }}>
                <input
                  placeholder="Search case number, customer, Opter number..."
                  value={matchSearch}
                  onChange={(e) => setMatchSearch(e.target.value)}
                />
              </div>

              <div className="tablewrap">
                <table className="t">
                  <thead>
                    <tr>
                      <th>Case</th>
                      <th>Customer</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {cases
                      .filter((c) =>
                        (c.id + c.customer + c.title).toLowerCase().includes(matchSearch.toLowerCase())
                      )
                      .slice(0, 6)
                      .map((c) => (
                        <tr
                          key={c.id}
                          aria-selected={selectedCaseIdToMatch === c.id}
                          onClick={() => setSelectedCaseIdToMatch(c.id)}
                        >
                          <td className="mono" style={{ fontWeight: 700 }}>#{c.id}</td>
                          <td>{c.customer}</td>
                          <td>{c.title}</td>
                          <td><span className="chip green">{c.lifecycle}</span></td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onConfirmMatch(matchMsg, c.id);
                              }}
                            >
                              Link
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={onCloseMatch}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Opter Order Modal */}
      {opterCase && (
        <div className="modal on">
          <div className="modal-card">
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MarkLogo height={22} style={{ maxWidth: 90 }} />
                <h3>Create transport order in Opter</h3>
              </div>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseOpter}>✕</button>
            </div>
            <div className="modal-body">
              <div className="tablewrap">
                <table className="t">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Source</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opterCase.data.flatMap((g) => g.fields).map((f) => (
                      <tr key={f.k}>
                        <td className="label">{f.k}</td>
                        <td>{f.v || <span className="chip amber">Missing</span>}</td>
                        <td className="tiny muted">{f.src}</td>
                        <td>
                          <span className={`chip ${f.rev === 'High Confidence' ? 'green' : 'amber'}`}>
                            {f.rev}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-primary" onClick={() => onConfirmOpter(opterCase)}>
                Create Opter order
              </button>
              <button className="btn" onClick={onCloseOpter}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {composerData && (
        <div className="modal on">
          <div className="modal-card" style={{ maxWidth: 680 }}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MarkLogo height={22} style={{ maxWidth: 90 }} />
                <h3>New Email — {composerData.c.customer}</h3>
              </div>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseComposer}>✕</button>
            </div>
            <div className="modal-body">
              <div className="stack" style={{ gap: 12 }}>
                {/* Predefined formats or write manually */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Choose predefined format or write manually:</span>
                  </div>
                  <div className="row wrap" style={{ gap: 6 }}>
                    {[
                      { key: 'ack', label: 'Acknowledge receipt' },
                      { key: 'missing', label: 'Ask for missing info' },
                      { key: 'confirm', label: 'Order confirmation' },
                      { key: 'progress', label: 'Progress update' },
                      { key: 'delay', label: 'Delay notice' },
                      { key: 'done', label: 'Completion update' },
                      { key: 'manual', label: '✍️ Write manually / Blank' }
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        className={`btn btn-sm ${composerFormat === f.key ? 'btn-primary' : ''}`}
                        style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 5 }}
                        onClick={() => handleSelectTemplate(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row" style={{ gap: 8 }}>
                  <span className="label" style={{ width: 65 }}>From</span>
                  <select
                    className="sel"
                    style={{ flex: 1, maxWidth: 'none' }}
                    value={cFrom}
                    onChange={(e) => setCFrom(e.target.value)}
                  >
                    {MAILBOXES.map((m) => (
                      <option key={m.id} value={m.addr}>{m.name} ({m.addr})</option>
                    ))}
                  </select>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="label" style={{ width: 65 }}>To</span>
                  <input
                    className="sel"
                    style={{ flex: 1, maxWidth: 'none' }}
                    value={cTo}
                    onChange={(e) => setCTo(e.target.value)}
                  />
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="label" style={{ width: 65 }}>Subject</span>
                  <input
                    className="sel"
                    style={{ flex: 1, maxWidth: 'none', fontWeight: 600 }}
                    value={cSubj}
                    onChange={(e) => setCSubj(e.target.value)}
                  />
                </div>
                <div>
                  <textarea
                    rows={11}
                    style={{
                      width: '100%',
                      fontSize: 13,
                      lineHeight: 1.65,
                      padding: '12px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    value={cBody}
                    onChange={(e) => setCBody(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-primary"
                onClick={() => onSendEmail(composerData.c, cTo, cFrom, cSubj, cBody, composerFormat)}
              >
                Send email
              </button>
              <button className="btn" onClick={onCloseComposer}>Cancel</button>
              <div style={{ flex: 1 }} />
              <span className="tiny muted">Direct outbound email to customer</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {addTaskCase && (
        <div className="modal on">
          <div className="modal-card narrow">
            <div className="modal-head">
              <h3>Add a task</h3>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseAddTask}>✕</button>
            </div>
            <div className="modal-body stack" style={{ gap: 9 }}>
              <div>
                <div className="label">Title</div>
                <input
                  className="sel"
                  style={{ width: '100%', maxWidth: 'none' }}
                  placeholder="What needs to be done"
                  value={atTitle}
                  onChange={(e) => setAtTitle(e.target.value)}
                />
              </div>
              <div className="row" style={{ gap: 9 }}>
                <div style={{ flex: 1 }}>
                  <div className="label">Department</div>
                  <select
                    className="sel"
                    style={{ width: '100%', maxWidth: 'none' }}
                    value={atDept}
                    onChange={(e) => setAtDept(e.target.value)}
                  >
                    {DEPTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label">Assignee</div>
                  <select
                    className="sel"
                    style={{ width: '100%', maxWidth: 'none' }}
                    value={atUser}
                    onChange={(e) => setAtUser(e.target.value)}
                  >
                    <option value="">Leave for department</option>
                    {USERS.map((u) => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row" style={{ gap: 9 }}>
                <div style={{ flex: 1 }}>
                  <div className="label">Priority</div>
                  <select
                    className="sel"
                    style={{ width: '100%', maxWidth: 'none' }}
                    value={atPrio}
                    onChange={(e) => setAtPrio(e.target.value)}
                  >
                    {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label">Due</div>
                  <input
                    className="sel"
                    style={{ width: '100%', maxWidth: 'none' }}
                    value={atDue}
                    onChange={(e) => setAtDue(e.target.value)}
                  />
                </div>
              </div>
              <label className="row small">
                <input
                  type="checkbox"
                  checked={atMs}
                  onChange={(e) => setAtMs(e.target.checked)}
                />{' '}
                Customer-visible milestone
              </label>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!atTitle.trim()) return;
                  onSaveNewTask(addTaskCase, {
                    title: atTitle,
                    dept: atDept,
                    assignee: atUser || null,
                    priority: atPrio,
                    due: atDue,
                    milestone: atMs
                  });
                  setAtTitle('');
                }}
              >
                Add task
              </button>
              <button className="btn" onClick={onCloseAddTask}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Journeys Modal */}
      {isDemoOpen && (
        <div className="modal on">
          <div className="modal-card">
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MarkLogo height={22} style={{ maxWidth: 90 }} />
                <h3>Demo journeys</h3>
              </div>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseDemo}>✕</button>
            </div>
            <div className="modal-body">
              <div className="small muted" style={{ marginBottom: 12 }}>
                Six short walk-throughs. Each one jumps to the right screen with the scenario already set up.
              </div>
              {[
                { k: 'j1', t: 'A clean transport order', d: 'Email in, understood, confirmed, order created, work running across three departments.' },
                { k: 'j2', t: 'The customer replied', d: 'Two fields were missing and an address conflicted. The customer’s reply lands on the case and fills them in.' },
                { k: 'j3', t: 'A change to existing work', d: 'A standalone email is matched to the running case, and a task to update Opter is proposed.' },
                { k: 'j4', t: 'Three departments, one case', d: 'Parallel and dependent work, with the warehouse seeing what is coming.' },
                { k: 'j5', t: 'An inquiry becomes an order', d: 'The customer accepts the quote and the same case continues as a confirmed order.' },
                { k: 'j6', t: 'When the AI fails', d: 'Processing fails on a scanned attachment and the email is still there, waiting for a person.' }
              ].map((j) => (
                <div key={j.k} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <div style={{ flex: 1 }}>
                    <div className="cell-main">{j.t}</div>
                    <div className="cell-sub">{j.d}</div>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => onRunJourney(j.k)}>
                    Start
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={onCloseDemo}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Modal */}
      {isSignOutPrompt && (
        <div className="modal on">
          <div className="modal-card narrow">
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MarkLogo height={22} style={{ maxWidth: 90 }} />
                <h3>Sign out?</h3>
              </div>
              <div style={{ flex: 1 }} />
              <button className="x" onClick={onCloseSignOut}>✕</button>
            </div>
            <div className="modal-body">
              <p className="small" style={{ margin: 0 }}>
                You are signed in as <b>{currentUser.name}</b>. Signing out returns you to the login page.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-primary" onClick={onConfirmSignOut}>Sign out</button>
              <button className="btn" onClick={onCloseSignOut}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
