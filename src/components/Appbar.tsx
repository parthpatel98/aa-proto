import React, { useState, useRef, useEffect } from 'react';
import { MarkLogo, SearchIcon, BellIcon, PlayIcon, SignOutIcon } from '../icons';
import { Section, OpsTab, InsTab, AdmTab, CaseItem, InboxMessage, NotificationItem } from '../types';
import { useCurrentUser } from '../UserContext';

interface AppbarProps {
  sidebarCollapsed: boolean;
  section: Section;
  setSection: (s: Section) => void;
  opsTab: OpsTab;
  setOpsTab: (t: OpsTab) => void;
  insTab: InsTab;
  setInsTab: (t: InsTab) => void;
  admTab: AdmTab;
  setAdmTab: (t: AdmTab) => void;
  onOpenCase: (id: string, tab?: string) => void;
  onOpenMsgDrawer: (id: string) => void;
  cases: CaseItem[];
  messages: InboxMessage[];
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onOpenDemo: () => void;
  onSignOutPrompt: () => void;
  onSelectSearchCustomer: (cust: string) => void;
  activeCaseId?: string | null;
}

export const Appbar: React.FC<AppbarProps> = ({
  sidebarCollapsed,
  section,
  setSection,
  opsTab,
  setOpsTab,
  insTab,
  setInsTab,
  admTab,
  setAdmTab,
  onOpenCase,
  onOpenMsgDrawer,
  cases,
  messages,
  notifications,
  onMarkAllRead,
  onOpenDemo,
  onSignOutPrompt,
  onSelectSearchCustomer,
  activeCaseId
}) => {
  const currentUser = useCurrentUser();
  const [gq, setGq] = useState('');
  const [showSearchPop, setShowSearchPop] = useState(false);
  const [showNotifPop, setShowNotifPop] = useState(false);
  const [showProfilePop, setShowProfilePop] = useState(false);
  const [curSearchIndex, setCurSearchIndex] = useState(0);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const attentionInboxCount = messages.filter((m) => m.attention).length;

  // Compute search results
  const computeSearchResults = () => {
    const q = gq.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{ g: string; ic: string; t: string; s: string; go: () => void }> = [];

    // Cases
    cases
      .filter((c) =>
        (c.id + ' ' + c.title + ' ' + c.customer + ' ' + c.contact + ' ' + c.records.map((r) => r.number).join(' '))
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 5)
      .forEach((c) => {
        results.push({
          g: 'Cases',
          ic: '▣',
          t: `${c.id} · ${c.title}`,
          s: `${c.customer} · ${c.lifecycle}`,
          go: () => onOpenCase(c.id, 'overview')
        });
      });

    // Customers
    const uniqueCusts = Array.from(new Set(cases.map((c) => c.customer).concat(messages.map((m) => m.customer)))).filter(
      (c) => c && c.toLowerCase().includes(q)
    );
    uniqueCusts.slice(0, 4).forEach((cu) => {
      const n = cases.filter((c) => c.customer === cu).length;
      results.push({
        g: 'Customers',
        ic: '◉',
        t: cu,
        s: `${n} case${n === 1 ? '' : 's'}`,
        go: () => {
          onSelectSearchCustomer(cu);
        }
      });
    });

    // Opter numbers
    cases.forEach((c) => {
      c.records.forEach((r) => {
        if (r.number.toLowerCase().includes(q)) {
          results.push({
            g: 'Opter & WMS references',
            ic: '#',
            t: r.number,
            s: `${r.type} · ${c.id} · ${c.customer}`,
            go: () => onOpenCase(c.id, 'data')
          });
        }
      });
    });

    // Emails
    messages
      .filter((m) => (m.subject + ' ' + m.customer + ' ' + m.sender).toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((m) => {
        results.push({
          g: 'Emails',
          ic: '✉',
          t: m.subject,
          s: `${m.customer} · ${m.sender} · ${m.time}`,
          go: () => {
            if (m.caseId) {
              onOpenCase(m.caseId, 'conversation');
            } else {
              setSection('ops');
              setOpsTab('inbox');
              onOpenMsgDrawer(m.id);
            }
          }
        });
      });

    return results;
  };

  const searchResults = computeSearchResults();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSearchPop(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPop(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfilePop(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="appbar">
      {sidebarCollapsed && (
        <div
          className="brand cursor-pointer"
          onClick={() => {
            setSection('ops');
            setOpsTab('inbox');
          }}
          title="AA Logistik Operations"
        >
          <MarkLogo className="bm" />
          <span>Operations</span>
        </div>
      )}


      <div className="spacer" />
      <div className="gsearch" ref={searchBoxRef}>
        <SearchIcon />
        <input
          id="gq"
          placeholder="Search cases, customers, Opter numbers"
          autoComplete="off"
          value={gq}
          onChange={(e) => {
            setGq(e.target.value);
            setShowSearchPop(true);
            setCurSearchIndex(0);
          }}
          onFocus={() => { if (gq.trim()) setShowSearchPop(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowSearchPop(false);
            if (e.key === 'Enter' && searchResults.length > 0) {
              searchResults[curSearchIndex]?.go();
              setShowSearchPop(false);
              setGq('');
            }
          }}
        />
        {showSearchPop && searchResults.length > 0 && (
          <div className="gspop">
            {searchResults.map((it, idx) => (
              <div
                key={idx}
                className={`gsitem ${idx === curSearchIndex ? 'on' : ''}`}
                onClick={() => {
                  it.go();
                  setShowSearchPop(false);
                  setGq('');
                }}
                onMouseEnter={() => setCurSearchIndex(idx)}
              >
                <span className="gsic">{it.ic}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="gst">{it.t}</div>
                  <div className="gss">{it.s}</div>
                </div>
              </div>
            ))}
            <div className="gsfoot">Enter to open · Esc to close</div>
          </div>
        )}
      </div>
      <button className="iconbtn" id="demoBtn" title="Demo journeys" onClick={onOpenDemo}>
        <PlayIcon />
      </button>
      <div style={{ position: 'relative' }} ref={notifRef}>
        <button
          className="iconbtn"
          id="notifBtn"
          title="Notifications"
          onClick={(e) => {
            e.stopPropagation();
            setShowNotifPop(!showNotifPop);
          }}
        >
          <BellIcon />
        </button>
        {showNotifPop && (
          <div className="pop on" id="notifPop" style={{ display: 'block' }}>
            <div className="card-head">
              <h3>Notifications</h3>
            </div>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="notif"
                onClick={() => {
                  setShowNotifPop(false);
                  if (n.go.case) {
                    onOpenCase(n.go.case, n.go.tab);
                  } else if (n.go.ops) {
                    setSection('ops');
                    setOpsTab(n.go.ops);
                  }
                }}
              >
                <span className="nd" />
                <div>
                  <div>{n.text}</div>
                  <div className="tiny muted">{n.meta}</div>
                </div>
              </div>
            ))}
            <div className="tablefoot">Mentions notify people. They never change who owns a task.</div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }} ref={profileRef}>
        <button
          className="avatar-btn"
          id="whoBtn"
          title="User profile"
          aria-label="User profile"
          onClick={(e) => {
            e.stopPropagation();
            setShowProfilePop(!showProfilePop);
          }}
        >
          <span className="avatar">MA</span>
        </button>

        {showProfilePop && (
          <div className="pop profile-pop on" style={{ display: 'block' }}>
            <div className="profile-pop-user">
              <span className="avatar profile-pop-avatar">MA</span>
              <div className="profile-pop-info">
                <div className="profile-pop-name">{currentUser.name}</div>
                <div className="profile-pop-role">{currentUser.role}</div>
                <div className="profile-pop-dept">Transport · AA Logistik</div>
              </div>
            </div>
            <div className="profile-pop-divider" />
            <div className="profile-pop-actions">
              <button
                className="profile-pop-signout-btn"
                onClick={() => {
                  setShowProfilePop(false);
                  onSignOutPrompt();
                }}
              >
                <SignOutIcon />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
