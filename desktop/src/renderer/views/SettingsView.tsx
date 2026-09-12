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
  Moon,
  Palette,
  Zap,
  Music,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const ACCENT_COLORS = [
  { id: 'emerald', name: 'Cyber Emerald', hex: '#2ea043', glow: 'rgba(46, 160, 67, 0.45)', bg: 'rgba(46, 160, 67, 0.15)' },
  { id: 'cyan', name: 'Supersonic Cyan', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)', bg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'purple', name: 'Electric Violet', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.45)', bg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'amber', name: 'Golden Sunset', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'crimson', name: 'Crimson Blaze', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)', bg: 'rgba(239, 68, 68, 0.15)' },
  { id: 'rose', name: 'Neon Rose', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)', bg: 'rgba(236, 72, 153, 0.15)' },
  { id: 'blue', name: 'Cobalt Azure', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)', bg: 'rgba(59, 130, 246, 0.15)' }
];

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
  const [accentColor, setAccentColor] = useState(settings.accentColor || 'emerald');
  const [defaultRateLimit, setDefaultRateLimit] = useState(settings.defaultRateLimit);
  const [proxyUrl, setProxyUrl] = useState(settings.proxyUrl);
  const [browserCookies, setBrowserCookies] = useState(settings.browserCookies);
  const [concurrentFragments, setConcurrentFragments] = useState(settings.concurrentFragments || 8);
  const [defaultAudioBitrate, setDefaultAudioBitrate] = useState(settings.defaultAudioBitrate || 'best');
  const [embedThumbnail, setEmbedThumbnail] = useState(settings.embedThumbnail !== undefined ? settings.embedThumbnail : true);
  const [embedSubtitles, setEmbedSubtitles] = useState(settings.embedSubtitles !== undefined ? settings.embedSubtitles : false);
  const [autoRetryCount, setAutoRetryCount] = useState(settings.autoRetryCount || 5);
  const [sponsorBlockMode, setSponsorBlockMode] = useState(settings.sponsorBlockMode || 'disabled');
  const [layoutDensity, setLayoutDensity] = useState(settings.layoutDensity || 'comfortable');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDefaultOutputDir(settings.defaultOutputDir);
    setMaxConcurrentDownloads(settings.maxConcurrentDownloads);
    setFilenameTemplate(settings.filenameTemplate);
    setCustomYtDlpPath(settings.customYtDlpPath);
    setCustomFFmpegPath(settings.customFFmpegPath);
    setTheme(settings.theme);
    setAccentColor(settings.accentColor || 'emerald');
    setDefaultRateLimit(settings.defaultRateLimit);
    setProxyUrl(settings.proxyUrl);
    setBrowserCookies(settings.browserCookies);
    setConcurrentFragments(settings.concurrentFragments || 8);
    setDefaultAudioBitrate(settings.defaultAudioBitrate || 'best');
    setEmbedThumbnail(settings.embedThumbnail !== undefined ? settings.embedThumbnail : true);
    setEmbedSubtitles(settings.embedSubtitles !== undefined ? settings.embedSubtitles : false);
    setAutoRetryCount(settings.autoRetryCount || 5);
    setSponsorBlockMode(settings.sponsorBlockMode || 'disabled');
    setLayoutDensity(settings.layoutDensity || 'comfortable');
  }, [settings]);

  const handleBrowseOutputDir = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setDefaultOutputDir(dir);
    }
  };

  const handleAccentChange = (id: string) => {
    setAccentColor(id);
    document.documentElement.setAttribute('data-accent', id);
    onSaveSettings({ accentColor: id });
  };

  const handleSave = () => {
    onSaveSettings({
      defaultOutputDir,
      maxConcurrentDownloads: Number(maxConcurrentDownloads) || 2,
      filenameTemplate,
      customYtDlpPath,
      customFFmpegPath,
      theme,
      accentColor,
      defaultRateLimit,
      proxyUrl,
      browserCookies,
      concurrentFragments: Number(concurrentFragments) || 8,
      defaultAudioBitrate,
      embedThumbnail,
      embedSubtitles,
      autoRetryCount: Number(autoRetryCount) || 5,
      sponsorBlockMode: sponsorBlockMode as 'disabled' | 'remove' | 'mark',
      layoutDensity: layoutDensity as 'comfortable' | 'compact'
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

        {/* Section 4: Interface, Theme & Accent Colors */}
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
            <Palette size={15} color="var(--accent-primary-bright)" />
            Interface, Theme & Accent Colors
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Theme Mode</label>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>GitHub Obsidian dark or clean light</div>
              </div>

              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    setTheme('light');
                    onSaveSettings({ theme: 'light' });
                  }}
                >
                  <Sun size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Light
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    setTheme('dark');
                    onSaveSettings({ theme: 'dark' });
                  }}
                >
                  <Moon size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Dark
                </button>
              </div>
            </div>

            {/* Dashboard Accent Color Palette */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Dashboard Accent Color</label>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active neon color scheme for buttons, gauges & glows</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--accent-primary-bright)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {ACCENT_COLORS.find((c) => c.id === accentColor)?.name || 'Emerald'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                {ACCENT_COLORS.map((c) => {
                  const isSelected = accentColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleAccentChange(c.id)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: 6,
                        border: isSelected ? `2px solid ${c.hex}` : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? c.bg : 'var(--bg-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: isSelected ? `0 0 12px ${c.glow}` : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={`${c.name} (${c.hex})`}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          boxShadow: `0 0 8px ${c.glow}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff'
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          textAlign: 'center',
                          lineHeight: 1.2
                        }}
                      >
                        {c.name.split(' ')[1] || c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Density */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Table Layout Density</label>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Row padding and item spacing in tables</div>
              </div>

              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${layoutDensity === 'comfortable' ? 'active' : ''}`}
                  onClick={() => setLayoutDensity('comfortable')}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${layoutDensity === 'compact' ? 'active' : ''}`}
                  onClick={() => setLayoutDensity('compact')}
                >
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
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Bypasses YouTube bot detection, age verification, and private playlists.
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: High-Performance Acceleration & Media Enrichment */}
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
            <Zap size={15} color="var(--accent-warning)" />
            Engine Acceleration & Quality Defaults
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Multi-Threaded Fragments (-N flag) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
                    Concurrent Stream Fragments (<code style={{ fontFamily: 'var(--font-mono)' }}>-N</code>)
                  </label>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Multi-connection download acceleration for DASH/HLS streams
                  </div>
                </div>
              </div>

              <div className="segmented-control" style={{ width: '100%' }}>
                <button
                  type="button"
                  className={`segmented-btn ${concurrentFragments === 1 ? 'active' : ''}`}
                  onClick={() => setConcurrentFragments(1)}
                  style={{ flex: 1 }}
                >
                  1x Single
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${concurrentFragments === 4 ? 'active' : ''}`}
                  onClick={() => setConcurrentFragments(4)}
                  style={{ flex: 1 }}
                >
                  4x Fast
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${concurrentFragments === 8 ? 'active' : ''}`}
                  onClick={() => setConcurrentFragments(8)}
                  style={{ flex: 1 }}
                >
                  8x Ultra (Default)
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${concurrentFragments === 16 ? 'active' : ''}`}
                  onClick={() => setConcurrentFragments(16)}
                  style={{ flex: 1 }}
                >
                  16x Veloce
                </button>
              </div>
            </div>

            {/* Default Audio Bitrate */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Default Audio Extraction Quality
              </label>
              <select
                value={defaultAudioBitrate}
                onChange={(e) => setDefaultAudioBitrate(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="best">Best Available (VBR ~320 kbps)</option>
                <option value="320k">Studio 320 kbps CBR (Maximum Fidelity)</option>
                <option value="256k">High 256 kbps (AAC / MP3 Standard)</option>
                <option value="192k">Medium 192 kbps (Balanced)</option>
                <option value="128k">Compact 128 kbps (Voice / Podcasts)</option>
              </select>
            </div>

            {/* Automated Enrichment Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={embedThumbnail}
                  onChange={(e) => setEmbedThumbnail(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-primary-bright)' }}
                />
                <div>
                  <span style={{ fontWeight: 600 }}>Auto-Embed High-Res Cover Art / Thumbnail</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Injects poster art directly into MP4, MKV, MP3, and FLAC containers
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={embedSubtitles}
                  onChange={(e) => setEmbedSubtitles(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-primary-bright)' }}
                />
                <div>
                  <span style={{ fontWeight: 600 }}>Auto-Embed Subtitles Stream</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Embeds all available subtitle tracks into the video file container
                  </div>
                </div>
              </label>
            </div>

            {/* SponsorBlock Integration */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                SponsorBlock Automatic Cleaning
              </label>
              <select
                value={sponsorBlockMode}
                onChange={(e) => setSponsorBlockMode(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="disabled">Disabled (Keep video untouched)</option>
                <option value="remove">Remove Sponsor Segments (Clean Cut)</option>
                <option value="mark">Mark Sponsors as Video Chapters</option>
              </select>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Uses crowd-sourced SponsorBlock database to remove promotions, intros, and filler.
              </div>
            </div>

            {/* Automated Retry Count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Connection Drop Auto-Retry</label>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Retries on fragmented drops or throttles</div>
              </div>

              <select
                value={autoRetryCount}
                onChange={(e) => setAutoRetryCount(Number(e.target.value))}
                style={{ width: 130 }}
              >
                <option value={3}>3 Retries</option>
                <option value={5}>5 Retries (Def)</option>
                <option value={10}>10 Retries</option>
                <option value={20}>20 Retries</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
