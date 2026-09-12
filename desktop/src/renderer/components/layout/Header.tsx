import React from 'react';
import { EngineStatus } from '../../../shared/types';
import { NavView } from './Sidebar';
import { ArrowDown, Cpu, Film, Moon, Sun, Plus } from 'lucide-react';

interface HeaderProps {
  currentView: NavView;
  engineStatus: EngineStatus | null;
  totalSpeed: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNewDownloadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  engineStatus,
  totalSpeed,
  theme,
  onToggleTheme,
  onNewDownloadClick
}) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'System overview and live download metrics' },
    'new-download': { title: 'New Download', subtitle: 'Analyze URLs, configure formats, and queue downloads' },
    queue: { title: 'Download Queue', subtitle: 'Active, queued, and paused jobs' },
    history: { title: 'Download History', subtitle: 'Completed media library and logs' },
    'format-explorer': { title: 'Format Explorer', subtitle: 'Deep dive into stream codecs, resolutions, and bitrate specs' },
    presets: { title: 'Presets & Profiles', subtitle: 'Reusable download configurations for rapid workflow' },
    'command-builder': { title: 'Command Builder', subtitle: 'Live CLI syntax generator & argument breakdown' },
    logs: { title: 'Logs & Diagnostics', subtitle: 'Real-time logs for yt-dlp, FFmpeg, and application events' },
    settings: { title: 'Settings', subtitle: 'General preferences, directories, and binary configurations' },
    about: { title: 'About & Open Source', subtitle: 'yt-dlp Desktop Control Center architecture' }
  };

  const current = titles[currentView] || { title: 'yt-dlp GUI', subtitle: '' };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        zIndex: 10
      }}
    >
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: 'var(--text-primary)' }}>
          {current.title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{current.subtitle}</p>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Speed Counter */}
        {totalSpeed && totalSpeed !== '0 B/s' && (
          <div
            className="badge badge-success"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}
          >
            <ArrowDown size={14} className="animate-pulse" />
            <span>{totalSpeed}</span>
          </div>
        )}

        {/* yt-dlp status pill */}
        <div
          className={`badge ${engineStatus?.ytdlpAvailable ? 'badge-success' : 'badge-danger'}`}
          title={
            engineStatus?.ytdlpAvailable
              ? `yt-dlp ${engineStatus.ytdlpVersion} (${engineStatus.ytdlpSource})`
              : 'yt-dlp not detected'
          }
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <Cpu size={13} />
          <span>{engineStatus?.ytdlpVersion ? `yt-dlp ${engineStatus.ytdlpVersion}` : 'yt-dlp Missing'}</span>
        </div>

        {/* FFmpeg status pill */}
        <div
          className={`badge ${engineStatus?.ffmpegAvailable ? 'badge-primary' : 'badge-warning'}`}
          title={engineStatus?.ffmpegAvailable ? `FFmpeg ${engineStatus.ffmpegVersion}` : 'FFmpeg not detected'}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <Film size={13} />
          <span>{engineStatus?.ffmpegAvailable ? 'FFmpeg Ready' : 'No FFmpeg'}</span>
        </div>

        {/* Theme switch */}
        <button
          onClick={onToggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Quick New Download button */}
        {currentView !== 'new-download' && (
          <button onClick={onNewDownloadClick} className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
            <Plus size={16} />
            <span>New Download</span>
          </button>
        )}
      </div>
    </header>
  );
};
