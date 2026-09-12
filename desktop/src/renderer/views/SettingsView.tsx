import React, { useState, useEffect } from 'react';
import { AppSettings, EngineStatus } from '../../../shared/types';
import {
  Settings,
  Folder,
  Cpu,
  Film,
  Globe,
  Sliders,
  Check,
  RotateCw,
  Cookie,
  Sun,
  Moon
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  engineStatus: EngineStatus | null;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onSelectDirectory: () => Promise<string | null>;
  onRefreshEngine: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  engineStatus,
  onSaveSettings,
  onSelectDirectory,
  onRefreshEngine
}) => {
  const [defaultOutputDir, setDefaultOutputDir] = useState(settings.defaultOutputDir);
  const [maxConcurrentDownloads, setMaxConcurrentDownloads] = useState(settings.maxConcurrentDownloads);
  const [filenameTemplate, setFilenameTemplate] = useState(settings.filenameTemplate);
  const [customYtDlpPath, setCustomYtDlpPath] = useState(settings.customYtDlpPath);
  const [customFFmpegPath, setCustomFFmpegPath] = useState(settings.customFFmpegPath);
  const [theme, setTheme] = useState(settings.theme);
  const [defaultRateLimit, setDefaultRateLimit] = useState(settings.defaultRateLimit);
  const [proxyUrl, setProxyUrl] = useState(settings.proxyUrl);
  const [browserCookies, setBrowserCookies] = useState(settings.browserCookies);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDefaultOutputDir(settings.defaultOutputDir);
    setMaxConcurrentDownloads(settings.maxConcurrentDownloads);
    setFilenameTemplate(settings.filenameTemplate);
    setCustomYtDlpPath(settings.customYtDlpPath);
    setCustomFFmpegPath(settings.customFFmpegPath);
    setTheme(settings.theme);
    setDefaultRateLimit(settings.defaultRateLimit);
    setProxyUrl(settings.proxyUrl);
    setBrowserCookies(settings.browserCookies);
  }, [settings]);

  const handleBrowseOutputDir = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setDefaultOutputDir(dir);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      defaultOutputDir,
      maxConcurrentDownloads: Number(maxConcurrentDownloads) || 2,
      filenameTemplate,
      customYtDlpPath,
      customFFmpegPath,
      theme,
      defaultRateLimit,
      proxyUrl,
      browserCookies
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const insertTag = (tag: string) => {
    setFilenameTemplate((prev) => `${prev}${tag}`);
  };

  return (
    <div className="view-container">
      {/* Save Button Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 12,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            System configuration, binary paths, directories, and interface preferences
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedNotice && (
            <span
              style={{
                fontSize: 12,
                color: 'var(--accent-primary-bright)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Check size={14} /> Saved!
            </span>
          )}
          <button onClick={handleSave} className="btn-primary" style={{ padding: '6px 18px', fontSize: 12 }}>
            Save Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Section 1: Downloads & Storage */}
        <div className="card">
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Folder size={15} color="var(--accent-primary-bright)" />
            Download Paths & Naming
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Default Destination Directory
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={defaultOutputDir}
                  onChange={(e) => setDefaultOutputDir(e.target.value)}
                  style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                />
                <button type="button" onClick={handleBrowseOutputDir} className="btn-secondary" style={{ fontSize: 12 }}>
                  Browse
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Output Filename Template
              </label>
              <input
                type="text"
                value={filenameTemplate}
                onChange={(e) => setFilenameTemplate(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />

              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Insert Tag:</span>
                {[
                  '%(title)s',
                  '%(id)s',
                  '%(ext)s',
                  '%(uploader)s',
                  '%(upload_date)s',
                  '%(resolution)s'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="badge-count"
                    style={{ cursor: 'pointer', fontSize: 10, padding: '2px 6px', border: '1px solid var(--border-light)' }}
                    onClick={() => insertTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                <span>Max Concurrent Downloads</span>
                <span style={{ color: 'var(--accent-primary-bright)', fontFamily: 'var(--font-mono)' }}>
                  {maxConcurrentDownloads}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={maxConcurrentDownloads}
                onChange={(e) => setMaxConcurrentDownloads(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                <span>1 (Sequential)</span>
                <span>4 (Balanced)</span>
                <span>8 (High Bandwidth)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Engine Binaries */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Cpu size={15} color="var(--accent-primary-bright)" />
              Engine & Executables
            </h3>
            <button onClick={onRefreshEngine} className="btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>
              <RotateCw size={12} /> Re-detect
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                <span>yt-dlp Binary Path</span>
                <span style={{ color: engineStatus?.ytdlpAvailable ? 'var(--accent-primary-bright)' : 'var(--accent-danger)' }}>
                  {engineStatus?.ytdlpVersion ? `Detected: ${engineStatus.ytdlpVersion}` : 'Not detected'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Auto-detected (workspace / system PATH)"
                value={customYtDlpPath}
                onChange={(e) => setCustomYtDlpPath(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Active source: {engineStatus?.ytdlpSource} ({engineStatus?.ytdlpPath || 'default'})
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                <span>FFmpeg Executable Path</span>
                <span style={{ color: engineStatus?.ffmpegAvailable ? 'var(--accent-primary-bright)' : 'var(--accent-warning)' }}>
                  {engineStatus?.ffmpegAvailable ? `Ready (${engineStatus.ffmpegVersion || 'detected'})` : 'Missing'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Auto-detected in system PATH"
                value={customFFmpegPath}
                onChange={(e) => setCustomFFmpegPath(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Required for stream merging, audio extraction, and metadata embedding.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Network & Proxy */}
        <div className="card">
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Globe size={15} color="var(--accent-info)" />
            Network & Proxy
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Default Rate Limit
              </label>
              <input
                type="text"
                placeholder="e.g. 5M (5 Megabytes/sec), 500K"
                value={defaultRateLimit}
                onChange={(e) => setDefaultRateLimit(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Proxy Server
              </label>
              <input
                type="text"
                placeholder="http://proxy.example.com:8080 or socks5://127.0.0.1:1080"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Interface & Appearance (with Segmented Controls) */}
        <div className="card">
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Sliders size={15} color="var(--accent-primary-bright)" />
            Interface & Cookies
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Theme Toggle (matching Screenshot 1 segmented control) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Theme Mode</label>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>GitHub Obsidian dark or clean light</div>
              </div>

              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Layout Density */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Table Layout</label>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Column widths and row padding</div>
              </div>

              <div className="segmented-control">
                <button type="button" className="segmented-btn active">
                  Comfortable
                </button>
                <button type="button" className="segmented-btn">
                  Compact
                </button>
              </div>
            </div>

            {/* Browser Cookies */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Load Cookies from Installed Browser
              </label>
              <select
                value={browserCookies}
                onChange={(e) => setBrowserCookies(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Disabled (No cookies)</option>
                <option value="chrome">Google Chrome</option>
                <option value="firefox">Mozilla Firefox</option>
                <option value="edge">Microsoft Edge</option>
                <option value="brave">Brave Browser</option>
                <option value="opera">Opera</option>
                <option value="chromium">Chromium</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
