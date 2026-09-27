import React, { useState } from 'react';
import { CaseItem, Task, CaseField, OpsTab, OrderItem } from '../types';
import {
  AiIcon,
  DocIcon,
  ClipIcon,
  TickIcon,
  MarkLogo,
  TabOverviewIcon,
  TabDataIcon,
  TabTasksIcon,
  TabConversationIcon,
  TabActivityIcon
} from '../icons';
import { DEPTS, USERS, CATEGORIES, CASE_CLASSES, CUSTOMERS, getCaseStatus, generateTasksForDepartment } from '../data';
import { OrderDetailsView } from './OrderDetailsView';

interface CaseWorkspaceProps {
  c: CaseItem;
  tab: string;
  setTab: (t: string) => void;
  onOpenTaskDrawer: (caseId: string, taskId: string) => void;
  onCompleteTask: (c: CaseItem, t: Task) => void;
  onOpenComposer: (c: CaseItem, draftKind: string) => void;
  onOpenOpterModal: (c: CaseItem) => void;
  onOpenSuggestedTasks: (c: CaseItem) => void;
  onOpenAddTask: (c: CaseItem) => void;
  onOpenConfirmClassification: (c: CaseItem) => void;
  onOpenConvertModal: (c: CaseItem) => void;
  onSimulateReply: () => void;
  onSimulateAcceptance: () => void;
  onSaveField: (c: CaseItem, f: CaseField, val: string) => void;
  onAddNote: (c: CaseItem, text: string, files: File[]) => void;
  onSaveHeader: (c: CaseItem, updated: Partial<CaseItem>) => void;
  onCompleteCase: (c: CaseItem) => void;
  opsTab?: OpsTab;
  onNavigateOps?: (tab: OpsTab) => void;
  toast?: (text: string, kind?: string) => void;
}

export const CaseWorkspace: React.FC<CaseWorkspaceProps> = ({
  c,
  tab,
  setTab,
  onOpenTaskDrawer,
  onCompleteTask,
  onOpenComposer,
  onOpenOpterModal,
  onOpenSuggestedTasks,
  onOpenAddTask,
  onOpenConfirmClassification,
  onOpenConvertModal,
  onSimulateReply,
  onSimulateAcceptance,
  onSaveField,
  onAddNote,
  onSaveHeader,
  onCompleteCase,
  opsTab,
  onNavigateOps,
  toast
}) => {
  const [isEditingHead, setIsEditingHead] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
  const [headTitle, setHeadTitle] = useState(c.title);
  const [headCust, setHeadCust] = useState(c.customer);
  const [headContact, setHeadContact] = useState(c.contact);
  const [headEmail, setHeadEmail] = useState(c.email);
  const [headPrio, setHeadPrio] = useState(c.priority);
  const [headCls, setHeadCls] = useState(c.caseClass);
  const [headComm, setHeadComm] = useState(c.comm.state);
  const [headCats, setHeadCats] = useState<string[]>(c.categories);

  // Global Order details editing & Items management
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [globalDraftValues, setGlobalDraftValues] = useState<Record<string, string>>({});
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [draftWeight, setDraftWeight] = useState(c.weight || '');

  const parseWeightKg = (w?: string): number => {
    if (!w) return 0;
    const num = parseFloat(w.replace(/\s+/g, '').replace(/[^\d.]/g, '')) || 0;
    return num;
  };

  const startGlobalEdit = () => {
    const drafts: Record<string, string> = {};
    c.data.forEach((g) => {
      g.fields.forEach((f) => {
        drafts[`${g.group}|${f.k}`] = f.v || (f.conflict ? f.conflict.a.split(' — ')[0] : '');
      });
    });
    setGlobalDraftValues(drafts);
    const existingItems =
      c.items && c.items.length > 0
        ? JSON.parse(JSON.stringify(c.items))
        : [
            {
              id: 'item-1',
              name: c.title || 'Standard Cargo Consignment',
              weight: c.weight || '1 200 kg',
              length: '120 cm',
              width: '80 cm',
              height: '135 cm',
              qty: 2,
              type: 'EUR Pallet',
              notes: 'Standard industrial packaging'
            }
          ];
    setDraftItems(existingItems);
    const itemsTotalKg = existingItems.reduce((acc: number, it: OrderItem) => acc + parseWeightKg(it.weight), 0);
    const initialWeight = itemsTotalKg > 0 ? `${itemsTotalKg.toLocaleString('sv-SE')} kg` : (c.weight || '');
    setDraftWeight(initialWeight);
    setIsGlobalEditing(true);
  };

  const cancelGlobalEdit = () => {
    setGlobalDraftValues({});
    setDraftItems([]);
    setIsGlobalEditing(false);
  };

  const saveGlobalEdit = () => {
    const itemsTotalKg = draftItems.reduce((acc, it) => acc + parseWeightKg(it.weight), 0);
    const finalWeight = itemsTotalKg > 0 ? `${itemsTotalKg.toLocaleString('sv-SE')} kg` : (draftWeight.trim() || c.weight || '');

    c.data.forEach((g) => {
      g.fields.forEach((f) => {
        const key = `${g.group}|${f.k}`;
        if (f.k.toLowerCase().includes('weight')) {
          onSaveField(c, f, finalWeight);
        } else {
          const val = globalDraftValues[key];
          if (val !== undefined) {
            const trimmed = val.trim();
            if (trimmed && (trimmed !== f.v || f.rev === 'Missing' || f.rev === 'Conflict Detected')) {
              onSaveField(c, f, trimmed);
            }
          }
        }
      });
    });
    c.items = [...draftItems];
    c.weight = finalWeight;
    onSaveHeader(c, { items: draftItems, weight: finalWeight });
    setIsGlobalEditing(false);
    setGlobalDraftValues({});
    setDraftItems([]);
  };

  const calcItemVolumeM3 = (length?: string, width?: string, height?: string, qty = 1): number => {
    const l = parseFloat((length || '').replace(/[^\d.]/g, '')) || 0;
    const w = parseFloat((width || '').replace(/[^\d.]/g, '')) || 0;
    const h = parseFloat((height || '').replace(/[^\d.]/g, '')) || 0;
    if (!l || !w || !h) return 0;
    return Number(((l * w * h * qty) / 1000000).toFixed(2));
  };

  const getFieldConfidence = (f: CaseField): { pct: number | null; label: string; tone: 'green' | 'blue' | 'amber' | 'red' } => {
    if (f.edited) {
      return { pct: 100, label: '100% · Verified', tone: 'green' };
    }
    if (f.rev === 'Missing') {
      return { pct: null, label: '—', tone: 'amber' };
    }
    if (f.conf !== undefined) {
      const p = f.conf;
      return { pct: p, label: `${p}%`, tone: p >= 90 ? 'green' : p >= 75 ? 'blue' : 'amber' };
    }
    if (f.rev === 'High Confidence') {
      const hash = f.k.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const pct = 92 + (hash % 7);
      return { pct, label: `${pct}%`, tone: 'green' };
    }
    if (f.rev === 'Review Recommended') {
      return { pct: 76, label: '76%', tone: 'amber' };
    }
    if (f.rev === 'Conflict Detected') {
      return { pct: 58, label: '58%', tone: 'red' };
    }
    return { pct: 90, label: '90%', tone: 'green' };
  };

  // Conversation & Communications state
  const [noteText, setNoteText] = useState('');
  const [noteFiles, setNoteFiles] = useState<File[]>([]);
  const [convFilter, setConvFilter] = useState<'all' | 'customer' | 'internal'>('all');
  const [actFilter, setActFilter] = useState('all');
  const [showConvSummary, setShowConvSummary] = useState(false);
  const [selectedMsgIdx, setSelectedMsgIdx] = useState<number>(0);
  const [commsSearch, setCommsSearch] = useState('');
  const [commsLayout, setCommsLayout] = useState<'split' | 'stream'>('split');
  const [showQuickNote, setShowQuickNote] = useState(false);

  // Mention popup state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const renderMessageBody = (body: string) => {
    const parts = body.split(/(@[A-ZÅÄÖa-zåäö]+ [A-ZÅÄÖa-zåäö]+)/g);
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span
          key={i}
          className="mention"
          style={{
            color: '#1D4ED8',
            fontWeight: 600,
            background: '#EFF6FF',
            padding: '1px 5px',
            borderRadius: 4
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const doneCount = c.tasks.filter((t) => t.status === 'Done').length;
  const wipCount = c.tasks.filter((t) => t.status === 'In Progress').length;
  const totalTasks = c.tasks.length;
  const pct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;
  const wipPct = totalTasks ? Math.round((wipCount / totalTasks) * 100) : 0;

  const DEPT_TONE: Record<string, string> = {
    Transport: '#0E6F74',
    Warehouse: '#2F7A4F',
    Packing: '#A1600B',
    'Freight Forwarding': '#6A4FC6',
    Finance: '#B3392F'
  };

  const dataState = () => {
    const f = c.data.flatMap((g) => g.fields);
    if (f.some((x) => x.rev === 'Missing')) return 'Missing Information';
    if (f.some((x) => x.rev === 'Conflict Detected')) return 'Conflict Detected';
    if (f.some((x) => x.rev === 'Review Recommended')) return 'Review Required';
    return c.records.some((r) => r.type === 'Opter order') ? 'Opter Created' : 'Ready for Opter';
  };

  // Attention items
  const attentionItems = () => {
    const out: Array<{ tone: string; t: string; d: string; btn: string; act: string }> = [];
    if (c.intake) {
      out.push({
        tone: 'amber',
        t: 'Classification not confirmed',
        d: 'Confirm the category and case class to generate the work for this request.',
        btn: 'Confirm classification',
        act: 'confirm'
      });
    }
    const f = c.data.flatMap((g) => g.fields);
    if (f.some((x) => x.rev === 'Missing')) {
      out.push({
        tone: 'amber',
        t: 'Required information is missing',
        d: f.filter((x) => x.rev === 'Missing').map((x) => x.k).join(', ') + ' — the Opter order cannot be created yet.',
        btn: 'Ask the customer',
        act: 'ask'
      });
    }
    if (f.some((x) => x.rev === 'Conflict Detected')) {
      out.push({
        tone: 'red',
        t: 'Conflicting information',
        d: 'The delivery address differs between the email and the attachment.',
        btn: 'Resolve in Order details',
        act: 'data'
      });
    }
    if (c.conditions.includes('At Risk')) {
      out.push({
        tone: 'red',
        t: 'Case is at risk',
        d: 'An urgent task is overdue and the same-day promise may not hold. A proactive update is recommended.',
        btn: 'Draft a delay update',
        act: 'delay'
      });
    }
    if (c.comm.state === 'Update Recommended') {
      out.push({
        tone: 'amber',
        t: 'Customer update recommended',
        d: 'A customer-visible milestone has moved since the last message.',
        btn: 'Draft a progress update',
        act: 'progress'
      });
    }
    if (c.comm.state === 'Response Required') {
      out.push(
        c.comm.lastOut
          ? {
            tone: 'amber',
            t: 'The customer replied — answer them',
            d: `Reply received ${c.comm.lastIn}. Last message from us: ${c.comm.lastOut}.`,
            btn: 'Draft a reply',
            act: 'progress'
          }
          : {
            tone: 'amber',
            t: 'Customer is waiting for a first reply',
            d: `Received ${c.comm.lastIn} — no answer sent yet.`,
            btn: 'Acknowledge receipt',
            act: 'ack'
          }
      );
    }
    if (c.caseClass === 'Inquiry' && c.accepted) {
      out.push({
        tone: 'blue',
        t: 'Customer accepted the quote',
        d: 'The same case can continue as a confirmed order without losing any history.',
        btn: 'Convert to confirmed order',
        act: 'convert'
      });
    }
    if (dataState() === 'Ready for Opter' && !c.records.some((r) => r.type === 'Opter order') && c.caseClass === 'Confirmed Order') {
      out.push({
        tone: 'blue',
        t: 'Ready for an Opter order',
        d: 'All required transport data is complete and reviewed.',
        btn: 'Review and create Opter order',
        act: 'opter'
      });
    }
    return out;
  };

  const attns = attentionItems();

  const handleAttnClick = (act: string) => {
    if (act === 'confirm') onOpenConfirmClassification(c);
    if (act === 'ask') onOpenComposer(c, 'missing');
    if (act === 'data') setTab('data');
    if (act === 'delay') onOpenComposer(c, 'delay');
    if (act === 'progress') onOpenComposer(c, 'progress');
    if (act === 'ack') onOpenComposer(c, 'ack');
    if (act === 'convert') onOpenConvertModal(c);
    if (act === 'opter') onOpenOpterModal(c);
  };

  // Save head edits
  const handleSaveHead = () => {
    // Generate any missing tasks for newly selected departments
    headCats.forEach((dept) => {
      if (dept && dept !== 'Other / Unclassified') {
        const hasTasks = c.tasks.some((t) => t.dept === dept);
        if (!hasTasks) {
          const generated = generateTasksForDepartment(c, dept);
          if (generated.length > 0) {
            c.tasks.push(...generated);
          }
        }
      }
    });

    onSaveHeader(c, {
      title: headTitle,
      customer: headCust,
      contact: headContact,
      email: headEmail,
      priority: headPrio as any,
      caseClass: headCls,
      comm: { ...c.comm, state: headComm as any },
      categories: headCats
    });
    setIsEditingHead(false);
  };

  // Group tasks by department for swimlanes
  const presentDepts = Array.from(new Set(c.tasks.map((t) => t.dept)));
  const allActiveDepts = Array.from(new Set([...c.categories, ...presentDepts])).filter(Boolean);
  const swimlaneDepts = DEPTS.filter((d) => allActiveDepts.includes(d)).concat(
    allActiveDepts.filter((d) => !DEPTS.includes(d))
  );

  const originLabel = opsTab === 'work' ? 'My Work' : opsTab === 'inbox' ? 'Inbox' : 'Cases';

  return (
    <>
      {/* In-page Breadcrumbs */}
      <nav className="page-breadcrumbs" aria-label="Breadcrumb">
        <button
          type="button"
          className="page-crumb-link"
          onClick={() => onNavigateOps?.('cases')}
          title="Back to Cases listing"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Cases
        </button>
        <span className="page-crumb-sep" aria-hidden="true">/</span>
        {opsTab && opsTab !== 'cases' && (
          <>
            <button
              type="button"
              className="page-crumb-link"
              onClick={() => onNavigateOps?.(opsTab)}
              title={`Back to ${originLabel}`}
            >
              {originLabel}
            </button>
            <span className="page-crumb-sep" aria-hidden="true">/</span>
          </>
        )}
        <div className="page-crumb-current">
          <span className="page-crumb-id" style={{ fontWeight: 700 }}>#{c.id}</span>
          <span className="page-crumb-sep" style={{ margin: '0 2px' }} aria-hidden="true">·</span>
          <span className="page-crumb-customer">{c.customer}</span>
        </div>
      </nav>

      {/* Header section */}
      {isEditingHead ? (
        <div className="casehead editing">
          <div className="top">
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="row wrap tiny muted">
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 700 }}>#{c.id}</span>
                <span>·</span>
                <span>opened {c.created}</span>
                <span className="chip blue">Editing case details</span>
              </div>
              <input
                className="sel htitle"
                id="heTitle"
                value={headTitle}
                onChange={(e) => setHeadTitle(e.target.value)}
              />
            </div>
            <div className="row wrap" style={{ gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSaveHead}>Save changes</button>
              <button className="btn" onClick={() => setIsEditingHead(false)}>Cancel</button>
            </div>
          </div>
          <div className="facts factgrid">
            <div className="fact">
              <div className="k">Customer</div>
              <div className="v">
                <select className="sel hedit" value={headCust} onChange={(e) => setHeadCust(e.target.value)}>
                  {CUSTOMERS.map((cu) => (
                    <option key={cu} value={cu}>{cu}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fact">
              <div className="k">Contact</div>
              <div className="v">
                <input className="sel hedit" value={headContact} onChange={(e) => setHeadContact(e.target.value)} />
              </div>
            </div>
            <div className="fact">
              <div className="k">Contact email</div>
              <div className="v">
                <input className="sel hedit" value={headEmail} onChange={(e) => setHeadEmail(e.target.value)} />
              </div>
            </div>
            <div className="fact">
              <div className="k">Priority</div>
              <div className="v">
                <select className="sel hedit" value={headPrio} onChange={(e) => setHeadPrio(e.target.value as any)}>
                  {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fact">
              <div className="k">Case class</div>
              <div className="v">
                <select className="sel hedit" value={headCls} onChange={(e) => setHeadCls(e.target.value)}>
                  {CASE_CLASSES.map((cl) => (
                    <option key={cl.name} value={cl.name}>{cl.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fact">
              <div className="k">Customer communication</div>
              <div className="v">
                <select className="sel hedit" value={headComm} onChange={(e) => setHeadComm(e.target.value as any)}>
                  {['Response Required', 'Acknowledged', 'Waiting for Customer', 'Update Recommended', 'Final Update Required', 'No Action Required'].map((cm) => (
                    <option key={cm} value={cm}>{cm}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fact" style={{ gridColumn: 'span 2' }}>
              <div className="flex items-center justify-between">
                <div className="k">Departments & Categories</div>
                <span className="text-[11px] text-[#0E6F74] font-medium">✓ Selecting a department auto-generates its workflow tasks</span>
              </div>
              <div className="v catpick" style={{ marginTop: 6 }}>
                {CATEGORIES.filter((x) => x.name !== 'Other / Unclassified').map((cat) => (
                  <label key={cat.name} className={headCats.includes(cat.name) ? 'on' : ''}>
                    <input
                      type="checkbox"
                      value={cat.name}
                      checked={headCats.includes(cat.name)}
                      onChange={(e) => {
                        if (e.target.checked) setHeadCats([...headCats, cat.name]);
                        else setHeadCats(headCats.filter((x) => x !== cat.name));
                      }}
                    />{' '}
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="casehead" style={{ marginBottom: 14 }}>
          {/* Row 1: Top Navigation & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EFEA]">
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#7A7984]">
              <button
                type="button"
                onClick={() => onNavigateOps?.('cases')}
                className="hover:text-[#0E6F74] transition-colors cursor-pointer text-[#7A7984]"
              >
                Cases
              </button>
              <span className="text-[#9CA3AF]">/</span>
              <span className="text-[#17171D] font-bold mono bg-[#F4F3EF] px-1.5 py-0.5 rounded text-[11.5px] border border-[#E6E3DC]">
                {c.displayId || c.id}
              </span>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 relative">
              {/* Action Items Button */}
              <button
                type="button"
                onClick={() => setIsActionPanelOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold rounded-lg border transition shadow-xs cursor-pointer ${
                  attns.length > 0
                    ? 'bg-[#FFF9F0] text-[#B06000] border-[#F6E4C6] hover:bg-[#FDF2E2]'
                    : 'bg-white text-[#46454F] border-[#D1D5DB] hover:bg-[#F9F8F5]'
                }`}
                title={`Open action items (${attns.length} pending)`}
              >
                <span className="text-amber-600">⚡</span>
                <span>Action items</span>
                {attns.length > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[#D9822B] text-white min-w-[18px]">
                    {attns.length}
                  </span>
                )}
              </button>

              {/* Edit Details Button */}
              <button
                type="button"
                onClick={() => setIsEditingHead(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#46454F] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9F8F5] transition shadow-xs cursor-pointer"
              >
                <span>✎</span>
                <span>Edit details</span>
              </button>

              {/* More actions dropdown */}
              <button
                type="button"
                onClick={() => setShowMoreActions((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12.5px] font-medium text-[#46454F] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9F8F5] transition shadow-xs cursor-pointer"
                title="More actions"
              >
                <svg className="w-4 h-4 text-[#7A7984]" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
                <svg className="w-3 h-3 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showMoreActions && (
                <div className="absolute right-0 top-10 w-44 bg-white border border-[#E6E3DC] rounded-lg shadow-lg py-1.5 z-40 text-left text-[12.5px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(false);
                      onOpenComposer(c, 'blank');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#F9F8F5] text-[#17171D] cursor-pointer"
                  >
                    ✉ Email customer
                  </button>
                  {c.lifecycle !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreActions(false);
                        onCompleteCase(c);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#F9F8F5] text-[#17171D] cursor-pointer"
                    >
                      ✓ Complete case
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Customer Heading & Subject */}
          <div className="pt-3 pb-3">
            <h1 className="text-[20px] font-bold text-[#17171D] tracking-tight leading-snug">
              {c.displayId || c.id} · {c.customer}
            </h1>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7984] shrink-0">Subject:</span>
              <span className="text-[13px] text-[#46454F] font-medium leading-relaxed">{c.title}</span>
            </div>
          </div>

          {/* Row 3: Filterable attributes (left) vs. reference metadata (right) — kept apart on purpose,
              so a case/order number never sits crammed against a date in the same dense grid. */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-3 mt-1 border-t border-[#F0EFEA] bg-[#FAFAF8] -mx-5 -mb-4 px-5 py-3 rounded-b-xl">
            {/* Left: the same attributes the Cases list can be filtered by — Status, Priority, Classification, Category */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`spill ${getCaseStatus(c).tone}`}>
                <span className="sd" />
                {getCaseStatus(c).label}
              </span>
              <span className={`chip tiny ${c.priority === 'Urgent' || c.priority === 'High' ? 'red' : 'plain'}`} style={{ fontWeight: 600 }}>
                {c.priority || 'Normal'} priority
              </span>
              <span className="chip plain tiny" style={{ fontWeight: 600 }} title={c.classification || 'New Transport Order'}>
                {c.classification || 'New Transport Order'}
              </span>
              <span className="chip plain tiny" style={{ fontWeight: 600 }} title={c.categories[0] || 'Freight Forwarding'}>
                {c.categories[0] || 'Freight Forwarding'}
              </span>
            </div>

            {/* Right: plain reference metadata — not a filter, just an id and a date, kept visually quiet */}
            <div className="flex items-center gap-2.5 text-[11.5px] text-[#7A7984]">
              <span>
                Created <span className="font-semibold text-[#46454F]">{c.created || '25 Sep 2024, 07:58'}</span>
              </span>
              <span className="text-[#D9D7CF]">·</span>
              <span className="mono">
                {c.records.find((r) => r.type === 'Opter order')
                  ? `Opter #${c.records.find((r) => r.type === 'Opter order')?.number}`
                  : 'No Opter order yet'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="casetabs" role="tablist" aria-label="Case Workspace Tabs">
        <button
          type="button"
          role="tab"
          className="casetab-btn"
          aria-current={tab === 'overview' ? 'page' : undefined}
          aria-selected={tab === 'overview'}
          onClick={() => setTab('overview')}
        >
          <TabOverviewIcon className="casetab-icon" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          role="tab"
          className="casetab-btn"
          aria-current={tab === 'data' ? 'page' : undefined}
          aria-selected={tab === 'data'}
          onClick={() => setTab('data')}
        >
          <TabDataIcon className="casetab-icon" />
          <span>Order Details</span>
        </button>

        <button
          type="button"
          role="tab"
          className="casetab-btn"
          aria-current={tab === 'work' ? 'page' : undefined}
          aria-selected={tab === 'work'}
          onClick={() => setTab('work')}
        >
          <TabTasksIcon className="casetab-icon" />
          <span>Tasks</span>
          <span className={`casetab-badge ${c.tasks.some((t) => t.timing === 'Overdue') ? 'danger' : ''}`}>
            {doneCount}/{totalTasks}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          className="casetab-btn"
          aria-current={tab === 'comms' || tab === 'conversation' ? 'page' : undefined}
          aria-selected={tab === 'comms' || tab === 'conversation'}
          onClick={() => {
            setTab('comms');
            setCommsLayout('split');
          }}
        >
          <TabConversationIcon className="casetab-icon" />
          <span>Communication</span>
          <span className="casetab-badge">{c.conversation.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          className="casetab-btn"
          aria-current={tab === 'activity' ? 'page' : undefined}
          aria-selected={tab === 'activity'}
          onClick={() => setTab('activity')}
        >
          <TabActivityIcon className="casetab-icon" />
          <span>Activity</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (() => {
        const allFields = c.data.flatMap((g) => g.fields);

        const pickupLoc = allFields.find((f) => f.k.toLowerCase().includes('pickup') || f.k.toLowerCase().includes('origin'))?.v || '';
        const deliveryLoc = allFields.find((f) => f.k.toLowerCase().includes('delivery') || f.k.toLowerCase().includes('destination'))?.v || '';
        const weightVal = c.weight || allFields.find((f) => f.k.toLowerCase().includes('weight'))?.v || '';
        const poNumber = allFields.find((f) => f.k.toLowerCase().includes('po') || f.k.toLowerCase().includes('reference'))?.v || `#${c.id}`;

        const mainItem = c.items && c.items.length > 0 ? c.items[0] : null;
        const itemDimensions = mainItem && mainItem.length && mainItem.width && mainItem.height ? `${mainItem.length} × ${mainItem.width} × ${mainItem.height}` : '';
        const goodsDescription = mainItem?.name || mainItem?.goodsType || '';

        const doneTasks = c.tasks.filter((t) => t.status === 'Done');
        const inProgressTasks = c.tasks.filter((t) => t.status === 'In Progress');
        const pendingTasks = c.tasks.filter((t) => t.status === 'To Do');
        const overdueTasks = c.tasks.filter((t) => t.timing === 'Overdue' && t.status !== 'Done');

        // What the reader should do next: an open blocker beats a ready task beats "nothing to do".
        const nextReadyTask = c.tasks.find((t) => t.status !== 'Done' && t.readiness === 'Ready');
        const nextStep =
          attns.length > 0
            ? attns[0].t
            : nextReadyTask
            ? `${nextReadyTask.title} (${nextReadyTask.dept})`
            : c.tasks.length > 0 && doneTasks.length === c.tasks.length
            ? 'All tasks complete — nothing outstanding'
            : 'No immediate action required';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Row 1: Smart summary & Case Overview */}
            <div className="ov-top-grid">
              {/* Left: Smart Summary — the actual narrative of the case: what happened, where it stands, what's next.
                  Cargo specs and route data live in Case Overview / Order Details, not repeated here. */}
              <div className="ov-top-card situation">
                <div className="ovhead">
                  <span className="ovic">
                    <AiIcon size={16} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <h3>Smart summary</h3>
                    <div className="ovsub">What happened, where it stands, and what's next</div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="ov-summary-callout">{c.summary}</p>
                  <div className="ov-summary-hint">
                    <span style={{ color: attns.length > 0 ? '#B06000' : 'var(--teal)', fontWeight: 700 }}>→</span>
                    <span><b>Next:</b> {nextStep}</span>
                  </div>
                </div>
              </div>

              {/* Right: Case Overview — contact, route & cargo essentials only, nothing duplicated from above */}
              <div className="ov-top-card overview">
                <div className="ovhead">
                  <span className="ovic">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
                      <path d="M5.5 2v3M10.5 2v3M2.5 6.5h11" />
                    </svg>
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <h3>Case Overview</h3>
                    <div className="ovsub">Contact, route & cargo</div>
                  </div>
                  <div className="spacer" />
                  <span className={`spill ${getCaseStatus(c).tone}`} style={{ fontSize: 11 }}>
                    <span className="sd" />
                    {getCaseStatus(c).label}
                  </span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'var(--blue-soft)',
                        border: '1px solid #BCE0E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 11,
                        color: 'var(--blue)',
                        flexShrink: 0
                      }}
                    >
                      {(c.contact || c.customer).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.contact || c.customer}</div>
                      <div className="mono" style={{ fontSize: 11.5, color: 'var(--blue)' }}>{c.email}</div>
                    </div>
                    <div className="spacer" />
                    <span className="chip plain tiny" style={{ fontWeight: 600, flexShrink: 0 }}>Ref {poNumber}</span>
                  </div>

                  <div className="ov-facts-grid">
                    {(pickupLoc || deliveryLoc) && (
                      <div className="ov-fact-cell wide">
                        <div className="k">Route</div>
                        <div className="v" style={{ fontWeight: 600 }}>
                          {pickupLoc || '—'} → {deliveryLoc || '—'}
                        </div>
                      </div>
                    )}
                    {goodsDescription && (
                      <div className="ov-fact-cell wide">
                        <div className="k">Goods</div>
                        <div className="v">{goodsDescription}</div>
                      </div>
                    )}
                    <div className="ov-fact-cell">
                      <div className="k">Weight</div>
                      <div className="v mono" style={{ fontWeight: 600 }}>{weightVal || '—'}</div>
                    </div>
                    {itemDimensions && (
                      <div className="ov-fact-cell">
                        <div className="k">Dimensions</div>
                        <div className="v mono">{itemDimensions}</div>
                      </div>
                    )}
                    {c.conditions.length > 0 && (
                      <div className="ov-fact-cell wide">
                        <div className="k">Conditions</div>
                        <div className="v">
                          {c.conditions.map((cond) => (
                            <span key={cond} className="chip amber tiny">{cond}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Tasks Overview — status per department, in one glance. Blockers and the ready-to-act
                queue already live in the Action items panel (top-right); no need to repeat them here. */}
            <div className="card ovcard">
              <div className="ovhead">
                <span className="ovic">
                  <TabTasksIcon className="casetab-icon" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3>Tasks Overview</h3>
                  <div className="ovsub">
                    {doneCount} of {totalTasks} tasks done across {swimlaneDepts.length} department{swimlaneDepts.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="spacer" />
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setTab('work')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span>Open Tasks tab →</span>
                </button>
              </div>

              <div className="card-body">
                {/* Stat tiles: Done / In Progress / Pending / Overdue */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#F0FDF4', padding: '10px 12px', borderRadius: 8, border: '1px solid #DCFCE7' }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', color: '#166534', fontWeight: 700 }}>Done</div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: '#15803D', marginTop: 1 }}>{doneTasks.length}</div>
                  </div>
                  <div style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: 8, border: '1px solid #DBEAFE' }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', color: '#1E40AF', fontWeight: 700 }}>In Progress</div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: '#2563EB', marginTop: 1 }}>{inProgressTasks.length}</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line-2)' }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 700 }}>Pending</div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: 'var(--ink-2)', marginTop: 1 }}>{pendingTasks.length}</div>
                  </div>
                  <div style={{ background: overdueTasks.length > 0 ? '#FEF2F2' : 'var(--surface-2)', padding: '10px 12px', borderRadius: 8, border: `1px solid ${overdueTasks.length > 0 ? '#FEE2E2' : 'var(--line-2)'}` }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', color: overdueTasks.length > 0 ? '#991B1B' : 'var(--ink-3)', fontWeight: 700 }}>Overdue</div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: overdueTasks.length > 0 ? '#DC2626' : 'var(--ink-3)', marginTop: 1 }}>{overdueTasks.length}</div>
                  </div>
                </div>

                {/* Per-department breakdown — the complete cross-department view, one card each */}
                {c.tasks.length === 0 ? (
                  <div className="muted small" style={{ padding: '8px 0' }}>No tasks yet for this case.</div>
                ) : (
                  <div className="ovdepts">
                    {swimlaneDepts.map((deptName) => {
                      const deptTasks = c.tasks.filter((t) => t.dept === deptName);
                      const deptDone = deptTasks.filter((t) => t.status === 'Done').length;
                      const deptPct = deptTasks.length ? Math.round((deptDone / deptTasks.length) * 100) : 0;
                      const nextTask = deptTasks.find((t) => t.status !== 'Done');
                      const deptOverdue = deptTasks.some((t) => t.timing === 'Overdue' && t.status !== 'Done');

                      return (
                        <div
                          key={deptName}
                          className="ovdept"
                          style={{ '--dc': DEPT_TONE[deptName] || '#7A7984', cursor: 'pointer' } as any}
                          onClick={() => setTab('work')}
                          role="button"
                          title={`Open ${deptName} tasks`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="lanedot" />
                            <span style={{ fontWeight: 700 }}>{deptName}</span>
                            <div style={{ flex: 1 }} />
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{deptDone}/{deptTasks.length}</span>
                          </div>
                          <span className="track">
                            <i style={{ width: `${deptPct}%` }} />
                          </span>
                          {nextTask ? (
                            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 7 }}>
                              Next: <b style={{ color: deptOverdue ? 'var(--red)' : 'var(--ink)' }}>{nextTask.title}</b>
                              <div style={{ color: 'var(--ink-3)', marginTop: 1 }}>Due {nextTask.due}</div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11.5, color: 'var(--teal)', marginTop: 7, fontWeight: 600 }}>All done ✓</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tab: Tasks (Swimlanes) */}
      {tab === 'work' && (
        <>
          <div className="filterbar">
            <span className="small">
              <b className="num">{doneCount} of {totalTasks}</b> tasks done across {swimlaneDepts.length} department{swimlaneDepts.length > 1 ? 's' : ''}
            </span>
            <span className="progress" style={{ width: 170 }}>
              <i style={{ width: `${pct}%` }} />
              <i className="wip" style={{ width: `${wipPct}%` }} />
            </span>
            <div style={{ flex: 1 }} />
            <button className="btn btn-sm" onClick={() => onOpenSuggestedTasks(c)}>
              <AiIcon /> Suggested tasks
            </button>
            <button className="btn btn-sm" onClick={() => onOpenAddTask(c)}>
              Add task
            </button>
          </div>

          <div className="lanescroll">
            <div
              className={`lanes cols ${swimlaneDepts.length === 1 ? 'single' : ''}`}
              style={{
                gridTemplateColumns:
                  swimlaneDepts.length === 1
                    ? 'minmax(0,1fr)'
                    : `repeat(${swimlaneDepts.length}, minmax(270px, 1fr))`
              }}
            >
              {swimlaneDepts.map((deptName) => {
                const deptTasks = c.tasks.filter((t) => t.dept === deptName);
                const deptDone = deptTasks.filter((t) => t.status === 'Done').length;
                const people = Array.from(new Set(deptTasks.map((t) => t.assignee).filter(Boolean)));

                return (
                  <div key={deptName} className="lane" style={{ '--dc': DEPT_TONE[deptName] || '#7A7984' } as any}>
                    <div className="lanehead">
                      <div className="row" style={{ gap: 8, width: '100%' }}>
                        <span className="lanedot" />
                        <h3>{deptName}</h3>
                        <div className="spacer" />
                        <span className="tiny muted num">{deptDone} / {deptTasks.length}</span>
                      </div>
                      <span className="progress" style={{ width: '100%' }}>
                        <i style={{ width: `${deptTasks.length ? Math.round((deptDone / deptTasks.length) * 100) : 0}%` }} />
                      </span>
                      <div className="row" style={{ gap: 6, width: '100%' }}>
                        <span className="tiny muted">
                          {people.length > 0 ? (
                            people.map((p) => (
                              <span key={p} className="avatar mini" title={p || ''}>
                                {p?.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                              </span>
                            ))
                          ) : (
                            'Nobody assigned yet'
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="lanebody">
                      {deptTasks.map((t) => {
                        const pre = t.dep ? c.tasks.find((x) => x.id === t.dep) : null;
                        const isOverdue = t.timing === 'Overdue' && t.status !== 'Done';

                        return (
                          <div
                            key={t.id}
                            className={`ltask ${t.status === 'Done' ? 'done' : ''} ${isOverdue ? 'late' : ''}`}
                            onClick={() => onOpenTaskDrawer(c.id, t.id)}
                          >
                            <button
                              className={`lcheck ${t.status === 'Done' ? 'done' : t.readiness === 'Ready' ? 'ready' : 'wait'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (t.status !== 'Done' && t.readiness === 'Ready') {
                                  onCompleteTask(c, t);
                                }
                              }}
                            >
                              {t.status === 'Done' && <TickIcon />}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="ltitle">
                                <span className="tt">{t.title}</span>
                                {t.milestone && <span className="chip blue tiny">Customer-visible</span>}
                              </div>
                              <div className="lmeta">
                                <span className="label">Priority</span>
                                <span className="mv">{t.priority}</span>
                                <span className="label">Assignee</span>
                                <span className="mv">{t.assignee || 'Unassigned'}</span>
                                <span className="label">Due</span>
                                <span className={`mv ${isOverdue ? 'duelate' : ''}`}>{t.due}</span>
                              </div>
                              {pre && (
                                <div className="ldeps">
                                  <span className={`dep ${pre.status === 'Done' ? 'ok' : ''}`}>
                                    ⤷ Starts after <b>{pre.title}</b> ({pre.status.toLowerCase()})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tab: Order Details matching screenshot */}
      {tab === 'data' && (
        <OrderDetailsView
          c={c}
          onSaveField={onSaveField}
          onSaveHeader={onSaveHeader}
          onOpenOpterModal={onOpenOpterModal}
          toast={toast}
        />
      )}

      {/* Tab: Communications & Conversation */}
      {(tab === 'conversation' || tab === 'comms') && (() => {
        const allMessages = c.conversation.slice().reverse();
        const filteredMessages = allMessages.filter((m) => {
          if (convFilter === 'customer' && m.type === 'internal') return false;
          if (convFilter === 'internal' && m.type !== 'internal') return false;
          if (commsSearch) {
            const q = commsSearch.toLowerCase();
            return (
              (m.subject || '').toLowerCase().includes(q) ||
              m.body.toLowerCase().includes(q) ||
              m.from.toLowerCase().includes(q)
            );
          }
          return true;
        });

        const activeMsgIndex = Math.min(selectedMsgIdx, Math.max(0, filteredMessages.length - 1));
        const activeMessage = filteredMessages[activeMsgIndex] || filteredMessages[0] || null;

        return (
          <div className="stack" style={{ gap: 14 }}>
            {/* Top Toolbar */}
            <div className="filterbar" style={{ flexWrap: 'wrap', gap: 10, background: 'var(--surface)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
              {/* Segmented Filter */}
              <div className="segmented">
                <button
                  type="button"
                  aria-pressed={convFilter === 'all'}
                  onClick={() => setConvFilter('all')}
                >
                  All ({c.conversation.length})
                </button>
                <button
                  type="button"
                  aria-pressed={convFilter === 'customer'}
                  onClick={() => setConvFilter('customer')}
                >
                  Customer emails ({c.conversation.filter((m) => m.type !== 'internal').length})
                </button>
                <button
                  type="button"
                  aria-pressed={convFilter === 'internal'}
                  onClick={() => setConvFilter('internal')}
                >
                  Internal notes ({c.conversation.filter((m) => m.type === 'internal').length})
                </button>
              </div>

              {/* Layout Switcher */}
              <div className="segmented" style={{ marginLeft: 4 }}>
                <button
                  type="button"
                  aria-pressed={commsLayout === 'split'}
                  onClick={() => setCommsLayout('split')}
                  title="2-Pane Email Hub"
                >
                  ⊞ Split View
                </button>
                <button
                  type="button"
                  aria-pressed={commsLayout === 'stream'}
                  onClick={() => setCommsLayout('stream')}
                  title="Chronological Feed"
                >
                  ☰ Stream View
                </button>
              </div>

              <div style={{ flex: 1 }} />

              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowQuickNote(!showQuickNote)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                + Internal note
              </button>

              <button
                type="button"
                className="btn btn-sm aibtn"
                onClick={() => setShowConvSummary(!showConvSummary)}
              >
                <AiIcon /> Summary
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => onOpenComposer(c, 'ack')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                ✉️ New email
              </button>
            </div>

            {/* Smart Summary if open */}
            {showConvSummary && (
              <div className="card convsum">
                <div className="card-head">
                  <h3><AiIcon /> Smart summary of communication</h3>
                  <div className="spacer" />
                  <button className="x" onClick={() => setShowConvSummary(false)}>✕</button>
                </div>
                <div className="card-body">
                  <p style={{ margin: '0 0 10px', color: 'var(--ink-2)' }}>
                    <b>{c.customer}</b> — {c.title}. {c.conversation.length} total messages exchanged.
                  </p>
                  <ul className="sumlist">
                    {c.conversation.map((msg, i) => (
                      <li key={i}>
                        <span className={`sumwho ${msg.type}`}>
                          {msg.type === 'in' ? 'Customer' : msg.type === 'out' ? 'AA Logistik' : 'Internal'}
                        </span>{' '}
                        <span className="muted tiny">{msg.time}</span>
                        <div>{msg.body.slice(0, 140)}...</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Quick Internal Note with @mention if open */}
            {showQuickNote && (
              <div className="card" style={{ border: '1px solid #FCD34D', background: '#FFFDF5' }}>
                <div className="card-head" style={{ background: '#FEF3C7' }}>
                  <h3 style={{ color: '#92400E', fontSize: 13 }}>Add an internal colleague note</h3>
                  <div className="spacer" />
                  <button className="x" onClick={() => setShowQuickNote(false)}>✕</button>
                </div>
                <div className="card-body">
                  <div className="mentionwrap">
                    <textarea
                      rows={3}
                      style={{ width: '100%', fontSize: 13, padding: 10, border: '1px solid var(--line)', borderRadius: 6, boxSizing: 'border-box' }}
                      placeholder="Visible to team only. Type @ to mention a colleague..."
                      value={noteText}
                      onChange={(e) => {
                        setNoteText(e.target.value);
                        const m = e.target.value.match(/@(\w*)$/);
                        if (m) setMentionQuery(m[1].toLowerCase());
                        else setMentionQuery(null);
                      }}
                    />
                    {mentionQuery !== null && (
                      <div className="mention-pop on">
                        <div className="mh2">Mention a colleague — they will be notified</div>
                        {USERS.filter((u) => u.name.toLowerCase().includes(mentionQuery)).map((u) => (
                          <div
                            key={u.name}
                            className="mention-opt"
                            onClick={() => {
                              setNoteText(noteText.replace(/@(\w*)$/, `@${u.name} `));
                              setMentionQuery(null);
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
                  <div className="row" style={{ marginTop: 8, gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        if (!noteText.trim()) return;
                        onAddNote(c, noteText, noteFiles);
                        setNoteText('');
                        setNoteFiles([]);
                        setShowQuickNote(false);
                      }}
                    >
                      Post note
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setNoteText((prev) => (prev ? prev + ' @' : '@'));
                        setMentionQuery('');
                      }}
                    >
                      @ Mention
                    </button>
                    <span className="tiny muted">Team only. Never sent to customer.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Demo simulation button if relevant */}
            {(c.id === '325855' || c.id === '325856') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6 }}>
                <span className="sim" style={{ margin: 0 }}>demo</span>
                <span style={{ fontSize: 12, color: '#166534', flex: 1 }}>
                  Interactive workflow test: simulate customer response to this case.
                </span>
                <button
                  className="btn btn-sm"
                  style={{ background: '#FFFFFF', borderColor: '#86EFAC' }}
                  onClick={c.id === '325855' ? onSimulateReply : onSimulateAcceptance}
                >
                  Simulate customer replying
                </button>
              </div>
            )}

            {/* Layout 1: 2-Pane Split Communications Hub */}
            {commsLayout === 'split' ? (
              <div className="comms-studio">
                {/* Left Pane: Message List */}
                <div className="comms-list-pane">
                  <div className="comms-list-head">
                    <input
                      className="sel"
                      style={{ width: '100%', fontSize: 12, boxSizing: 'border-box' }}
                      placeholder="Filter thread..."
                      value={commsSearch}
                      onChange={(e) => setCommsSearch(e.target.value)}
                    />
                  </div>
                  <div className="comms-list-scroll">
                    {filteredMessages.length === 0 ? (
                      <div className="muted small" style={{ padding: 20, textAlign: 'center' }}>
                        No messages match the filter.
                      </div>
                    ) : (
                      filteredMessages.map((m, idx) => {
                        const isSelected = idx === activeMsgIndex;
                        const isInternal = m.type === 'internal';
                        const isOut = m.type === 'out';
                        const isIn = m.type === 'in';

                        return (
                          <div
                            key={idx}
                            className={`comms-card-item ${m.type} ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedMsgIdx(idx)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  background: isIn ? '#EEF2FF' : isOut ? '#CCFBF1' : '#FEF3C7',
                                  color: isIn ? '#4338CA' : isOut ? '#0F766E' : '#B45309'
                                }}
                              >
                                {isIn ? 'Inbound' : isOut ? 'Outbound' : 'Internal'}
                              </span>
                              <div style={{ flex: 1 }} />
                              <span className="tiny muted">{m.time}</span>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--ink)', marginBottom: 2 }}>
                              {isOut ? `AA Logistik → ${m.to || c.customer}` : m.from}
                            </div>
                            {m.subject && (
                              <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.subject}
                              </div>
                            )}
                            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
                              {m.body.replace(/\n+/g, ' ')}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Pane: Reading & Action View */}
                <div className="comms-reader-pane">
                  {activeMessage ? (
                    <>
                      <div className="comms-reader-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span
                            className="chip"
                            style={{
                              background: activeMessage.type === 'in' ? '#4F46E5' : activeMessage.type === 'out' ? '#0D9488' : '#D97706',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: 11
                            }}
                          >
                            {activeMessage.type === 'in'
                              ? 'Customer Inbound'
                              : activeMessage.type === 'out'
                              ? 'AA Logistik Response'
                              : 'Internal Note'}
                          </span>
                          <span className="tiny muted">{activeMessage.time}</span>
                          <div style={{ flex: 1 }} />
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => onOpenComposer(c, activeMessage.type === 'in' ? 'ack' : 'manual')}
                          >
                            Reply to customer
                          </button>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: 'var(--ink)', lineHeight: 1.3 }}>
                          {activeMessage.subject || (activeMessage.type === 'internal' ? 'Colleague internal note' : 'Communication')}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            className="avatar"
                            style={{
                              width: 32,
                              height: 32,
                              fontSize: 12,
                              fontWeight: 700,
                              background: activeMessage.type === 'in' ? '#EEF2FF' : activeMessage.type === 'out' ? '#E6FFFA' : '#FEF3C7',
                              color: activeMessage.type === 'in' ? '#4338CA' : activeMessage.type === 'out' ? '#0F766E' : '#B45309'
                            }}
                          >
                            {activeMessage.from.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
                              From: {activeMessage.from}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                              To: {activeMessage.type === 'out' ? activeMessage.to || c.email : 'transport@aalogistik.se'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="comms-reader-body">
                        {renderMessageBody(activeMessage.body)}
                      </div>

                      <div className="comms-reader-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => onOpenComposer(c, 'ack')}
                        >
                          ✉️ Compose email to customer
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setShowQuickNote(true)}
                        >
                          + Internal note on this
                        </button>
                        <div style={{ flex: 1 }} />
                        <span className="tiny muted">AA Logistik Operations Thread</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
                      Select a message on the left to read details.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Layout 2: Unified Chronological Stream View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredMessages.map((m, i) => {
                  const isInternal = m.type === 'internal';
                  const isOut = m.type === 'out';
                  const isIn = m.type === 'in';

                  if (isInternal) {
                    return (
                      <div key={i} className="msg internal">
                        <div className="mh">
                          <span className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: '#FEF3C7', color: '#B45309' }}>
                            {m.from.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                          </span>
                          <b>{m.from}</b>
                          <span className="chip amber" style={{ fontSize: 11 }}>Internal Note</span>
                          <div className="spacer" />
                          <span className="muted tiny">{m.time}</span>
                        </div>
                        <div className="mb">
                          {renderMessageBody(m.body)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`msg ${m.type}`}>
                      <div className="mh">
                        <span className={`chip ${isOut ? 'aa' : 'cust'}`}>
                          {isOut && <MarkLogo height={11} style={{ marginRight: 5, verticalAlign: -1 }} />}
                          {isOut ? 'AA Logistik Response' : 'Customer Inbound'}
                        </span>
                        <b>{isOut ? `To: ${m.to || c.customer}` : m.from}</b>
                        <div className="spacer" />
                        <span className="muted tiny">{m.time}</span>
                      </div>
                      <div className="mb">
                        {m.subject && (
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 8 }}>
                            {m.subject}
                          </div>
                        )}
                        <div>{renderMessageBody(m.body)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab: Activity */}
      {tab === 'activity' && (
        <>
          <div className="filterbar">
            <div className="segmented">
              {['all', 'System', 'Communication', 'Tasks', 'Data', 'Orders'].map((k) => (
                <button
                  key={k}
                  aria-pressed={actFilter === k}
                  onClick={() => setActFilter(k)}
                >
                  {k === 'all' ? 'Everything' : k}
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="timeline">
                {c.activity
                  .slice()
                  .reverse()
                  .filter((a) => actFilter === 'all' || a.kind === actFilter)
                  .map((a, i) => (
                    <div key={i} className={`tlitem ${a.actor === 'System' || a.actor === 'AI' ? 'sys' : 'usr'}`}>
                      <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                        <span className="muted tiny nowrap" style={{ width: 92 }}>{a.time}</span>
                        <span className={`chip ${a.actor === 'AI' ? 'violet' : 'plain'}`}>{a.actor}</span>
                        <span style={{ flex: 1 }}>
                          {a.text}
                          {a.detail && <div className="tiny muted">{a.detail}</div>}
                        </span>
                        <span className="chip plain tiny">{a.kind}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Right slide action panel */}
      <div
        className={`scrim ${isActionPanelOpen ? 'on' : ''}`}
        onClick={() => setIsActionPanelOpen(false)}
        style={{ zIndex: 90 }}
      />
      <aside
        className={`drawer action-drawer-industrial ${isActionPanelOpen ? 'on' : ''}`}
        style={{ zIndex: 95, width: 'min(450px, 94vw)' }}
        aria-label="Case action items"
      >
        <div className="drawer-head" style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="row wrap tiny muted" style={{ alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-2)' }}>#{c.id}</span>
              <span style={{ color: 'var(--line-2)' }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{c.customer}</span>
            </div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
              Action items
              {attns.length > 0 ? (
                <span className="chip amber tiny" style={{ fontWeight: 700, padding: '1px 7px' }}>
                  {attns.length} required
                </span>
              ) : (
                <span className="chip plain tiny">0 pending</span>
              )}
            </h3>
          </div>
          <div style={{ flex: 1 }} />
          <button className="x" onClick={() => setIsActionPanelOpen(false)} title="Close action panel">✕</button>
        </div>
        <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', background: 'var(--bg)' }}>
          {attns.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--ink-3)', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 32, marginBottom: 8, color: 'var(--teal)' }}>✓</div>
              <h4 style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>All action items resolved</h4>
              <p style={{ fontSize: 12, lineHeight: 1.45, maxWidth: 300, margin: '0 auto', color: 'var(--ink-2)' }}>
                No pending actions or classification blocks for this case at the moment.
              </p>
            </div>
          ) : (
            attns.map((a, i) => (
              <div
                key={i}
                className={`action-card-industrial ${a.tone}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div className="action-card-title">
                    {a.t}
                  </div>
                  <span className={`action-card-tag ${a.tone}`}>
                    {a.tone === 'red' ? 'Critical' : a.tone === 'amber' ? 'Required' : 'Ready'}
                  </span>
                </div>
                <div className="action-card-desc">
                  {a.d}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    className={`action-btn-outlined ${a.tone}`}
                    onClick={() => {
                      handleAttnClick(a.act);
                      setIsActionPanelOpen(false);
                    }}
                  >
                    <span>{a.btn}</span>
                    <span aria-hidden="true" style={{ fontSize: 12 }}>→</span>
                  </button>
                </div>
              </div>
            ))
          )}
          
        </div>
        <div className="drawer-foot" style={{ padding: '10px 16px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <button className="btn btn-sm" onClick={() => setIsActionPanelOpen(false)}>Close</button>
          <div style={{ flex: 1 }} />
          {attns.length > 0 && (
            <span className="tiny muted" style={{ fontWeight: 500 }}>{attns.length} pending action item{attns.length === 1 ? '' : 's'}</span>
          )}
        </div>
      </aside>
    </>
  );
};
