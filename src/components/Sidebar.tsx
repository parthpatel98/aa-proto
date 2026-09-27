import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HamburgerIcon,
  InboxNavIcon,
  CasesNavIcon,
  WorkNavIcon,
  KpiNavIcon,
  ReviewNavIcon,
  PerformanceNavIcon,
  UsersNavIcon,
  DeptsNavIcon,
  CategoriesNavIcon,
  ClassesNavIcon,
  TemplatesNavIcon,
  RulesNavIcon,
  DataNavIcon,
  MailboxesNavIcon,
  MarkLogo
} from '../icons';
import { Section, OpsTab, InsTab, AdmTab } from '../types';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  section: Section;
  setSection: (s: Section) => void;
  opsTab: OpsTab;
  setOpsTab: (t: OpsTab) => void;
  insTab: InsTab;
  setInsTab: (t: InsTab) => void;
  admTab: AdmTab;
  setAdmTab: (t: AdmTab) => void;
  attentionInboxCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  section,
  setSection,
  opsTab,
  setOpsTab,
  insTab,
  setInsTab,
  admTab,
  setAdmTab,
  attentionInboxCount
}) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 0,
    opacity: 0
  });

  const updateIndicator = useCallback(() => {
    if (!scrollRef.current) return;
    const activeItem = scrollRef.current.querySelector('.sidebar-item.active') as HTMLElement | null;
    if (activeItem) {
      const itemRect = activeItem.getBoundingClientRect();
      const containerRect = scrollRef.current.getBoundingClientRect();
      const indicatorHeight = Math.max(16, Math.min(20, itemRect.height - 8));
      const topPos = (itemRect.top - containerRect.top + scrollRef.current.scrollTop) + (itemRect.height - indicatorHeight) / 2;
      setIndicatorStyle({
        top: Math.round(topPos),
        height: Math.round(indicatorHeight),
        opacity: 1
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, []);

  useEffect(() => {
    updateIndicator();
    const timer = setTimeout(updateIndicator, 40);
    return () => clearTimeout(timer);
  }, [section, opsTab, insTab, admTab, collapsed, updateIndicator]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, label: string) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredTooltip({
        label,
        top: rect.top + rect.height / 2
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredTooltip(null);
  };

  const handleNavClick = (fn: () => void) => {
    setHoveredTooltip(null);
    fn();
  };

  return (
    <aside className={`sidebar-nav ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Top Header of Sidebar */}
      <div className="sidebar-top">
        {!collapsed ? (
          <>
            <div
              className="sidebar-brand-wrap"
              onClick={() => {
                setSection('ops');
                setOpsTab('inbox');
              }}
              title="AA Logistik Operations"
            >
              <MarkLogo className="sidebar-logo" />
            </div>
            <button
              type="button"
              className="sidebar-hamburger-btn"
              onClick={() => {
                setHoveredTooltip(null);
                onToggleCollapse();
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <HamburgerIcon />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="sidebar-hamburger-btn"
            onClick={() => {
              setHoveredTooltip(null);
              onToggleCollapse();
            }}
            onMouseEnter={(e) => handleMouseEnter(e, 'Expand sidebar')}
            onMouseLeave={handleMouseLeave}
            aria-label="Expand sidebar"
          >
            <HamburgerIcon />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-scroll" ref={scrollRef} onScroll={handleMouseLeave}>
        {/* Solid dark traveling vertical indicator line */}
        <div
          className="sidebar-indicator"
          style={{
            transform: `translateY(${indicatorStyle.top}px)`,
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.opacity
          }}
          aria-hidden="true"
        />
        {/* Section 1: Operations */}
        <div className="sidebar-section">
          {!collapsed ? (
            <div className="sidebar-section-heading">Operations</div>
          ) : (
            <div className="sidebar-section-divider" />
          )}
          <nav className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-item ${section === 'ops' && opsTab === 'inbox' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('ops');
                setOpsTab('inbox');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Inbox')}
              onMouseLeave={handleMouseLeave}
              aria-label="Inbox"
            >
              <span className="sidebar-icon">
                <InboxNavIcon />
              </span>
              {!collapsed && (
                <>
                  <span className="sidebar-label">Inbox</span>
                  {attentionInboxCount > 0 && (
                    <span className="sidebar-badge">{attentionInboxCount}</span>
                  )}
                </>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-item ${(section === 'ops' && opsTab === 'cases') || section === 'case' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('ops');
                setOpsTab('cases');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Cases')}
              onMouseLeave={handleMouseLeave}
              aria-label="Cases"
            >
              <span className="sidebar-icon">
                <CasesNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Cases</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'ops' && opsTab === 'work' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('ops');
                setOpsTab('work');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'My Work')}
              onMouseLeave={handleMouseLeave}
              aria-label="My Work"
            >
              <span className="sidebar-icon">
                <WorkNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">My Work</span>}
            </button>
          </nav>
        </div>

        {/* Section 2: Insights */}
        <div className="sidebar-section">
          {!collapsed ? (
            <div className="sidebar-section-heading">Insights</div>
          ) : (
            <div className="sidebar-section-divider" />
          )}
          <nav className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-item ${section === 'insights' && insTab === 'kpis' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('insights');
                setInsTab('kpis');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'KPI Dashboard')}
              onMouseLeave={handleMouseLeave}
              aria-label="KPI Dashboard"
            >
              <span className="sidebar-icon">
                <KpiNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">KPI Dashboard</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'insights' && insTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('insights');
                setInsTab('overview');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Operations Dashboard')}
              onMouseLeave={handleMouseLeave}
              aria-label="Operations Dashboard"
            >
              <span className="sidebar-icon">
                <ReviewNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Operations Dashboard</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'insights' && insTab === 'performance' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('insights');
                setInsTab('performance');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Performance')}
              onMouseLeave={handleMouseLeave}
              aria-label="Performance"
            >
              <span className="sidebar-icon">
                <PerformanceNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Performance</span>}
            </button>
          </nav>
        </div>

        {/* Section 3: Administration */}
        <div className="sidebar-section">
          {!collapsed ? (
            <div className="sidebar-section-heading">Administration</div>
          ) : (
            <div className="sidebar-section-divider" />
          )}
          <nav className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'users' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('users');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Users')}
              onMouseLeave={handleMouseLeave}
              aria-label="Users"
            >
              <span className="sidebar-icon">
                <UsersNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Users</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'depts' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('depts');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Departments')}
              onMouseLeave={handleMouseLeave}
              aria-label="Departments"
            >
              <span className="sidebar-icon">
                <DeptsNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Departments</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'cats' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('cats');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Categories')}
              onMouseLeave={handleMouseLeave}
              aria-label="Categories"
            >
              <span className="sidebar-icon">
                <CategoriesNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Categories</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'classes' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('classes');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Case classes')}
              onMouseLeave={handleMouseLeave}
              aria-label="Case classes"
            >
              <span className="sidebar-icon">
                <ClassesNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Case classes</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'templates' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('templates');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Task templates')}
              onMouseLeave={handleMouseLeave}
              aria-label="Task templates"
            >
              <span className="sidebar-icon">
                <TemplatesNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Task templates</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'customers' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('customers');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Customers & rules')}
              onMouseLeave={handleMouseLeave}
              aria-label="Customers & rules"
            >
              <span className="sidebar-icon">
                <RulesNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Customers & rules</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'profiles' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('profiles');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Required data')}
              onMouseLeave={handleMouseLeave}
              aria-label="Required data"
            >
              <span className="sidebar-icon">
                <DataNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Required data</span>}
            </button>

            <button
              type="button"
              className={`sidebar-item ${section === 'admin' && admTab === 'mailboxes' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => {
                setSection('admin');
                setAdmTab('mailboxes');
              })}
              onMouseEnter={(e) => handleMouseEnter(e, 'Mailboxes')}
              onMouseLeave={handleMouseLeave}
              aria-label="Mailboxes"
            >
              <span className="sidebar-icon">
                <MailboxesNavIcon />
              </span>
              {!collapsed && <span className="sidebar-label">Mailboxes</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Floating themed tooltip on the right side of collapsed sidebar */}
      {collapsed && hoveredTooltip && (
        <div
          className="sidebar-floating-tooltip"
          style={{ top: hoveredTooltip.top }}
        >
          {hoveredTooltip.label}
        </div>
      )}
    </aside>
  );
};
