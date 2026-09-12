import React from 'react';
import { Radio, Heart, GitBranch, Shield, Terminal, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { VeloceLogo } from '../components/VeloceLogo';

export const AboutView: React.FC = () => {
  return (
    <div className="view-container">
      <div className="card" style={{ textAlign: 'center', padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 18 }}>
          <VeloceLogo size={64} glow />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>yt-veloce</h2>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          High-Velocity Desktop Orchestration Layer for yt-dlp • Version 1.0.0
        </div>

        <p style={{ maxWidth: 640, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 16 }}>
          A cross-platform desktop application designed to expose the full power and configurability of <strong>yt-dlp</strong> through a modern, responsive user interface without sacrificing access to advanced CLI flags, stream controls, and automation presets.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => window.electronAPI?.openPath?.('https://github.com/vaelorix/yt-veloce')}
            className="btn-secondary"
            style={{ fontSize: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <GitBranch size={15} /> GitHub Repository <ExternalLink size={12} />
          </button>
          <button
            onClick={() => window.electronAPI?.openPath?.('https://discord.gg/H5MNUF6')}
            className="btn-secondary"
            style={{ fontSize: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Radio size={15} color="var(--accent-primary-bright)" /> yt-dlp Discord <ExternalLink size={12} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Architecture & Core Principles */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="var(--accent-primary)" />
            Core Architectural Principles
          </h3>
          <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>
              <strong>Engine Preservation:</strong> We never reinvent yt-dlp. yt-dlp is the battle-tested extraction engine; this GUI is its high-productivity desktop cockpit.
            </li>
            <li>
              <strong>Two-Way Transparency:</strong> Every GUI selection translates into readable, safe yt-dlp CLI arguments in real-time.
            </li>
            <li>
              <strong>Strict Security:</strong> Context isolation is strictly enabled, node integration is disabled in renderer, and CLI arguments are spawned without arbitrary shell execution.
            </li>
            <li>
              <strong>Cross-Platform SQLite:</strong> Complete persistent history and presets stored in local SQLite without native compilation friction.
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={18} color="var(--accent-purple)" />
            Quick Keyboard Shortcuts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span>New Download Page</span>
              <kbd style={{ backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Ctrl + N</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Toggle Sidebar</span>
              <kbd style={{ backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Ctrl + B</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span>View Download Queue</span>
              <kbd style={{ backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Ctrl + J</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Settings & Paths</span>
              <kbd style={{ backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Ctrl + ,</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
