import React, { useState } from 'react';
import { EngineStatus } from '../../../shared/types';
import { NavView } from './Sidebar';
import {
  Search,
  PlusCircle,
  Activity,
  ArrowDownCircle,
  Layers,
  Sparkles
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
    dashboard: 'Dashboard Overview',
    'new-download': 'New Media Download',
    queue: 'Active Download Queue',
    history: 'Download History',
    'format-explorer': 'Media Format Matrix',
    presets: 'Presets & Custom Profiles',
    'command-builder': 'CLI Command Studio',
    dependencies: 'System Dependencies & Tools',
    logs: 'Logs & Engine Diagnostics',
    settings: 'Application Preferences',
    about: 'About yt-veloce'
  };

  const descriptions: Record<NavView, string> = {
    dashboard: 'Real-time metrics, quick downloader, and performance statistics',
    'new-download': 'Analyze media streams, configure codecs, and queue downloads',
    queue: 'Manage running, queued, and paused media conversions',
    history: 'Offline download archive, completed media files, and redownloads',
    'format-explorer': 'Deep inspection of video resolutions, audio bitrates, and codecs',
    presets: 'Create, edit, and export tailored conversion profiles',
    'command-builder': 'Inspect and generate exact yt-dlp command lines for CLI scripts',
    dependencies: 'Status of backend binaries, FFmpeg, and multimedia toolchains',
    logs: 'Real-time streaming console output from yt-dlp and ffmpeg processes',
    settings: 'Custom paths, default directories, concurrency, and appearance',
    about: 'Version information, open-source acknowledgements, and credits'
  };

  const isDownloading = activeCount > 0;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-header)',
        zIndex: 10,
        gap: 16,
        userSelect: 'none'
      }}
    >
      {/* Left Title & Status Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: -0.2,
              whiteSpace: 'nowrap'
            }}
          >
            {titles[currentView] || 'Workspace'}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {descriptions[currentView] || 'Control panel'}
          </div>
        </div>

        {/* Live Active Downloads Pill */}
        {isDownloading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-glow)',
              border: '1px solid var(--accent-success-border)',
              fontSize: 12,
              color: 'var(--accent-primary-bright)',
              flexShrink: 0
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary-bright)',
                boxShadow: '0 0 6px rgba(63, 185, 80, 0.8)'
              }}
              className="animate-pulse"
            />
            <span style={{ fontWeight: 600 }}>{activeCount} downloading</span>
            {totalSpeed && totalSpeed !== '0 B/s' && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{totalSpeed}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Controls & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Quick New Download Button when in other views */}
        {currentView !== 'new-download' && (
          <button
            onClick={onNewDownloadClick}
            className="btn-primary"
            style={{
              padding: '5px 12px',
              fontSize: 12,
              height: 28,
              gap: 6
            }}
          >
            <PlusCircle size={13} />
            <span>New Download</span>
          </button>
        )}

        {/* Search Input Box */}
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
            placeholder="Search or jump to..."
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
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              padding: '1px 4px',
              borderRadius: 3,
              pointerEvents: 'none'
            }}
          >
            Ctrl K
          </span>
        </div>

        {/* Engine Status Badge */}
        <div
          style={{
            height: 28,
            padding: '0 10px',
            backgroundColor: engineStatus?.ytdlpAvailable
              ? 'var(--accent-primary-glow)'
              : 'var(--accent-danger-glow)',
            border: engineStatus?.ytdlpAvailable
              ? '1px solid var(--accent-success-border)'
              : '1px solid rgba(248, 81, 73, 0.4)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 500,
            color: engineStatus?.ytdlpAvailable
              ? 'var(--accent-primary-bright)'
              : 'var(--accent-danger)'
          }}
          title={
            engineStatus?.ytdlpAvailable
              ? `yt-dlp Engine Ready (${engineStatus.ytdlpVersion || 'Active'})`
              : 'yt-dlp Engine Not Detected'
          }
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: engineStatus?.ytdlpAvailable
                ? 'var(--accent-primary-bright)'
                : 'var(--accent-danger)',
              boxShadow: engineStatus?.ytdlpAvailable
                ? '0 0 6px rgba(63, 185, 80, 0.6)'
                : 'none'
            }}
          />
          <span>{engineStatus?.ytdlpAvailable ? 'Engine Online' : 'Engine Offline'}</span>
        </div>
      </div>
    </header>
  );
};
