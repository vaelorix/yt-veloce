import React from 'react';
import { Radio, Heart, GitBranch, Shield, Terminal, BookOpen, ExternalLink, Zap, Star, MessageSquare } from 'lucide-react';
import { VeloceLogo } from '../components/VeloceLogo';
import authorAvatar from '../assets/author-avatar.jpg';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TelegramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.05-.16-.03-.23-.02-.1.02-1.74 1.11-4.91 3.25-.46.32-.88.47-1.26.46-.42-.01-1.22-.24-1.82-.43-.74-.24-1.32-.37-1.27-.78.03-.21.32-.43.89-.66 3.49-1.52 5.83-2.52 7.02-3 3.34-1.39 4.03-1.63 4.49-1.64.1 0 .32.02.46.14.12.1.15.24.17.34-.01.07.01.22-.01.37z" />
  </svg>
);

export const AboutView: React.FC = () => {
  const openExternal = (url: string) => {
    try {
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(url);
        return;
      }
    } catch (e) {
      console.warn('Failed to call electronAPI.openExternal:', e);
    }
    try {
      if (window.electronAPI?.openPath) {
        window.electronAPI.openPath(url);
        return;
      }
    } catch (e) {
      console.warn('Failed to call electronAPI.openPath:', e);
    }
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Failed to call window.open:', e);
    }
  };

  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* App Branding Hero Card */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <VeloceLogo size={64} glow />
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
          yt<span style={{ color: 'var(--accent-primary-bright)' }}>-</span>veloce
        </h2>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          High-Velocity Desktop Media Engine for yt-dlp • Version 1.0.0
        </div>

        <p style={{ maxWidth: 660, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 14 }}>
          A cross-platform desktop application designed to expose the full power and configurability of <strong>yt-dlp</strong> through a modern, responsive user interface without sacrificing access to advanced CLI flags, stream controls, and automation presets.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="https://github.com/vaelorix/yt-veloce"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternal('https://github.com/vaelorix/yt-veloce');
            }}
            className="btn-primary"
            style={{ fontSize: 13, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', cursor: 'pointer' }}
          >
            <Star size={15} fill="currentColor" color="#e3b341" />
            <span>Star on GitHub</span>
            <ExternalLink size={12} />
          </a>
          <a
            href="https://discord.gg/H5MNcFW63r"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternal('https://discord.gg/H5MNcFW63r');
            }}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', cursor: 'pointer' }}
          >
            <Radio size={15} color="var(--accent-primary-bright)" />
            <span>yt-dlp Discord</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Creator & Maintainer Card */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={authorAvatar}
              alt="Vaelorix"
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent-primary-bright)',
                boxShadow: '0 0 16px rgba(46, 160, 67, 0.35)',
                display: 'block'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary-bright)',
                border: '2px solid #0d1117'
              }}
              title="Active Developer"
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Vaelorix
              </h3>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(46, 160, 67, 0.15)',
                  color: 'var(--accent-primary-bright)',
                  border: '1px solid rgba(46, 160, 67, 0.3)'
                }}
              >
                Project Creator & Maintainer
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '5px 0 0 0', maxWidth: 480, lineHeight: 1.5 }}>
              If you enjoy using <strong>yt-veloce</strong>, please consider giving the repository a star on GitHub! Your support helps continue active development.
            </p>
          </div>
        </div>

        {/* Social Connect Links */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href="https://github.com/vaelorix"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternal('https://github.com/vaelorix');
            }}
            className="btn-secondary"
            style={{ fontSize: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', cursor: 'pointer' }}
            title="GitHub Profile"
          >
            <GithubIcon size={15} />
            <span>vaelorix</span>
          </a>

          <a
            href="https://instagram.com/thevaelorix18"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternal('https://instagram.com/thevaelorix18');
            }}
            className="btn-secondary"
            style={{
              fontSize: 12,
              padding: '7px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              borderColor: 'rgba(225, 48, 108, 0.3)',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            title="Instagram: thevaelorix18"
          >
            <span style={{ color: '#E1306C', display: 'flex', alignItems: 'center' }}>
              <InstagramIcon size={15} />
            </span>
            <span>thevaelorix18</span>
          </a>

          <a
            href="https://t.me/theVaelorix"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternal('https://t.me/theVaelorix');
            }}
            className="btn-secondary"
            style={{
              fontSize: 12,
              padding: '7px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              borderColor: 'rgba(0, 136, 204, 0.3)',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            title="Telegram: @theVaelorix"
          >
            <span style={{ color: '#0088cc', display: 'flex', alignItems: 'center' }}>
              <TelegramIcon size={15} />
            </span>
            <span>@theVaelorix</span>
          </a>
        </div>
      </div>

      {/* Details Grid */}
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
