import React from 'react';

export const LOGO_SRC = '/image%20(14).png';

export const MarkSymbol: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <symbol id="mark" viewBox="0 0 72 50">
      <path d="M4 46 22 4h11L15 46z" fill="#2FB8AE" />
      <path d="M24 46 42 4h11L35 46z" fill="currentColor" />
      <path d="M44 46 52 27h11l-8 19z" fill="#2FB8AE" opacity=".75" />
    </symbol>
  </svg>
);

export const MarkLogo: React.FC<{
  className?: string;
  inverted?: boolean;
  style?: React.CSSProperties;
  height?: number | string;
  alt?: string;
}> = ({ className = 'bm', inverted = false, style, height, alt = 'AA Logistik' }) => (
  <img
    src={LOGO_SRC}
    alt={alt}
    className={`brand-logo-img ${className}`}
    style={{
      objectFit: 'contain',
      ...(inverted ? { filter: 'brightness(0) invert(1)' } : {}),
      ...(height !== undefined ? { height } : {}),
      ...style,
    }}
  />
);

export const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
    <line x1="3" y1="5" x2="17" y2="5" />
    <line x1="3" y1="10" x2="17" y2="10" />
    <line x1="3" y1="15" x2="17" y2="15" />
  </svg>
);

export const SignOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6" />
    <path d="M10.5 11.5 14 8l-3.5-3.5" />
    <path d="M14 8H6" />
  </svg>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="1.5 2.5 14.5 2.5 9.5 8.5 9.5 13.5 6.5 13.5 6.5 8.5 1.5 2.5" />
  </svg>
);

export const InboxNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 4.5h14v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5v-11z" />
    <path d="M3 10.5h4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2h4" />
  </svg>
);

export const CasesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h3.8a1.5 1.5 0 0 1 1.2.6L10.7 6h4.8A1.5 1.5 0 0 1 17 7.5v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5v-10z" />
  </svg>
);

export const WorkNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3.5" y="3.5" width="13" height="13" rx="2" />
    <path d="m6.5 10 2.5 2.5 4.5-5" />
  </svg>
);

export const KpiNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="16" x2="16" y2="16" />
    <rect x="4.5" y="10" width="2.5" height="6" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="8.75" y="5" width="2.5" height="11" rx="0.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="13" y="7.5" width="2.5" height="8.5" rx="0.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const ReviewNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6v4l3 2" />
  </svg>
);

export const PerformanceNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.5 14.5l4-5 3.5 3.5 5.5-7.5" />
    <path d="M12.5 5.5h4v4" />
  </svg>
);

export const UsersNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="7" r="3" />
    <path d="M3 16c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" />
    <path d="M13.5 5a2.5 2.5 0 0 1 0 4.5M16.5 15.5c0-1.8-1.2-3.2-3-3.7" />
  </svg>
);

export const DeptsNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="7.5" y="2.5" width="5" height="4" rx="1" />
    <rect x="2.5" y="13.5" width="5" height="4" rx="1" />
    <rect x="12.5" y="13.5" width="5" height="4" rx="1" />
    <path d="M10 6.5v4M5 10.5h10M5 10.5v3M15 10.5v3" />
  </svg>
);

export const CategoriesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 3 3.5 6.5 10 10l6.5-3.5L10 3z" />
    <path d="M3.5 10.5 10 14l6.5-3.5" />
    <path d="M3.5 14 10 17.5 16.5 14" />
  </svg>
);

export const ClassesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3.5" width="14" height="3.5" rx="1" />
    <rect x="3" y="8.5" width="10" height="3.5" rx="1" />
    <rect x="3" y="13.5" width="12" height="3.5" rx="1" />
  </svg>
);

export const TemplatesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="4.5" width="11" height="12" rx="1.5" />
    <path d="M3.5 13.5v-8a2 2 0 0 1 2-2h8" />
    <path d="m8 10.5 2 2 4-4" />
  </svg>
);

export const RulesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 3 4 5.5v5c0 4 2.6 6.8 6 8 3.4-1.2 6-4 6-8v-5L10 3z" />
    <path d="m7.5 10.5 2 2 3.5-4" />
  </svg>
);

export const DataNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="10" cy="5.5" rx="6.5" ry="2.5" />
    <path d="M3.5 5.5v9c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-9" />
    <path d="M3.5 10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" />
  </svg>
);

export const MailboxesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4.5" width="14" height="11" rx="1.5" />
    <path d="m3.5 5.5 6.5 5 6.5-5" />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </svg>
);

export const BellIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 6.5a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z" />
    <path d="M6.5 13a1.6 1.6 0 0 0 3 0" />
  </svg>
);

export const PlayIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <path d="M6.8 5.8 10 8l-3.2 2.2Z" fill="currentColor" />
  </svg>
);

export const TickIcon: React.FC = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2">
    <path d="M2.5 6.2 4.8 8.5 9.5 3.8" />
  </svg>
);

export const DocIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M4 2h5l3 3v9H4z" />
    <path d="M9 2v3h3" />
  </svg>
);

export const AiIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 11, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} style={style}>
    <path d="M8 1.5 9.4 6 14 7.4 9.4 8.8 8 13.4 6.6 8.8 2 7.4 6.6 6z" />
  </svg>
);

export const ClipIcon: React.FC = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 7.5 8 12.5a3.2 3.2 0 0 1-4.5-4.5l5.3-5.3a2.1 2.1 0 0 1 3 3L6.6 10.9a1 1 0 0 1-1.5-1.5L10 4.6" />
  </svg>
);

export const KebabIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="3.2" r="1.3" />
    <circle cx="8" cy="8" r="1.3" />
    <circle cx="8" cy="12.8" r="1.3" />
  </svg>
);

export const CalIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.8v2.4M11 1.8v2.4" />
  </svg>
);

export const DownArrowIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ display: 'inline-block', verticalAlign: '-1px' }}>
    <path d="M6 2v8M2.8 6.8 6 10l3.2-3.2" />
  </svg>
);

export const IntentIcon: React.FC<{ icon?: string }> = ({ icon = 'mail' }) => {
  switch (icon) {
    case 'truck':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1.5 4h8v7h-8zM9.5 6.5h3l2 2.2V11h-5" />
          <circle cx="4.5" cy="11.8" r="1.3" fill="#fff" />
          <circle cx="11.8" cy="11.8" r="1.3" fill="#fff" />
        </svg>
      );
    case 'unknown':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M6.3 6.3a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.7.6-.7 1.1v.3" />
          <circle cx="8" cy="11.3" r=".5" fill="currentColor" />
        </svg>
      );
    case 'doc':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 1.8h5l3 3v9.4H4z" />
          <path d="M9 1.8v3h3M6 8.5h4M6 11h4" />
        </svg>
      );
    case 'new':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
          <path d="M8 5.3v5.4M5.3 8h5.4" />
        </svg>
      );
    case 'chat':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" />
        </svg>
      );
    case 'multi':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 2.5h8v8M3 5h8v8.5H3z" />
        </svg>
      );
    case 'complaint':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 1.8h5l3 3v9.4H4z" />
          <path d="M8 6.5v3" />
          <circle cx="8" cy="11.6" r=".5" fill="currentColor" />
        </svg>
      );
    case 'finance':
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1.8" y="4" width="12.4" height="8.5" rx="1.5" />
          <path d="M1.8 7h12.4" />
        </svg>
      );
    default:
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
          <path d="m2.5 4.5 5.5 4 5.5-4" />
        </svg>
      );
  }
};

export const TabOverviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </svg>
);

export const TabDataIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 4h11v9.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2.5 13.5z" />
    <path d="M2.5 7.5h11" />
    <path d="M6 1.8h4a1 1 0 0 1 1 1V4H5v-1.2a1 1 0 0 1 1-1z" />
  </svg>
);

export const TabTasksIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
    <path d="m5 8 2 2 4-4" />
  </svg>
);

export const TabConversationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H6.5L3 14.5v-2H2.5A1.5 1.5 0 0 1 1 11V5a1.5 1.5 0 0 1 1.5-1.5z" />
  </svg>
);

export const TabActivityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.5V8l2.5 1.8" />
  </svg>
);
