import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  History,
  Layers,
  SlidersHorizontal,
  Terminal,
  ScrollText,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'new-download'
  | 'queue'
  | 'history'
  | 'format-explorer'
  | 'presets'
  | 'command-builder'
  | 'logs'
  | 'settings'
  | 'about';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  queueCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  queueCount
}) => {
  const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'new-download', label: 'New Download', icon: <PlusCircle size={19} /> },
    { id: 'queue', label: 'Queue', icon: <ListOrdered size={19} />, badge: queueCount },
    { id: 'history', label: 'History', icon: <History size={19} /> },
    { id: 'format-explorer', label: 'Format Explorer', icon: <Layers size={19} /> },
    { id: 'presets', label: 'Presets & Profiles', icon: <SlidersHorizontal size={19} /> },
    { id: 'command-builder', label: 'Command Builder', icon: <Terminal size={19} /> },
    { id: 'logs', label: 'Logs & Activity', icon: <ScrollText size={19} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={19} /> },
    { id: 'about', label: 'About', icon: <Info size={19} /> },
  ];

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        zIndex: 20,
        userSelect: 'none',
        height: '100%'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 18px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Radio size={18} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>yt-dlp GUI</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pro Control Center</div>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="btn-icon"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: 28, height: 28, padding: 0 }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--accent-primary-glow)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                position: 'relative'
              }}
              title={collapsed ? item.label : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>

              {!collapsed && (
                <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>
                  {item.label}
                </span>
              )}

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="badge badge-primary"
                  style={{
                    position: collapsed ? 'absolute' : 'static',
                    top: collapsed ? 4 : undefined,
                    right: collapsed ? 4 : undefined,
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 11,
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>v1.0.0 (Desktop)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-success)' }} />
            Ready
          </span>
        </div>
      )}
    </aside>
  );
};
