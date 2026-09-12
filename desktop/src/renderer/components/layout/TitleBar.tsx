import React, { useState, useEffect } from 'react';
import { EngineStatus } from '../../../shared/types';
import { NavView } from './Sidebar';
import { Sun, Moon, Minus, Square, Copy, X } from 'lucide-react';

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
        {/* Glowing Futuristic Logo Mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 0 7px rgba(63, 185, 80, 0.45))',
            transition: 'filter 0.3s ease'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="veloceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3fb950" />
                <stop offset="60%" stopColor="#2ea043" />
                <stop offset="100%" stopColor="#238636" />
              </linearGradient>
              <linearGradient id="innerArrow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d2f9d6" />
              </linearGradient>
            </defs>
            {/* Hexagonal Core Plate */}
            <path
              d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z"
              fill="url(#veloceGrad)"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.2"
            />
            {/* Download Arrow / Media Play Vector */}
            <path
              d="M12 7V13.5M12 13.5L9.2 10.8M12 13.5L14.8 10.8M8 16H16"
              stroke="url(#innerArrow)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: -0.3,
              color: 'var(--text-primary)'
            }}
          >
            Veloce
          </span>
          <span
            style={{
              fontWeight: 500,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary-bright)',
              opacity: 0.95
            }}
          >
            yt-dlp
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '1px 5px',
              borderRadius: 3,
              backgroundColor: 'rgba(63, 185, 80, 0.12)',
              border: '1px solid rgba(63, 185, 80, 0.35)',
              color: 'var(--accent-primary-bright)'
            }}
          >
            STUDIO
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
