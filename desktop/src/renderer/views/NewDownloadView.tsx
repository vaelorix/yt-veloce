import React, { useState } from 'react';
import { VideoMetadata, DownloadOptions, PresetProfile, FormatItem } from '../../../shared/types';
import {
  Search,
  Download,
  SlidersHorizontal,
  Layers,
  Terminal,
  FileText,
  Clock,
  User,
  Eye,
  Calendar,
  Folder,
  Check,
  Copy,
  AlertCircle,
  Loader2,
  Sparkles,
  ListPlus
} from 'lucide-react';

interface NewDownloadViewProps {
  presets: PresetProfile[];
  defaultOutputDir: string;
  onStartDownload: (options: DownloadOptions, metadata?: VideoMetadata) => void;
  onSelectDirectory: () => Promise<string | null>;
  onNavigateToCommandBuilder: (options: DownloadOptions) => void;
}

export const NewDownloadView: React.FC<NewDownloadViewProps> = ({
  presets,
  defaultOutputDir,
  onStartDownload,
  onSelectDirectory,
  onNavigateToCommandBuilder
}) => {
  const [url, setUrl] = useState('');
  const [isBatch, setIsBatch] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Configuration State
  const [activeTab, setActiveTab] = useState<'preset' | 'custom' | 'command'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0]?.id || 'yt-best-mp4');
  
  // Custom stream selections
  const [selectedVideoFormatId, setSelectedVideoFormatId] = useState<string>('bestvideo');
  const [selectedAudioFormatId, setSelectedAudioFormatId] = useState<string>('bestaudio');
  const [mergeOutputFormat, setMergeOutputFormat] = useState<'mp4' | 'mkv' | 'webm'>('mp4');

  // Advanced toggles
  const [outputDir, setOutputDir] = useState(defaultOutputDir);
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [embedMetadata, setEmbedMetadata] = useState(true);
  const [embedSubtitles, setEmbedSubtitles] = useState(false);
  const [writeSubtitles, setWriteSubtitles] = useState(false);
  const [subLanguages, setSubLanguages] = useState('en,all');
  const [writeDescription, setWriteDescription] = useState(false);
  const [writeInfoJson, setWriteInfoJson] = useState(false);
  const [rateLimit, setRateLimit] = useState('');
  const [copiedCommand, setCopiedCommand] = useState(false);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.includes('\n')) {
          setIsBatch(true);
          setBatchUrls(text);
        } else {
          setUrl(text.trim());
        }
      }
    } catch {
      // Clipboard access not granted
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await window.electronAPI.analyzeUrl(url.trim());
      setMetadata(result);

      // Auto-select best streams if available
      const videoFormats = result.formats.filter((f) => f.hasVideo && !f.hasAudio);
      if (videoFormats.length > 0) {
        setSelectedVideoFormatId(videoFormats[videoFormats.length - 1].formatId);
      }
      const audioFormats = result.formats.filter((f) => f.hasAudio && !f.hasVideo);
      if (audioFormats.length > 0) {
        setSelectedAudioFormatId(audioFormats[audioFormats.length - 1].formatId);
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to extract video information.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBrowseFolder = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setOutputDir(dir);
    }
  };

  // Build current options object
  const constructOptions = (overrideUrl?: string): DownloadOptions => {
    const base: DownloadOptions = {
      url: overrideUrl || url.trim(),
      outputDir: outputDir || defaultOutputDir,
      embedThumbnail,
      embedMetadata,
      embedSubtitles,
      writeSubtitles,
      subLanguages: embedSubtitles || writeSubtitles ? subLanguages : undefined,
      writeDescription,
      writeInfoJson,
      rateLimit: rateLimit.trim() ? rateLimit.trim() : undefined
    };

    if (activeTab === 'preset') {
      const preset = presets.find((p) => p.id === selectedPresetId);
      if (preset) {
        return {
          ...base,
          ...preset.options,
          presetId: preset.id
        };
      }
    } else if (activeTab === 'custom') {
      let formatSelection = '';
      if (selectedVideoFormatId && selectedAudioFormatId) {
        formatSelection = `${selectedVideoFormatId}+${selectedAudioFormatId}`;
      } else if (selectedVideoFormatId) {
        formatSelection = selectedVideoFormatId;
      } else if (selectedAudioFormatId) {
        formatSelection = selectedAudioFormatId;
      }

      return {
        ...base,
        formatSelection,
        mergeOutputFormat
      };
    }

    return base;
  };

  const handleStartDownload = () => {
    if (isBatch) {
      const urls = batchUrls
        .split('\n')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      urls.forEach((targetUrl) => {
        onStartDownload(constructOptions(targetUrl));
      });
      setUrl('');
      setBatchUrls('');
    } else {
      if (!url.trim()) return;
      onStartDownload(constructOptions(), metadata || undefined);
    }
  };

  // Filter formats for custom stream selection
  const videoStreams = metadata?.formats.filter((f) => f.hasVideo) || [];
  const audioStreams = metadata?.formats.filter((f) => f.hasAudio) || [];

  return (
    <div className="view-container">
      {/* URL Input Bar */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={16} color="var(--accent-primary)" />
            Target Media Source
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={handlePasteClipboard}
            >
              Paste Clipboard
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => setIsBatch(!isBatch)}
            >
              {isBatch ? 'Single URL Mode' : 'Batch URLs Mode'}
            </button>
          </div>
        </div>

        {isBatch ? (
          <div>
            <textarea
              placeholder="Enter multiple URLs, one per line:&#10;https://www.youtube.com/watch?v=...&#10;https://www.youtube.com/watch?v=..."
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              rows={5}
              style={{ width: '100%', fontSize: 13, fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Batch mode processes and queues all URLs sequentially using your selected profile.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="url"
              placeholder="Enter YouTube, Vimeo, Twitter/X, Twitch, or supported URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze(); }}
              style={{ flex: 1, fontSize: 14, padding: '10px 14px' }}
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url.trim()}
              className="btn-primary"
              style={{ minWidth: 130 }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze
                </>
              )}
            </button>
          </div>
        )}

        {analysisError && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              backgroundColor: 'var(--accent-danger-glow)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13
            }}
          >
            <AlertCircle size={18} />
            <span>{analysisError}</span>
          </div>
        )}
      </div>

      {/* Media Preview Card (Visible when analyzed) */}
      {metadata && (
        <div className="card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {metadata.thumbnail && (
            <div style={{ position: 'relative', width: 240, minWidth: 200, height: 135, flexShrink: 0 }}>
              <img
                src={metadata.thumbnail}
                alt="thumbnail"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              />
              {metadata.durationString && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                >
                  {metadata.durationString}
                </span>
              )}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{metadata.title}</h2>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
              {metadata.uploader && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} />
                  {metadata.uploader}
                </span>
              )}
              {metadata.uploadDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} />
                  {metadata.uploadDate}
                </span>
              )}
              {metadata.viewCount !== undefined && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={14} />
                  {metadata.viewCount.toLocaleString()} views
                </span>
              )}
              <span className="badge badge-primary">
                {metadata.extractor || 'Web Video'}
              </span>
            </div>

            {metadata.description && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginTop: 4
                }}
              >
                {metadata.description}
              </p>
            )}

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto' }}>
              Available streams: {metadata.formats.length} formats • Subtitles: {metadata.subtitles.length} tracks • Chapters: {metadata.chapters.length}
            </div>
          </div>
        </div>
      )}

      {/* Download Configuration Mode Tabs */}
      {/* Download Configuration Mode Tabs */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 16 }}>
          <div className="segmented-control" style={{ padding: 3, gap: 4 }}>
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'preset' ? 'active' : ''}`}
              onClick={() => setActiveTab('preset')}
              style={{ padding: '5px 14px', fontSize: 12, gap: 6, display: 'inline-flex', alignItems: 'center' }}
            >
              <SlidersHorizontal size={13} color={activeTab === 'preset' ? 'var(--accent-primary-bright)' : 'currentColor'} />
              <span>Quick Presets</span>
            </button>

            <button
              type="button"
              className={`segmented-btn ${activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveTab('custom')}
              style={{ padding: '5px 14px', fontSize: 12, gap: 6, display: 'inline-flex', alignItems: 'center' }}
            >
              <Layers size={13} color={activeTab === 'custom' ? 'var(--accent-primary-bright)' : 'currentColor'} />
              <span>Custom Streams & Codecs</span>
            </button>

            <button
              type="button"
              className={`segmented-btn ${activeTab === 'command' ? 'active' : ''}`}
              onClick={() => setActiveTab('command')}
              style={{ padding: '5px 14px', fontSize: 12, gap: 6, display: 'inline-flex', alignItems: 'center' }}
            >
              <Terminal size={13} color={activeTab === 'command' ? 'var(--accent-primary-bright)' : 'currentColor'} />
              <span>Live Command Inspector</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'preset' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '1px solid rgba(63, 185, 80, 0.45)'
                      : '1px solid var(--border-light)',
                    backgroundColor: isSelected
                      ? 'rgba(46, 160, 67, 0.08)'
                      : '#161b22',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: isSelected ? 'var(--accent-primary-bright)' : 'var(--text-primary)'
                      }}
                    >
                      {preset.name}
                    </span>
                    {isSelected && <Check size={14} color="var(--accent-primary-bright)" />}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {preset.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Format Selection */}
        {activeTab === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {/* Video Stream Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Video Stream
                </label>
                <select
                  value={selectedVideoFormatId}
                  onChange={(e) => setSelectedVideoFormatId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="bestvideo">Best Available Video (bestvideo)</option>
                  {videoStreams.map((f) => (
                    <option key={f.formatId} value={f.formatId}>
                      {f.formatId}: {f.resolution} ({f.fps ? `${f.fps}fps` : ''}) - {f.vcodec} [
                      {f.ext}] {f.tbr ? `~${Math.round(f.tbr)}kbps` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audio Stream Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Audio Stream
                </label>
                <select
                  value={selectedAudioFormatId}
                  onChange={(e) => setSelectedAudioFormatId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="bestaudio">Best Available Audio (bestaudio)</option>
                  {audioStreams.map((f) => (
                    <option key={f.formatId} value={f.formatId}>
                      {f.formatId}: {f.acodec} ({f.abr ? `${Math.round(f.abr)}k` : 'auto'}) [
                      {f.ext}] {f.language ? `[${f.language}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Output Container format */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Merge Container Format
                </label>
                <select
                  value={mergeOutputFormat}
                  onChange={(e) => setMergeOutputFormat(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="mp4">MP4 (Universal Compatibility)</option>
                  <option value="mkv">MKV (Best for Subtitles & Audio Tracks)</option>
                  <option value="webm">WebM (Open Web Video)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Command Preview */}
        {activeTab === 'command' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              This exact command will be dispatched to yt-dlp by the main process:
            </div>
            <div className="code-block" style={{ marginBottom: 12 }}>
              yt-dlp {constructOptions().formatSelection ? `-f "${constructOptions().formatSelection}" ` : ''}
              {constructOptions().mergeOutputFormat ? `--merge-output-format ${constructOptions().mergeOutputFormat} ` : ''}
              {embedThumbnail ? '--embed-thumbnail ' : ''}
              {embedMetadata ? '--embed-metadata ' : ''}
              {embedSubtitles ? '--embed-subs ' : ''}
              -o "{outputDir ? `${outputDir}/%(title)s [%(id)s].%(ext)s` : '%(title)s [%(id)s].%(ext)s'}" "{url || '<URL>'}"
            </div>
            <button
              className="btn-secondary"
              style={{ fontSize: 12 }}
              onClick={() => onNavigateToCommandBuilder(constructOptions())}
            >
              Open in Advanced Command Builder
            </button>
          </div>
        )}

        {/* Options Row (Subtitles, Metadata, Output Folder) */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}
        >
          {/* Destination Folder Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 13, fontWeight: 600, width: 140, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Folder size={16} color="var(--accent-primary)" />
              Save Destination:
            </label>
            <input
              type="text"
              readOnly
              value={outputDir}
              style={{ flex: 1, minWidth: 260, fontSize: 13 }}
            />
            <button type="button" onClick={handleBrowseFolder} className="btn-secondary" style={{ fontSize: 13 }}>
              Browse...
            </button>
          </div>

          {/* Feature Checkboxes */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={embedThumbnail}
                onChange={(e) => setEmbedThumbnail(e.target.checked)}
              />
              Embed Thumbnail
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={embedMetadata}
                onChange={(e) => setEmbedMetadata(e.target.checked)}
              />
              Embed Tags & Chapters
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={embedSubtitles}
                onChange={(e) => setEmbedSubtitles(e.target.checked)}
              />
              Embed Subtitles
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={writeDescription}
                onChange={(e) => setWriteDescription(e.target.checked)}
              />
              Save Description
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={writeInfoJson}
                onChange={(e) => setWriteInfoJson(e.target.checked)}
              />
              Save Info JSON
            </label>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={handleStartDownload}
          disabled={!url.trim() && !batchUrls.trim()}
          className="btn-primary"
          style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600 }}
        >
          <Download size={18} />
          {isBatch ? 'Queue Batch Downloads' : 'Start Download'}
        </button>
      </div>
    </div>
  );
};
