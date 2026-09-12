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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Configure application parameters, download directories, and execution environments.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedNotice && (
            <span style={{ fontSize: 13, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={16} /> Saved!
            </span>
          )}
          <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px' }}>
            Save Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Section 1: Downloads & Storage */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Folder size={18} color="var(--accent-primary)" />
            Download Paths & Naming
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Default Destination Directory
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={defaultOutputDir}
                  onChange={(e) => setDefaultOutputDir(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleBrowseOutputDir} className="btn-secondary" style={{ fontSize: 12 }}>
                  Browse
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Output Filename Template
              </label>
              <input
                type="text"
                value={filenameTemplate}
                onChange={(e) => setFilenameTemplate(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
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
                    className="badge badge-neutral"
                    style={{ cursor: 'pointer', fontSize: 10, padding: '3px 6px' }}
                    onClick={() => insertTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Max Concurrent Downloads: {maxConcurrentDownloads}
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={maxConcurrentDownloads}
                onChange={(e) => setMaxConcurrentDownloads(parseInt(e.target.value, 10))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
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
            <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="var(--accent-primary)" />
              Engine & Executables
            </h3>
            <button onClick={onRefreshEngine} className="btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>
              <RotateCw size={13} /> Re-detect
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <span>yt-dlp Binary Path</span>
                <span style={{ color: engineStatus?.ytdlpAvailable ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {engineStatus?.ytdlpVersion ? `Detected: ${engineStatus.ytdlpVersion}` : 'Not detected'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Leave empty for auto-detection (workspace / system PATH)"
                value={customYtDlpPath}
                onChange={(e) => setCustomYtDlpPath(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Active source: {engineStatus?.ytdlpSource} ({engineStatus?.ytdlpPath || 'default'})
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <span>FFmpeg Executable Path</span>
                <span style={{ color: engineStatus?.ffmpegAvailable ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                  {engineStatus?.ffmpegAvailable ? `Ready (${engineStatus.ffmpegVersion || 'detected'})` : 'Missing'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Leave empty for system PATH"
                value={customFFmpegPath}
                onChange={(e) => setCustomFFmpegPath(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Required for stream remuxing, MP3 extraction, and subtitle embedding.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Network & Proxy */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color="var(--accent-primary)" />
            Network & Rate Limiting
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Proxy Server
              </label>
              <input
                type="text"
                placeholder="http://proxy.example.com:8080 or socks5://127.0.0.1:1080"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Authentication & Cookies */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cookie size={18} color="var(--accent-warning)" />
            Browser Cookies
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
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
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Uses yt-dlp's secure <code>--cookies-from-browser</code> feature. Cookies are passed directly to the engine and never logged or transmitted elsewhere.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Application Appearance
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                style={{ width: '100%' }}
              >
                <option value="dark">Dark Theme (Pro Charcoal & Slate)</option>
                <option value="light">Light Theme (Clean Studio)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
