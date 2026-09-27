import React, { useState, useRef, useEffect } from 'react';
import { CaseItem } from '../types';
import { SearchIcon, FilterIcon } from '../icons';
import { CLASSIFICATIONS, SERVICE_TYPES, DEPTS, getCaseStatus } from '../data';
import { useCurrentUser } from '../UserContext';

interface CasesViewProps {
  cases: CaseItem[];
  onOpenCase: (id: string, tab?: string) => void;
  initialSearchCustomer?: string;
  /** Pre-applies the Status filter — must match a getCaseStatus(c).label value
   * (e.g. "Completed", "Needs Review"). Used by dashboard drill-downs. */
  initialStatus?: string;
  /** Pre-applies the Classification filter — must match a request's
   * classification value (e.g. "New Transport Order"). */
  initialClassification?: string;
  /** Pre-applies the Communication filter: 'pending' or 'done'. */
  initialComm?: string;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  onOpenCase,
  initialSearchCustomer,
  initialStatus,
  initialClassification,
  initialComm
}) => {
  const currentUser = useCurrentUser();
  const [q, setQ] = useState(initialSearchCustomer || '');
  const [showMoreFilterPop, setShowMoreFilterPop] = useState(false);
  const moreFilterPopRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<{
    classification: string;
    type: string;
    status: string;
    priority: string;
    dateRange: string;
    overdue: boolean;
    customer: string;
    comm: string;
    orders: string;
    tasks: string;
    department: string;
    owner: string;
  }>({
    classification: initialClassification || '',
    type: '',
    status: initialStatus || '',
    priority: '',
    dateRange: '',
    overdue: false,
    customer: '',
    comm: initialComm || '',
    orders: '',
    tasks: '',
    department: '',
    owner: ''
  });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moreFilterPopRef.current && !moreFilterPopRef.current.contains(target)) {
        setShowMoreFilterPop(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const activeFiltersCount = Object.values(filters).filter((v) => (typeof v === 'boolean' ? v : Boolean(v))).length;
  const moreFiltersActiveCount = [
    filters.classification,
    filters.type,
    filters.customer,
    filters.comm,
    filters.orders,
    filters.tasks,
    filters.department,
    filters.owner
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters({
      classification: '',
      type: '',
      status: '',
      priority: '',
      dateRange: '',
      overdue: false,
      customer: '',
      comm: '',
      orders: '',
      tasks: '',
      department: '',
      owner: ''
    });
    setQ('');
  };

  const getCaseClassification = (c: CaseItem): string => {
    if (c.classification) return c.classification;
    if (c.caseClass === 'Confirmed Order') return 'New Transport Order';
    if (c.caseClass === 'Inquiry') return 'Inquiry';
    if (c.caseClass === 'Change Request') return 'Order Change';
    return 'New Transport Order';
  };

  const getCaseTypes = (c: CaseItem): string[] => {
    if (c.types && c.types.length > 0) return c.types;
    if (c.categories.includes('Freight Forwarding')) return ['Freight Forwarding'];
    if (c.categories.includes('Warehouse') && c.categories.includes('Packing')) return ['Warehouse', 'Packing'];
    if (c.categories.includes('Warehouse')) return ['Warehouse'];
    if (c.categories.includes('Packing')) return ['Packing'];
    return ['Standard Transport'];
  };

  const getTypeColor = (type: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      'Freight Forwarding': { bg: '#DBEAFE', text: '#1E40AF' },
      'Warehouse': { bg: '#D1FAE5', text: '#065F46' },
      'Packing': { bg: '#FEF3C7', text: '#92400E' },
      'Standard Transport': { bg: '#E5E7EB', text: '#374151' },
      'Transport': { bg: '#E5E7EB', text: '#374151' },
      'Delivery': { bg: '#F3E8FF', text: '#581C87' },
      'Handling': { bg: '#FCE7F3', text: '#831843' }
    };
    return colorMap[type] || { bg: '#E5E7EB', text: '#374151' };
  };

  const caseStatusChip = (c: CaseItem) => {
    const { label, tone } = getCaseStatus(c);
    return (
      <span className={`spill ${tone}`}>
        <span className="sd" />
        {label}
      </span>
    );
  };

  // Displayed as "Medium" — the underlying stored value stays 'Normal'.
  const priorityLabel = (p: string): string => (p === 'Normal' ? 'Medium' : p);
  const priorityChipTone = (p: string): string => {
    if (p === 'Urgent') return 'red';
    if (p === 'High') return 'amber';
    if (p === 'Normal') return 'blue';
    return 'plain';
  };

  const dateRangeLabels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'Past 7 days'
  };
  const commLabels: Record<string, string> = { done: 'Done', pending: 'Pending' };
  const ordersLabels: Record<string, string> = { yes: 'Has Opter order', no: 'No Opter order yet' };
  const tasksLabels: Record<string, string> = { me: 'My open tasks', unassigned: 'Has unassigned tasks' };

  let rows = cases.slice();

  // 1. Classification filter
  if (filters.classification) {
    rows = rows.filter((c) => getCaseClassification(c) === filters.classification);
  }

  // 2. Type filter (supports multiple values on a case)
  if (filters.type) {
    rows = rows.filter((c) => getCaseTypes(c).includes(filters.type));
  }

  // 3. Status filter
  if (filters.status) {
    rows = rows.filter((c) => getCaseStatus(c).label === filters.status);
  }

  // 4. Priority filter
  if (filters.priority) {
    rows = rows.filter((c) => c.priority === filters.priority);
  }

  // 5. Date Range filter
  if (filters.dateRange === 'today') {
    rows = rows.filter((c) => c.created.toLowerCase().includes('today') || c.created.includes('25 Sep'));
  } else if (filters.dateRange === 'yesterday') {
    rows = rows.filter((c) => c.created.toLowerCase().includes('yesterday') || c.created.includes('24 Sep'));
  } else if (filters.dateRange === 'week') {
    rows = rows.filter((c) => c.created.includes('25 Sep') || c.created.includes('24 Sep') || c.created.includes('23 Sep') || c.created.includes('22 Sep'));
  }

  // 6. Overdue filter
  if (filters.overdue) {
    rows = rows.filter((c) => c.tasks.some((t) => t.status !== 'Done' && t.timing === 'Overdue'));
  }

  // More filters: Customer
  if (filters.customer) {
    rows = rows.filter((c) => c.customer === filters.customer);
  }

  // More filters: Communication
  if (filters.comm === 'done') {
    rows = rows.filter((c) => c.comm.state === 'Acknowledged' || c.comm.state === 'No Action Required' || c.lifecycle === 'Completed');
  } else if (filters.comm === 'pending') {
    rows = rows.filter((c) => c.comm.state !== 'Acknowledged' && c.comm.state !== 'No Action Required' && c.lifecycle !== 'Completed');
  }

  // More filters: Opter Order
  if (filters.orders === 'yes') {
    rows = rows.filter((c) => c.records.some((r) => r.type === 'Opter order'));
  } else if (filters.orders === 'no') {
    rows = rows.filter((c) => !c.records.some((r) => r.type === 'Opter order'));
  }

  // More filters: Tasks
  if (filters.tasks === 'me') {
    rows = rows.filter((c) => c.tasks.some((t) => t.status !== 'Done' && t.assignee === currentUser.name));
  } else if (filters.tasks === 'unassigned') {
    rows = rows.filter((c) => c.tasks.some((t) => t.status !== 'Done' && !t.assignee));
  }

  // More filters: Department (derived from the case's involved categories)
  if (filters.department) {
    rows = rows.filter((c) => c.categories.includes(filters.department));
  }

  // More filters: Task Owner
  if (filters.owner) {
    rows = rows.filter((c) => c.tasks.some((t) => t.assignee === filters.owner));
  }

  // Search filter — case #, client name, subject, Opter number
  if (q) {
    const term = q.toLowerCase();
    rows = rows.filter((c) => {
      const subject = c.conversation.find((m) => m.type === 'in' && m.subject)?.subject || c.conversation.find((m) => m.subject)?.subject || c.title || '';
      const cls = getCaseClassification(c);
      const typesStr = getCaseTypes(c).join(' ');
      const opterNums = c.records.map((r) => r.number).join(' ');
      const rawText = `${c.displayId || ''} #${c.id} ${c.id} ${c.customer} ${c.title} ${subject} ${cls} ${typesStr} ${opterNums} ${c.email}`;
      return rawText.toLowerCase().includes(term);
    });
  }

  // Sort by ID descending
  rows.sort((a, b) => b.id.localeCompare(a.id));

  const uniqueCustomers = Array.from(new Set(cases.map((c) => c.customer))).sort();
  const uniqueOwners = Array.from(
    new Set(cases.flatMap((c) => c.tasks.map((t) => t.assignee).filter((a): a is string => Boolean(a))))
  ).sort();
  const availableDepartments = DEPTS.filter((d) => cases.some((c) => c.categories.includes(d)));

  // Active filter chips
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (q) chips.push({ key: 'q', label: `Search: "${q}"`, onRemove: () => setQ('') });
  if (filters.status) chips.push({ key: 'status', label: `Status: ${filters.status}`, onRemove: () => setFilters({ ...filters, status: '' }) });
  if (filters.priority) chips.push({ key: 'priority', label: `Priority: ${priorityLabel(filters.priority)}`, onRemove: () => setFilters({ ...filters, priority: '' }) });
  if (filters.dateRange) chips.push({ key: 'dateRange', label: `Date: ${dateRangeLabels[filters.dateRange]}`, onRemove: () => setFilters({ ...filters, dateRange: '' }) });
  if (filters.overdue) chips.push({ key: 'overdue', label: 'Overdue only', onRemove: () => setFilters({ ...filters, overdue: false }) });
  if (filters.classification) chips.push({ key: 'classification', label: `Classification: ${filters.classification}`, onRemove: () => setFilters({ ...filters, classification: '' }) });
  if (filters.type) chips.push({ key: 'type', label: `Type: ${filters.type}`, onRemove: () => setFilters({ ...filters, type: '' }) });
  if (filters.department) chips.push({ key: 'department', label: `Department: ${filters.department}`, onRemove: () => setFilters({ ...filters, department: '' }) });
  if (filters.owner) chips.push({ key: 'owner', label: `Owner: ${filters.owner}`, onRemove: () => setFilters({ ...filters, owner: '' }) });
  if (filters.customer) chips.push({ key: 'customer', label: `Customer: ${filters.customer}`, onRemove: () => setFilters({ ...filters, customer: '' }) });
  if (filters.comm) chips.push({ key: 'comm', label: `Communication: ${commLabels[filters.comm]}`, onRemove: () => setFilters({ ...filters, comm: '' }) });
  if (filters.orders) chips.push({ key: 'orders', label: ordersLabels[filters.orders], onRemove: () => setFilters({ ...filters, orders: '' }) });
  if (filters.tasks) chips.push({ key: 'tasks', label: tasksLabels[filters.tasks], onRemove: () => setFilters({ ...filters, tasks: '' }) });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Cases</h1>
        </div>
      </div>

      <div className="filterbar" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="search" style={{ minWidth: 220, maxWidth: 300, flex: '1 1 220px' }}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by case #, client, subject, Opter number..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className={`sel ${filters.status ? 'on' : ''}`}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          aria-label="Filter by Status"
        >
          <option value="">All statuses</option>
          {[
            'Needs Review',
            'Ready for Order',
            'Order Created',
            'In Progress',
            'Awaiting Information',
            'Completed'
          ].map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          className={`sel ${filters.priority ? 'on' : ''}`}
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          aria-label="Filter by Priority"
        >
          <option value="">All priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Normal">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Date Range Filter */}
        <select
          className={`sel ${filters.dateRange ? 'on' : ''}`}
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          aria-label="Filter by Date Range"
        >
          <option value="">Date range: All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Past 7 days</option>
        </select>

        {/* Overdue quick toggle */}
        <button
          type="button"
          className={`btn btn-sm ${filters.overdue ? 'btn-primary' : ''}`}
          onClick={() => setFilters({ ...filters, overdue: !filters.overdue })}
          aria-pressed={filters.overdue}
          title="Show only cases with an overdue task"
        >
          Overdue
        </button>

        {/* More Filters popover */}
        <div className="inbox-filter-wrapper" ref={moreFilterPopRef}>
          <button
            type="button"
            className={`btn btn-sm ${showMoreFilterPop || moreFiltersActiveCount > 0 ? 'btn-primary' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreFilterPop(!showMoreFilterPop);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <FilterIcon />
            <span>More filters</span>
            {moreFiltersActiveCount > 0 && (
              <span className="inbox-filter-badge" style={{ marginLeft: 3 }}>
                {moreFiltersActiveCount}
              </span>
            )}
          </button>

          {showMoreFilterPop && (
            <div className="pop inbox-filter-pop on" style={{ display: 'block', minWidth: 260 }}>
              <div className="inbox-filter-pop-head">
                <div className="row" style={{ gap: 6 }}>
                  <FilterIcon />
                  <span className="inbox-filter-pop-title">More Filters</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button type="button" className="btn-link tiny" onClick={handleResetFilters}>
                    Clear all
                  </button>
                )}
              </div>

              <div className="inbox-filter-pop-body">
                {/* Classification */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Classification</label>
                  <select
                    className={`sel full ${filters.classification ? 'on' : ''}`}
                    value={filters.classification}
                    onChange={(e) => setFilters({ ...filters, classification: e.target.value })}
                  >
                    <option value="">All classifications</option>
                    {CLASSIFICATIONS.map((cl) => (
                      <option key={cl} value={cl}>{cl}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Type</label>
                  <select
                    className={`sel full ${filters.type ? 'on' : ''}`}
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="">All types</option>
                    {SERVICE_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                {availableDepartments.length > 0 && (
                  <div className="inbox-filter-group">
                    <label className="inbox-filter-label">Department</label>
                    <select
                      className={`sel full ${filters.department ? 'on' : ''}`}
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                      <option value="">All departments</option>
                      {availableDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Task Owner */}
                {uniqueOwners.length > 0 && (
                  <div className="inbox-filter-group">
                    <label className="inbox-filter-label">Task Owner</label>
                    <select
                      className={`sel full ${filters.owner ? 'on' : ''}`}
                      value={filters.owner}
                      onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                    >
                      <option value="">Any task owner</option>
                      {uniqueOwners.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Customer</label>
                  <select
                    className={`sel full ${filters.customer ? 'on' : ''}`}
                    value={filters.customer}
                    onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                  >
                    <option value="">All customers</option>
                    {uniqueCustomers.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Communication */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Communication</label>
                  <select
                    className={`sel full ${filters.comm ? 'on' : ''}`}
                    value={filters.comm}
                    onChange={(e) => setFilters({ ...filters, comm: e.target.value })}
                  >
                    <option value="">Communication: any</option>
                    <option value="done">Done</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Opter Order */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Opter Order</label>
                  <select
                    className={`sel full ${filters.orders ? 'on' : ''}`}
                    value={filters.orders}
                    onChange={(e) => setFilters({ ...filters, orders: e.target.value })}
                  >
                    <option value="">Opter order: any</option>
                    <option value="yes">Has Opter order</option>
                    <option value="no">No Opter order yet</option>
                  </select>
                </div>

                {/* Tasks */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Tasks</label>
                  <select
                    className={`sel full ${filters.tasks ? 'on' : ''}`}
                    value={filters.tasks}
                    onChange={(e) => setFilters({ ...filters, tasks: e.target.value })}
                  >
                    <option value="">Any tasks</option>
                    <option value="me">My open tasks</option>
                    <option value="unassigned">Has unassigned tasks</option>
                  </select>
                </div>
              </div>

              <div className="inbox-filter-pop-foot">
                <button
                  type="button"
                  className="btn btn-sm btn-primary full"
                  onClick={() => setShowMoreFilterPop(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button if any filter or query is active */}
        {(activeFiltersCount > 0 || q) && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleResetFilters}
            title="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips + matching count */}
      {(chips.length > 0 || true) && (
        <div className="cases-filter-chips">
          <span className="cases-match-count">
            <b>{rows.length}</b> matching case{rows.length === 1 ? '' : 's'}
          </span>
          {chips.map((chip) => (
            <span className="cases-chip" key={chip.key}>
              {chip.label}
              <button type="button" onClick={chip.onRemove} aria-label={`Remove filter: ${chip.label}`}>×</button>
            </span>
          ))}
          {chips.length > 0 && (
            <button type="button" className="btn-link tiny" onClick={handleResetFilters}>
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="tablewrap cases-tablewrap">
        <div className="tablescroll">
          <table className="t cases-t">
            <colgroup>
              <col style={{ width: 88 }} />
              <col style={{ width: 122 }} />
              <col style={{ width: 128 }} />
              <col style={{ width: 300 }} />
              <col style={{ width: 122 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 92 }} />
              <col style={{ width: 158 }} />
              <col style={{ width: 116 }} />
              <col style={{ width: 104 }} />
              <col style={{ width: 100 }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky-col case-col">Case</th>
                <th>Order Date</th>
                <th>Client Name</th>
                <th className="sticky-col subject-col">Subject</th>
                <th>Classification</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Type</th>
                <th>Communication</th>
                <th>Opter Order</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="muted" style={{ padding: 22, textAlign: 'center' }}>
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const doneCount = c.tasks.filter((t) => t.status === 'Done').length;
                  const total = c.tasks.length;

                  const hasReply = c.comm.state === 'Response Required';
                  const isCommDone = c.comm.state === 'Acknowledged' || c.comm.state === 'No Action Required' || c.lifecycle === 'Completed';
                  const subject = c.conversation.find((m) => m.type === 'in' && m.subject)?.subject || c.conversation.find((m) => m.subject)?.subject || c.title;
                  const classification = getCaseClassification(c);
                  const caseTypes = getCaseTypes(c);

                  return (
                    <tr key={c.id} onClick={() => onOpenCase(c.id, 'overview')}>
                      {/* 1. Case: Bold, sticky, with blinking email/red dot effect */}
                      <td className="sticky-col case-col">
                        <div className="cell-main mono flex items-center" style={{ fontWeight: 700 }}>
                          {hasReply && (
                            <span
                              className="relative inline-flex items-center justify-center mr-1.5 flex-shrink-0 text-[#D2463B]"
                              title="Customer replied"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D2463B]" />
                              </span>
                            </span>
                          )}
                          <span>{c.displayId || `#${c.id}`}</span>
                        </div>
                      </td>

                      {/* 2. Order Date: existing timestamp */}
                      <td>
                        <div className="cell-main cases-wrap-label" title={c.created}>{c.created}</div>
                      </td>

                      {/* 3. Client Name: full name where space allows, tooltip when truncated */}
                      <td>
                        <div
                          style={{ fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          title={c.customer}
                        >
                          {c.customer}
                        </div>
                      </td>

                      {/* 4. Subject: primary clickable field, sticky, up to two lines */}
                      <td className="sticky-col subject-col">
                        <div className="cases-subject-title" title={subject}>
                          {subject}
                        </div>
                      </td>

                      {/* 5. Classification: nature of the request, wraps rather than clipping */}
                      <td>
                        <span className="cases-wrap-label" style={{ fontWeight: 500, color: 'var(--ink)' }} title={classification}>
                          {classification}
                        </span>
                      </td>

                      {/* 6. Task: completion count */}
                      <td onClick={(e) => { e.stopPropagation(); onOpenCase(c.id, 'work'); }} title="View task list" style={{ cursor: 'pointer' }}>
                        {total === 0 ? (
                          <span className="muted tiny">No tasks</span>
                        ) : (
                          <span className="num small" style={{ fontWeight: 600 }}>{doneCount} of {total}</span>
                        )}
                      </td>

                      {/* 7. Priority: Urgent, High, Medium, Low */}
                      <td>
                        <span className={`chip ${priorityChipTone(c.priority)}`}>
                          {priorityLabel(c.priority)}
                        </span>
                      </td>

                      {/* 8. Status: workflow status, always fully visible */}
                      <td className="nowrap">{caseStatusChip(c)}</td>

                      {/* 9. Type: service or shipment type (compact badges, supports multiple) */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                          {caseTypes.map((t) => {
                            const { bg, text } = getTypeColor(t);
                            return (
                              <span
                                key={t}
                                className="chip plain tiny"
                                style={{
                                  fontWeight: 600,
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  background: bg,
                                  color: text,
                                  border: 'none'
                                }}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* 10. Communication: Done or Pending */}
                      <td title={isCommDone ? 'No customer reply currently pending' : 'Awaiting an outbound reply to the customer'}>
                        {isCommDone ? (
                          <div style={{ color: '#1B6A45', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2F7A4F', display: 'inline-block' }} />
                            Done
                          </div>
                        ) : (
                          <div style={{ color: '#975A08', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A1600B', display: 'inline-block' }} />
                            Pending
                          </div>
                        )}
                      </td>

                      {/* 11. Opter Order */}
                      <td className="nowrap">
                        {c.records.filter((r) => r.type === 'Opter order').length > 0 ? (
                          c.records
                            .filter((r) => r.type === 'Opter order')
                            .map((r, i) => (
                              <div key={i} className="mono tiny" style={{ fontWeight: 600 }}>{r.number}</div>
                            ))
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="tablefoot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Showing <b>{rows.length}</b> cases (total {cases.length})</span>
          <span>AA Logistik Operations Desk</span>
        </div>
      </div>
    </>
  );
};
