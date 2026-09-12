import React from 'react';
import { VeloceLogo } from '../VeloceLogo';
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
  Menu,
  Download,
  Boxes,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'new-download'
  | 'queue'
  | 'history'
  | 'format-explorer'
  | 'presets'
  | 'command-builder'
  | 'dependencies'
  | 'logs'
  | 'settings'
  | 'about';

interface NavGroup {
  title: string;
  items: {
    id: NavView;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[];
}

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
  const navGroups: NavGroup[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'new-download', label: 'New Download', icon: <PlusCircle size={16} /> },
        { id: 'queue', label: 'Queue', icon: <ListOrdered size={16} />, badge: queueCount },
        { id: 'history', label: 'History', icon: <History size={16} /> }
      ]
    },
    {
      title: 'AUTOMATION',
      items: [
        { id: 'presets', label: 'Presets & Profiles', icon: <SlidersHorizontal size={16} /> },
        { id: 'command-builder', label: 'Command Builder', icon: <Terminal size={16} /> },
        { id: 'format-explorer', label: 'Format Explorer', icon: <Layers size={16} /> }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'dependencies', label: 'Dependencies', icon: <Boxes size={16} /> },
        { id: 'logs', label: 'Logs & Diagnostics', icon: <ScrollText size={16} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
        { id: 'about', label: 'About', icon: <Info size={16} /> }
      ]
    }
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
        height: '100%',
        flexShrink: 0
      }}
    >
      {/* App Branding Top Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 16px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 10
        }}
      >
        <VeloceLogo size={collapsed ? 24 : 26} glow />

        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--text-primary)',
                letterSpacing: -0.2,
                whiteSpace: 'nowrap'
              }}
            >
              yt-veloce
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--accent-primary-bright)',
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
                fontWeight: 500
              }}
            >
              Media Engine
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav
        style={{
          flex: 1,
          padding: '10px 8px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        {navGroups.map((group) => (
          <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  padding: '4px 10px 6px 10px',
                  userSelect: 'none'
                }}
              >
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
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
                    gap: 10,
                    padding: collapsed ? '8px 0' : '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--accent-primary-glow)' : 'transparent',
                    color: isActive ? 'var(--accent-primary-bright)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 13,
                    border: isActive
                      ? '1px solid rgba(63, 185, 80, 0.3)'
                      : '1px solid transparent',
                    position: 'relative',
                    textAlign: 'left'
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'var(--accent-primary-bright)' : 'var(--text-muted)'
                    }}
                  >
                    {item.icon}
                  </div>

                  {!collapsed && (
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {item.badge !== undefined && Number(item.badge) > 0 && (
                    <span
                      className="badge-count"
                      style={{
                        position: collapsed ? 'absolute' : 'static',
                        top: collapsed ? 3 : undefined,
                        right: collapsed ? 3 : undefined,
                        backgroundColor: isActive ? 'rgba(46, 160, 67, 0.25)' : '#161b22',
                        color: isActive ? 'var(--accent-primary-bright)' : 'var(--text-muted)',
                        borderColor: isActive ? 'rgba(63, 185, 80, 0.4)' : 'var(--border-light)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Collapse Button (matching GitHub Power Suite) */}
      <div
        style={{
          padding: '8px',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 12,
            borderRadius: 'var(--radius-md)'
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={15} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
