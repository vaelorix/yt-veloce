import React, { useState } from 'react';
import { EngineStatus } from '../../../shared/types';
import { NavView } from './Sidebar';
import {
  Play,
  Square,
  Search,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Zap,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentView: NavView;
  engineStatus: EngineStatus | null;
  totalSpeed: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNewDownloadClick: () => void;
  activeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  engineStatus,
  totalSpeed,
  theme,
  onToggleTheme,
  onNewDownloadClick,
  activeCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const titles: Record<NavView, string> = {
    dashboard: 'Dashboard',
    'new-download': 'New Download',
    queue: 'Download Queue',
    history: 'Download History',
    'format-explorer': 'Format Explorer',
    presets: 'Presets & Profiles',
    'command-builder': 'Command Builder',
    logs: 'Logs & Diagnostics',
    settings: 'Settings',
    about: 'About'
  };

  const isDownloading = activeCount > 0;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-header)',
        zIndex: 10,
        gap: 12,
        userSelect: 'none'
      }}
    >
      {/* Left / Center Workflow Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Preset Selector Dropdown Button (matching Screenshot 1) */}
        <button
          onClick={onNewDownloadClick}
          className="btn-secondary"
          style={{
            padding: '5px 10px',
            fontSize: 12,
            gap: 6,
            height: 30,
            borderRadius: 'var(--radius-md)'
          }}
          title="Quick profile selector"
        >
          <Zap size={13} color="var(--accent-primary-bright)" />
          <span style={{ fontWeight: 500 }}>Best Quality (MP4)</span>
          <ChevronDown size={12} color="var(--text-muted)" />
        </button>

        {/* Action Button: Vibrant Green Run / Stop Button */}
        <button
          onClick={onNewDownloadClick}
          className={isDownloading ? 'btn-danger' : 'btn-primary'}
          style={{
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 600,
            height: 30,
            borderRadius: 'var(--radius-md)',
            gap: 6
          }}
        >
          {isDownloading ? (
            <>
              <Square size={12} fill="currentColor" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* State Metrics (matching Screenshot 1: State: idle / Elapsed: —) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            marginLeft: 4,
            color: 'var(--text-muted)'
          }}
        >
          <div>
            State:{' '}
            <span
              style={{
                color: isDownloading ? 'var(--accent-primary-bright)' : 'var(--text-primary)',
                fontWeight: 600
              }}
            >
              {isDownloading ? 'active' : 'idle'}
            </span>
          </div>

          {isDownloading && totalSpeed && totalSpeed !== '0 B/s' ? (
            <div>
              Speed:{' '}
              <span style={{ color: 'var(--accent-primary-bright)', fontWeight: 600 }}>
                {totalSpeed}
              </span>
            </div>
          ) : (
            <div>
              Elapsed: <span style={{ color: 'var(--text-secondary)' }}>—</span>
            </div>
          )}

          <div>
            Active:{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {activeCount}
            </span>
          </div>
        </div>
      </div>

      {/* Right Tools & Environment Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search or Command Box (matching Screenshot 1 & 4) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: 200
          }}
        >
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 9,
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search or run..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 28,
              paddingRight: 48,
              paddingTop: 4,
              paddingBottom: 4,
              fontSize: 12,
              height: 28,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-light)'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 6,
              fontSize: 10,
              color: 'var(--text-muted)',
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              padding: '1px 4px',
              borderRadius: 3,
              pointerEvents: 'none'
            }}
          >
            Ctrl K
          </span>
        </div>

        {/* Engine / Python Badge (matching Python 3.11.6 badge in screenshot 1) */}
        <div
          style={{
            height: 28,
            padding: '0 10px',
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)'
          }}
          title={engineStatus?.ytdlpSource || 'yt-dlp Engine'}
        >
          {engineStatus?.ytdlpVersion
            ? `yt-dlp ${engineStatus.ytdlpVersion}`
            : 'yt-dlp Ready'}
        </div>

        {/* Connection Status Badge (matching ● Connected badge in screenshot 1) */}
        <div
          style={{
            height: 28,
            padding: '0 10px',
            backgroundColor: engineStatus?.ytdlpAvailable
              ? 'rgba(46, 160, 67, 0.15)'
              : 'rgba(248, 81, 73, 0.15)',
            border: engineStatus?.ytdlpAvailable
              ? '1px solid rgba(63, 185, 80, 0.4)'
              : '1px solid rgba(248, 81, 73, 0.4)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: engineStatus?.ytdlpAvailable
              ? 'var(--accent-primary-bright)'
              : 'var(--accent-danger)'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: engineStatus?.ytdlpAvailable
                ? 'var(--accent-primary-bright)'
                : 'var(--accent-danger)',
              boxShadow: engineStatus?.ytdlpAvailable
                ? '0 0 6px rgba(63, 185, 80, 0.6)'
                : 'none'
            }}
          />
          <span>{engineStatus?.ytdlpAvailable ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Theme Toggle Icon */}
        <button
          onClick={onToggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          style={{ width: 28, height: 28, padding: 0 }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
