import React, { useState, useRef, useEffect } from 'react';
import { InboxMessage, Mailbox, CaseItem } from '../types';
import { SearchIcon, FilterIcon, IntentIcon, ClipIcon, KebabIcon, CalIcon, DownArrowIcon } from '../icons';

interface InboxViewProps {
  messages: InboxMessage[];
  mailboxes: Mailbox[];
  cases: CaseItem[];
  onOpenCase: (id: string, tab?: string) => void;
  onOpenMsgDrawer: (id: string) => void;
  onOpenClassify: (m: InboxMessage) => void;
  onOpenMatch: (m: InboxMessage) => void;
  onDoRequiredAction: (m: InboxMessage) => void;
  onAssignToMe: (m: InboxMessage) => void;
  onMarkHandled: (m: InboxMessage) => void;
  onBulkAction: (action: string, ids: string[]) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  messages,
  mailboxes,
  cases,
  onOpenCase,
  onOpenMsgDrawer,
  onOpenClassify,
  onOpenMatch,
  onDoRequiredAction,
  onAssignToMe,
  onMarkHandled,
  onBulkAction
}) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [customer, setCustomer] = useState('');
  const [priority, setPriority] = useState('');
  const [mailbox, setMailbox] = useState('');
  const [range, setRange] = useState('7d');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Search expansion & filter popover states
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFilterPop, setShowFilterPop] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterPopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterPopRef.current && !filterPopRef.current.contains(e.target as Node)) {
        setShowFilterPop(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (!q.trim()) {
          setIsSearchExpanded(false);
        }
      }
      setOpenMenuId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [q]);

  const activeFiltersCount = (statusFilter ? 1 : 0) + (customer ? 1 : 0) + (priority ? 1 : 0) + (mailbox ? 1 : 0) + (range !== '7d' ? 1 : 0);

  const handleResetFilters = () => {
    setStatusFilter('');
    setCustomer('');
    setPriority('');
    setMailbox('');
    setRange('7d');
    setPage(1);
  };

  const NOW_MIN = 25 * 1440 + 11 * 60 + 45;

  const ageMin = (m: InboxMessage) => {
    const d = /24 Sep/.test(m.date) ? 24 : 25;
    const [h, mi] = m.time.split(':').map(Number);
    return NOW_MIN - (d * 1440 + h * 60 + mi);
  };

  const fmtDur = (m: number) => {
    if (m >= 1440) {
      const d = Math.floor(m / 1440);
      const h = Math.round((m % 1440) / 60);
      return `${d} d${h ? ' ' + h + ' h' : ''}`;
    }
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const r = m % 60;
      return `${h} h${r ? ' ' + r + ' min' : ''}`;
    }
    return `${m} min`;
  };

  const DATE_KEY = (d: string) => ({ '25 Sep 2026': 3, '24 Sep 2026': 2, '23 Sep 2026': 1 }[d] || 0);

  // Filter base
  let filtered = messages.filter((m) => {
    if (range === 'today' && m.date !== '25 Sep 2026') return false;
    if (customer && m.customer !== customer) return false;
    if (priority && (m.priority || 'Normal') !== priority) return false;
    if (mailbox && m.mailbox !== mailbox) return false;
    if (statusFilter === 'attention' && !m.attention) return false;
    if (statusFilter === 'processed' && m.state !== 'Processed') return false;
    if (statusFilter === 'failed' && m.state !== 'Processing Failed') return false;
    if (q) {
      const searchStr = (m.subject + m.sender + m.customer + (m.caseId || '') + (m.match || '') + (m.orderRef || '')).toLowerCase();
      if (!searchStr.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const tabFiltered = filtered.sort(
    (a, b) => DATE_KEY(b.date) - DATE_KEY(a.date) || b.time.localeCompare(a.time)
  );

  const totalPages = Math.max(1, Math.ceil(tabFiltered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = tabFiltered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Metrics
  const todayMsgs = messages.filter((m) => /25 Sep/.test(m.date));
  const waitingMsgs = messages.filter((m) => m.attention);
  const oldestWaiting = waitingMsgs.slice().sort((a, b) => ageMin(b) - ageMin(a))[0];
  const fromYdayCount = waitingMsgs.filter((m) => !/25 Sep/.test(m.date)).length;
  const unownedCount = waitingMsgs.filter((m) => !m.assignee).length;
  const replyMsgs = messages.filter((m) => m.unreadReply && m.attention);
  const oldestReply = replyMsgs.slice().sort((a, b) => ageMin(b) - ageMin(a))[0];
  const autoHandled = todayMsgs.filter((m) => m.state === 'Processed' && !m.attention).length;
  const autoPct = todayMsgs.length ? Math.round((autoHandled / todayMsgs.length) * 100) : 0;
  const byBox = mailboxes.map((b) => ({ a: b.addr.split('@')[0], n: todayMsgs.filter((m) => m.mailbox === b.addr).length }));

  const uniqueCustomers = Array.from(new Set(messages.map((m) => m.customer))).sort();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(pagedRows.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const STATUS_VIEW: Record<string, [string, string]> = {
    'Possible Existing Case': ['Needs review', 'amber'],
    'Review Required': ['Needs review', 'amber'],
    'Existing Order Change': ['Needs review', 'amber'],
    'Missing Information': ['Missing information', 'amber'],
    'Classification Unclear': ['Classification unclear', 'amber'],
    'Processing Failed': ['Processing failed', 'red'],
    'Requires Investigation': ['Requires investigation', 'red'],
    'Ready for Validation': ['Ready for validation', 'green'],
    'Skipped': ['Skipped — no case', 'plain'],
    'Customer Replied': ['Customer replied', 'red'],
    'Processed': ['Processed', 'green']
  };

  const renderStatusChip = (st: string) => {
    const [label, tone] = STATUS_VIEW[st] || [st, ''];
    return (
      <span className={`spill ${tone}`}>
        <span className="sd" />
        {label}
      </span>
    );
  };

  const renderReqAction = (m: InboxMessage) => {
    if (m.state === 'Skipped') {
      return <span className="muted tiny">{m.skipReason || 'Skipped'}</span>;
    }
    const c = m.caseId ? cases.find((x) => x.id === m.caseId) : null;
    let label = '';
    let tone = 'amber';

    if (m.unreadReply) {
      label = 'Review the reply in the case';
      tone = 'red';
    } else if (c && c.intake) {
      label = 'Confirm classification';
      tone = 'amber';
    } else if (m.match) {
      label = `Confirm link to ${m.match}`;
      tone = 'amber';
    } else {
      switch (m.state) {
        case 'Classification Unclear':
          label = 'Classify manually';
          tone = 'amber';
          break;
        case 'Processing Failed':
          label = 'Open attachment and classify';
          tone = 'red';
          break;
        case 'Ready for Validation':
          label = 'Validate and create case';
          tone = 'green';
          break;
        case 'Existing Order Change':
          label = `Create change case for Opter ${m.orderRef}`;
          tone = 'amber';
          break;
        case 'Missing Information':
          label = 'Create case, then ask for missing info';
          tone = 'amber';
          break;
        case 'Review Required':
          label = 'Decide: one case or split';
          tone = 'amber';
          break;
        case 'Requires Investigation':
          label = 'Create deviation case';
          tone = 'red';
          break;
        default:
          if (c && c.comm.state === 'Response Required') {
            label = 'Reply to the customer';
            tone = 'amber';
          }
      }
    }

    if (!label) return <span className="muted tiny">No action needed</span>;

    return (
      <button
        className={`reqact ${tone}`}
        onClick={(e) => {
          e.stopPropagation();
          onDoRequiredAction(m);
        }}
      >
        {label} <span aria-hidden="true">→</span>
      </button>
    );
  };

  return (
    <>
      <div className="ihead">
        <div>
          <h1>Inbox</h1>
          <div className="isub">Incoming customer requests</div>
        </div>
      </div>

      {/* Filterbar */}
      <div className="filterbar">
        <div className="spacer" />
        {/* Expandable Search Bar on click */}
        <div className="inbox-search-wrapper" ref={searchContainerRef}>
          {!(isSearchExpanded || q) ? (
            <button
              type="button"
              className="iconbtn inbox-search-btn"
              title="Search inbox"
              aria-label="Search inbox"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 60);
              }}
            >
              <SearchIcon />
            </button>
          ) : (
            <div className="inbox-search-expanded" onClick={(e) => e.stopPropagation()}>
              <SearchIcon />
              <input
                ref={searchInputRef}
                placeholder="Subject, sender, case or order number…"
                value={q}
                autoFocus
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    if (!q) setIsSearchExpanded(false);
                    else {
                      setQ('');
                      setIsSearchExpanded(false);
                    }
                  }
                }}
              />
              <button
                type="button"
                className="inbox-search-clear"
                title="Clear / Close"
                onClick={(e) => {
                  e.stopPropagation();
                  setQ('');
                  setIsSearchExpanded(false);
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Single filter icon button on right of search that opens filter popup */}
        <div className="inbox-filter-wrapper" ref={filterPopRef}>
          <button
            type="button"
            className={`iconbtn inbox-filter-trigger-btn ${showFilterPop || activeFiltersCount > 0 ? 'active' : ''}`}
            title="Filter inbox"
            aria-label="Filter inbox"
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterPop(!showFilterPop);
            }}
          >
            <FilterIcon />
            {activeFiltersCount > 0 && (
              <span className="inbox-filter-badge">{activeFiltersCount}</span>
            )}
          </button>

          {showFilterPop && (
            <div className="pop inbox-filter-pop on" style={{ display: 'block' }}>
              <div className="inbox-filter-pop-head">
                <div className="row" style={{ gap: 6 }}>
                  <FilterIcon />
                  <span className="inbox-filter-pop-title">Filter Inbox</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    className="btn-link tiny"
                    onClick={handleResetFilters}
                  >
                    Reset all
                  </button>
                )}
              </div>

              <div className="inbox-filter-pop-body">
                {/* 1. Status */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Status</label>
                  <select
                    className={`sel full ${statusFilter ? 'on' : ''}`}
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All incoming</option>
                    <option value="attention">Needs attention</option>
                    <option value="processed">Processed</option>
                    <option value="failed">Processing Failed</option>
                  </select>
                </div>

                {/* 2. All Customers */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Customer</label>
                  <select
                    className="sel full"
                    value={customer}
                    onChange={(e) => {
                      setCustomer(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All customers</option>
                    {uniqueCustomers.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 2. All Priorities */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Priority</label>
                  <select
                    className={`sel full ${priority ? 'on' : ''}`}
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All priorities</option>
                    {['Urgent', 'High', 'Normal', 'Low'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* 3. All Mailboxes */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Mailbox</label>
                  <select
                    className="sel full"
                    value={mailbox}
                    onChange={(e) => {
                      setMailbox(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All mailboxes</option>
                    {mailboxes.map((m) => (
                      <option key={m.id} value={m.addr}>{m.name} ({m.addr})</option>
                    ))}
                  </select>
                </div>

                {/* 4. Received dates */}
                <div className="inbox-filter-group">
                  <label className="inbox-filter-label">Received dates</label>
                  <label className="datesel full" style={{ width: '100%', boxSizing: 'border-box' }}>
                    <CalIcon />
                    <select
                      value={range}
                      onChange={(e) => {
                        setRange(e.target.value);
                        setPage(1);
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="today">Today (25 Sep)</option>
                      <option value="7d">Last 7 days</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="inbox-filter-pop-foot">
                <button
                  type="button"
                  className="btn btn-sm btn-primary full"
                  onClick={() => setShowFilterPop(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk selection bar */}
      {selectedIds.size > 0 && (
        <div className="bulkbar">
          <b>{selectedIds.size} selected</b>
          <button className="btn btn-sm" onClick={() => onBulkAction('me', Array.from(selectedIds))}>Assign to me</button>
          <button className="btn btn-sm" onClick={() => setSelectedIds(new Set())}>Clear selection</button>
        </div>
      )}

      {/* Table */}
      <div className="tablewrap">
        <div className="tablescroll">
          <table className="t ibx">
            <thead>
              <tr>
                <th className="ck">
                  <input
                    type="checkbox"
                    checked={pagedRows.length > 0 && pagedRows.every((r) => selectedIds.has(r.id))}
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Received <DownArrowIcon /></th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Received in</th>
                <th>AI classification</th>
                <th>AI confidence</th>
                <th>Case / Order</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Required action</th>
                <th>Assigned to</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="muted" style={{ padding: 22 }}>
                    Nothing here. Every processed message stays available under All incoming.
                  </td>
                </tr>
              ) : (
                pagedRows.map((m) => {
                  const mb = mailboxes.find((x) => x.addr === m.mailbox);
                  const isSelected = selectedIds.has(m.id);
                  const confTone = m.conf != null ? (m.conf >= 85 ? 'green' : m.conf >= 70 ? 'amber' : 'orange') : '';

                  return (
                    <tr
                      key={m.id}
                      aria-selected={isSelected}
                      onClick={() => {
                        if (m.caseId) {
                          onOpenCase(m.caseId, m.reply ? 'conversation' : 'overview');
                        } else {
                          onOpenMsgDrawer(m.id);
                        }
                      }}
                    >
                      <td className="ck" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(m.id)}
                          aria-label="Select message"
                        />
                      </td>
                      <td className="nowrap">
                        <div>{m.date.replace(' 2026', '')}</div>
                        <div className="cell-sub num">{m.time}</div>
                      </td>
                      <td>
                        <div className="cell-main">
                          {m.customer}
                        </div>
                        <div className="cell-sub">{m.sender}</div>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <div className="cell-main subj flex items-center">
                          {m.unreadReply && (
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
                          <span>{m.subject}</span>
                        </div>
                      </td>
                      <td className="nowrap">
                        <div className="cell-main" style={{ fontWeight: 400 }}>
                          {mb ? mb.name : m.mailbox}
                        </div>
                        <div className="cell-sub">{m.mailbox}</div>
                      </td>
                      <td>
                        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                          <span className="itile blue">
                            <IntentIcon icon={m.icon} />
                          </span>
                          <div className="intent">
                            {m.intent ? m.intent[0] : m.ai}
                            {m.intent && m.intent[1] && (
                              <>
                                <br />
                                {m.intent[1]}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {m.conf != null ? (
                          <div className="conf">
                            <span className="num">{m.conf}%</span>
                            <span className="cbar">
                              <i className={confTone} style={{ width: `${m.conf}%` }} />
                            </span>
                          </div>
                        ) : (
                          <span className="muted tiny" title="Nothing could be read from attachment">n/a</span>
                        )}
                      </td>
                      <td>
                        {m.caseId ? (
                          <a
                            className="assoc blue mono"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCase(m.caseId!, 'overview');
                            }}
                          >
                            {m.caseId}
                          </a>
                        ) : m.match ? (
                          <span className="assoc amber">
                            Possible
                            <br />
                            <span className="mono">{m.match}</span>
                          </span>
                        ) : m.orderRef ? (
                          <span className="assoc green">
                            Existing order
                            <br />
                            <span className="mono">{m.orderRef}</span>
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`chip ${m.priority === 'High' ? 'red' : m.priority === 'Low' ? 'blue' : m.priority === 'Urgent' ? 'red' : 'plain'}`}>
                          {m.priority || 'Normal'}
                        </span>
                      </td>
                      <td>{renderStatusChip(m.state)}</td>
                      <td>{renderReqAction(m)}</td>
                      <td className="nowrap">
                        {m.assignee ? (
                          <span className="row" style={{ gap: 7 }}>
                            <span className="avatar" style={{ width: 22, height: 22, fontSize: 9, flex: 'none' }}>
                              {m.assignee.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                            </span>
                            {m.assignee}
                          </span>
                        ) : (
                          <span className="muted">Unassigned</span>
                        )}
                      </td>
                      <td className="ck" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                        <button
                          className="kebab"
                          onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                        >
                          <KebabIcon />
                        </button>
                        {openMenuId === m.id && (
                          <div className="rowmenu" style={{ position: 'absolute', right: 8, top: 'calc(100% - 4px)', zIndex: 120 }}>
                            {m.caseId ? (
                              <button onClick={() => { setOpenMenuId(null); onOpenCase(m.caseId!, 'overview'); }}>
                                Open case {m.caseId}
                              </button>
                            ) : (
                              <button onClick={() => { setOpenMenuId(null); onOpenClassify(m); }}>
                                Classify and create case
                              </button>
                            )}
                            <button onClick={() => { setOpenMenuId(null); onOpenMsgDrawer(m.id); }}>
                              Preview email
                            </button>
                            <button onClick={() => { setOpenMenuId(null); onAssignToMe(m); }}>
                              Assign to me
                            </button>
                            {m.attention && (
                              <button onClick={() => { setOpenMenuId(null); onMarkHandled(m); }}>
                                Mark as handled
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="ifoot">
          <span>
            Showing {tabFiltered.length ? (currentPage - 1) * perPage + 1 : 0}–
            {Math.min(currentPage * perPage, tabFiltered.length)} of {tabFiltered.length} emails
          </span>
          <div className="spacer" />
          <button
            className="pgbtn"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className="pgbtn"
              aria-current={currentPage === i + 1}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pgbtn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
          <select
            className="sel"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
