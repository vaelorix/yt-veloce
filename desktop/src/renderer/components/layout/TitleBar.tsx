import React, { useState, useEffect } from 'react';
import { EngineStatus } from '../../../shared/types';
import { NavView } from './Sidebar';
import { Sun, Moon, Minus, Square, Copy, X } from 'lucide-react';
import { VeloceLogo } from '../VeloceLogo';

interface TitleBarProps {
  currentView: NavView;
  engineStatus: EngineStatus | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentView,
  engineStatus,
  theme,
  onToggleTheme
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximized state
    if (window.electronAPI?.isWindowMaximized) {
      window.electronAPI.isWindowMaximized().then(setIsMaximized);
    }

    // Subscribe to maximize/unmaximize IPC changes
    if (window.electronAPI?.onWindowMaximizedChange) {
      const unsubscribe = window.electronAPI.onWindowMaximizedChange((max) => {
        setIsMaximized(max);
      });
      return unsubscribe;
    }
  }, []);

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };

  const viewLabels: Record<NavView, string> = {
    dashboard: 'Dashboard',
    'new-download': 'New Download',
    queue: 'Download Queue',
    history: 'History',
    'format-explorer': 'Format Explorer',
    presets: 'Presets & Profiles',
    'command-builder': 'Command Builder',
    dependencies: 'System Dependencies',
    logs: 'Logs & Diagnostics',
    settings: 'Settings',
    about: 'About'
  };

  return (
    <header className="window-titlebar">
      {/* Left Brand Identity & Logo */}
      <div className="window-titlebar-left">
        {/* Glowing Futuristic yt-veloce Logo */}
        <VeloceLogo size={22} glow />

        {/* Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: -0.3,
              color: 'var(--text-primary)'
            }}
          >
            yt-veloce
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '1px 5px',
              borderRadius: 3,
              backgroundColor: 'rgba(46, 160, 67, 0.16)',
              border: '1px solid rgba(46, 160, 67, 0.4)',
              color: 'var(--accent-primary-bright)'
            }}
          >
            v1.0.0
          </span>
        </div>
      </div>

      {/* Center Drag Region & View Breadcrumb */}
      <div className="window-titlebar-center">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--text-muted)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '3px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary-bright)',
              boxShadow: '0 0 5px rgba(63, 185, 80, 0.6)'
            }}
          />
          <span>Control Center</span>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {viewLabels[currentView] || 'Workspace'}
          </span>
        </div>
      </div>

      {/* Right Controls: Engine Status, Theme Toggle & Window Buttons */}
      <div className="window-titlebar-right">
        {/* Engine Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            padding: '2px 10px',
            marginRight: 6,
            color: engineStatus?.ytdlpAvailable ? 'var(--text-secondary)' : 'var(--accent-warning)',
            backgroundColor: 'rgba(22, 27, 34, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)'
          }}
          title={
            engineStatus
              ? `yt-dlp: ${engineStatus.ytdlpVersion || 'Ready'} | FFmpeg: ${
                  engineStatus.ffmpegAvailable ? 'Ready' : 'Missing'
                }`
              : 'Initializing engine...'
          }
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: engineStatus?.ffmpegAvailable
                ? 'var(--accent-primary-bright)'
                : 'var(--accent-warning)',
              boxShadow: engineStatus?.ffmpegAvailable
                ? '0 0 6px rgba(63, 185, 80, 0.8)'
                : '0 0 6px rgba(210, 153, 34, 0.8)'
            }}
          />
          <span>{engineStatus?.ffmpegAvailable ? 'FFmpeg Active' : 'FFmpeg Missing'}</span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            marginRight: 4,
            transition: 'color var(--transition-fast)'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Frameless Window Minimize Button */}
        <button
          onClick={handleMinimize}
          className="window-control-btn"
          title="Minimize"
        >
          <Minus size={14} />
        </button>

        {/* Frameless Window Maximize / Restore Button */}
        <button
          onClick={handleMaximize}
          className="window-control-btn"
          title={isMaximized ? 'Restore Down' : 'Maximize'}
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>

        {/* Frameless Window Close Button */}
        <button
          onClick={handleClose}
          className="window-control-btn close"
          title="Close"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  );
};
