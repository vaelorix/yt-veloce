import React, { useState, useMemo } from 'react';
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
  Zap,
  Shield,
  Subtitles,
  Bookmark,
  Radio,
  Globe,
  Sliders,
  Scissors
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

  // Active top-level mode tab
  const [activeTab, setActiveTab] = useState<'preset' | 'custom' | 'command'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0]?.id || 'yt-best-mp4');

  // Sub-category accordion in Custom Studio
  const [studioCategory, setStudioCategory] = useState<
    'video' | 'audio' | 'subtitles' | 'chapters' | 'network' | 'playlist' | 'auth' | 'advanced'
  >('video');

  // 1. Video & Streams
  const [maxResolution, setMaxResolution] = useState<string>('none');
  const [videoCodecPreference, setVideoCodecPreference] = useState<string>('any');
  const [prefer60fps, setPrefer60fps] = useState(false);
  const [mergeOutputFormat, setMergeOutputFormat] = useState<'mp4' | 'mkv' | 'webm'>('mp4');
  const [selectedVideoFormatId, setSelectedVideoFormatId] = useState<string>('bestvideo');

  // 2. Audio Extraction & Codecs
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState<'best' | 'mp3' | 'm4a' | 'opus' | 'flac' | 'wav'>('mp3');
  const [audioQuality, setAudioQuality] = useState<string>('320k');
  const [selectedAudioFormatId, setSelectedAudioFormatId] = useState<string>('bestaudio');

  // 3. Subtitles & Captions
  const [embedSubtitles, setEmbedSubtitles] = useState(false);
  const [writeSubtitles, setWriteSubtitles] = useState(false);
  const [writeAutoSubtitles, setWriteAutoSubtitles] = useState(false);
  const [convertSubs, setConvertSubs] = useState<string>('none');
  const [subLanguages, setSubLanguages] = useState('en,all');

  // 4. Chapters & SponsorBlock
  const [embedChapters, setEmbedChapters] = useState(true);
  const [splitChapters, setSplitChapters] = useState(false);
  const [sponsorBlockRemove, setSponsorBlockRemove] = useState(false);
  const [sponsorBlockCategories, setSponsorBlockCategories] = useState('sponsor,intro,outro,selfpromo');
  const [sponsorBlockMark, setSponsorBlockMark] = useState(false);

  // 5. Network & Acceleration
  const [concurrentFragments, setConcurrentFragments] = useState<number>(1);
  const [useAria2, setUseAria2] = useState(false);
  const [rateLimit, setRateLimit] = useState('');
  const [proxy, setProxy] = useState('');

  // 6. Playlists & Ranges
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [playlistItems, setPlaylistItems] = useState('');
  const [downloadSections, setDownloadSections] = useState('');

  // 7. Authentication & Cookies
  const [cookiesBrowser, setCookiesBrowser] = useState('none');
  const [cookieFile, setCookieFile] = useState('');

  // 8. General & Output
  const [outputDir, setOutputDir] = useState(defaultOutputDir);
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [embedMetadata, setEmbedMetadata] = useState(true);
  const [writeThumbnail, setWriteThumbnail] = useState(false);
  const [writeDescription, setWriteDescription] = useState(false);
  const [writeInfoJson, setWriteInfoJson] = useState(false);
  const [customArgs, setCustomArgs] = useState('');

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
    const trimmed = url.trim();
    if (!trimmed) return;

    const isUrl = /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
    if (!isUrl) {
      setAnalysisError('Please enter a valid media URL (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await window.electronAPI.analyzeUrl(trimmed);
      setMetadata(result);

      if (result.isPlaylist) {
        setIsPlaylist(true);
      }

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

  // Build the complete options object
  const constructOptions = (overrideUrl?: string): DownloadOptions => {
    const parsedCustomArgs = customArgs.trim()
      ? customArgs.split(' ').map((a) => a.trim()).filter((a) => a.length > 0)
      : undefined;

    const base: DownloadOptions = {
      url: overrideUrl || url.trim(),
      outputDir: outputDir || defaultOutputDir,
      embedThumbnail,
      embedMetadata,
      embedChapters,
      splitChapters,
      sponsorBlockRemove,
      sponsorBlockCategories: sponsorBlockRemove ? sponsorBlockCategories : undefined,
      sponsorBlockMark,
      embedSubtitles,
      writeSubtitles,
      writeAutoSubtitles,
      convertSubs: convertSubs !== 'none' ? convertSubs : undefined,
      subLanguages: embedSubtitles || writeSubtitles || writeAutoSubtitles ? subLanguages : undefined,
      writeThumbnail,
      writeDescription,
      writeInfoJson,
      rateLimit: rateLimit.trim() ? rateLimit.trim() : undefined,
      concurrentFragments: concurrentFragments > 1 ? concurrentFragments : undefined,
      useAria2,
      isPlaylist,
      playlistItems: playlistItems.trim() ? playlistItems.trim() : undefined,
      downloadSections: downloadSections.trim() ? downloadSections.trim() : undefined,
      proxy: proxy.trim() ? proxy.trim() : undefined,
      cookiesBrowser: cookiesBrowser !== 'none' ? cookiesBrowser : undefined,
      cookieFile: cookieFile.trim() ? cookieFile.trim() : undefined,
      customArgs: parsedCustomArgs
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
      if (selectedVideoFormatId && selectedVideoFormatId !== 'bestvideo' && selectedAudioFormatId && selectedAudioFormatId !== 'bestaudio') {
        formatSelection = `${selectedVideoFormatId}+${selectedAudioFormatId}`;
      } else if (selectedVideoFormatId && selectedVideoFormatId !== 'bestvideo') {
        formatSelection = selectedVideoFormatId;
      }

      return {
        ...base,
        formatSelection: formatSelection || undefined,
        maxResolution: maxResolution !== 'none' ? maxResolution : undefined,
        videoCodecPreference: videoCodecPreference !== 'any' ? videoCodecPreference : undefined,
        prefer60fps,
        audioOnly,
        audioFormat: audioOnly ? audioFormat : undefined,
        audioQuality: audioOnly ? audioQuality : undefined,
        mergeOutputFormat
      };
    }

    return base;
  };

  // Generate live command preview string
  const liveCommandString = useMemo(() => {
    const opts = constructOptions();
    const parts: string[] = ['yt-dlp'];

    if (opts.isPlaylist) {
      parts.push('--yes-playlist');
      if (opts.playlistItems) parts.push(`--playlist-items "${opts.playlistItems}"`);
    } else {
      parts.push('--no-playlist');
    }

    if (opts.downloadSections) {
      parts.push(`--download-sections "${opts.downloadSections}"`);
    }

    if (opts.audioOnly) {
      parts.push('-x');
      if (opts.audioFormat && opts.audioFormat !== 'best') parts.push(`--audio-format ${opts.audioFormat}`);
      if (opts.audioQuality) parts.push(`--audio-quality ${opts.audioQuality}`);
    } else {
      if (opts.formatSelection) {
        parts.push(`-f "${opts.formatSelection}"`);
      } else {
        const filters: string[] = [];
        if (opts.maxResolution) filters.push(`height<=${opts.maxResolution}`);
        if (opts.prefer60fps) filters.push('fps<=60');
        if (opts.videoCodecPreference) filters.push(`vcodec^=${opts.videoCodecPreference}`);
        if (filters.length > 0) {
          const fStr = `[${filters.join('][')}]`;
          parts.push(`-f "bv*${fStr}+ba/b${fStr}"`);
        } else {
          parts.push('-f "bv*+ba/b"');
        }
      }
      if (opts.mergeOutputFormat) parts.push(`--merge-output-format ${opts.mergeOutputFormat}`);
    }

    if (opts.embedThumbnail) parts.push('--embed-thumbnail');
    if (opts.embedMetadata) parts.push('--embed-metadata');
    if (opts.embedChapters) parts.push('--embed-chapters');
    if (opts.splitChapters) parts.push('--split-chapters');

    if (opts.sponsorBlockRemove) parts.push(`--sponsorblock-remove "${opts.sponsorBlockCategories || 'all'}"`);
    if (opts.sponsorBlockMark) parts.push('--sponsorblock-mark all');

    if (opts.embedSubtitles) parts.push('--embed-subs');
    if (opts.writeSubtitles) parts.push('--write-subs');
    if (opts.writeAutoSubtitles) parts.push('--write-auto-subs');
    if (opts.convertSubs) parts.push(`--convert-subs ${opts.convertSubs}`);
    if ((opts.embedSubtitles || opts.writeSubtitles) && opts.subLanguages) {
      parts.push(`--sub-langs "${opts.subLanguages}"`);
    }

    if (opts.concurrentFragments && opts.concurrentFragments > 1) {
      parts.push(`-N ${opts.concurrentFragments}`);
    }
    if (opts.useAria2) {
      parts.push('--downloader aria2c --downloader-args aria2c:"-x 16 -s 16 -k 1M"');
    }
    if (opts.rateLimit) parts.push(`--limit-rate ${opts.rateLimit}`);
    if (opts.proxy) parts.push(`--proxy "${opts.proxy}"`);
    if (opts.cookiesBrowser) parts.push(`--cookies-from-browser ${opts.cookiesBrowser}`);

    const dest = outputDir ? `${outputDir}/%(title)s [%(id)s].%(ext)s` : '%(title)s [%(id)s].%(ext)s';
    parts.push(`-o "${dest}"`);
    parts.push(`"${url.trim() || '<URL>'}"`);

    return parts.join(' ');
  }, [
    url,
    outputDir,
    activeTab,
    selectedPresetId,
    maxResolution,
    videoCodecPreference,
    prefer60fps,
    mergeOutputFormat,
    selectedVideoFormatId,
    audioOnly,
    audioFormat,
    audioQuality,
    embedThumbnail,
    embedMetadata,
    embedChapters,
    splitChapters,
    sponsorBlockRemove,
    sponsorBlockCategories,
    sponsorBlockMark,
    embedSubtitles,
    writeSubtitles,
    writeAutoSubtitles,
    convertSubs,
    subLanguages,
    concurrentFragments,
    useAria2,
    rateLimit,
    proxy,
    isPlaylist,
    playlistItems,
    downloadSections,
    cookiesBrowser,
    customArgs
  ]);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(liveCommandString);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
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

  const videoStreams = metadata?.formats.filter((f) => f.hasVideo) || [];
  const audioStreams = metadata?.formats.filter((f) => f.hasAudio) || [];

  return (
    <div className="view-container">
      {/* URL Input Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={16} color="var(--accent-primary-bright)" />
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
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

      {/* Media Preview Card */}
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
              <span className="badge badge-primary">{metadata.extractor || 'Web Video'}</span>
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

      {/* Main Studio Configuration Container */}
      <div className="card" style={{ padding: '16px 20px' }}>
        {/* Top-Level Mode Tabs */}
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
              <span>Custom Streams & Full CLI Studio</span>
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
                    border: isSelected ? '1px solid rgba(63, 185, 80, 0.45)' : '1px solid var(--border-light)',
                    backgroundColor: isSelected ? 'rgba(46, 160, 67, 0.08)' : '#161b22',
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

        {/* Tab 2: Full CLI Feature Studio */}
        {activeTab === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Category Sub-Navigation Chips */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              {[
                { id: 'video', label: 'Video & Codecs', icon: <Layers size={13} /> },
                { id: 'audio', label: 'Audio & Extraction', icon: <Radio size={13} /> },
                { id: 'subtitles', label: 'Subtitles & Captions', icon: <Subtitles size={13} /> },
                { id: 'chapters', label: 'Chapters & SponsorBlock', icon: <Bookmark size={13} /> },
                { id: 'network', label: 'Speed & Aria2c', icon: <Zap size={13} /> },
                { id: 'playlist', label: 'Playlists & Clip Range', icon: <Scissors size={13} /> },
                { id: 'auth', label: 'Authentication & Cookies', icon: <Shield size={13} /> },
                { id: 'advanced', label: 'Custom Arguments', icon: <Sliders size={13} /> }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setStudioCategory(c.id as any)}
                  className={studioCategory === c.id ? 'badge badge-primary' : 'badge badge-neutral'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Sub-Panel: 1. Video & Codecs */}
            {studioCategory === 'video' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Max Video Resolution
                  </label>
                  <select
                    value={maxResolution}
                    onChange={(e) => setMaxResolution(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value="none">Best Available (Native)</option>
                    <option value="4320">8K UHD (4320p)</option>
                    <option value="2160">4K UHD (2160p)</option>
                    <option value="1440">2K QHD (1440p)</option>
                    <option value="1080">1080p Full HD</option>
                    <option value="720">720p HD</option>
                    <option value="480">480p SD</option>
                    <option value="360">360p</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Video Codec Preference
                  </label>
                  <select
                    value={videoCodecPreference}
                    onChange={(e) => setVideoCodecPreference(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value="any">Any / Best Quality</option>
                    <option value="avc">H.264 / AVC (Broadest Compatibility)</option>
                    <option value="hevc">H.265 / HEVC (High Efficiency)</option>
                    <option value="vp9">VP9 (YouTube Native)</option>
                    <option value="av01">AV1 (Next-Gen Open Standard)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Container Format
                  </label>
                  <select
                    value={mergeOutputFormat}
                    onChange={(e) => setMergeOutputFormat(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value="mp4">MP4 (Universal)</option>
                    <option value="mkv">MKV (Best for Multiple Audio/Subs)</option>
                    <option value="webm">WebM (Open Web)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prefer60fps}
                      onChange={(e) => setPrefer60fps(e.target.checked)}
                    />
                    <span>Prefer High Framerate (60 FPS)</span>
                  </label>
                </div>

                {videoStreams.length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Exact Video Stream (from Analysis)
                    </label>
                    <select
                      value={selectedVideoFormatId}
                      onChange={(e) => setSelectedVideoFormatId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    >
                      <option value="bestvideo">Best Available Video (bestvideo)</option>
                      {videoStreams.map((f) => (
                        <option key={f.formatId} value={f.formatId}>
                          {f.formatId}: {f.resolution} ({f.fps ? `${f.fps}fps` : ''}) - {f.vcodec} [{f.ext}] {f.tbr ? `~${Math.round(f.tbr)}kbps` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Panel: 2. Audio & Extraction */}
            {studioCategory === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={audioOnly}
                      onChange={(e) => setAudioOnly(e.target.checked)}
                    />
                    <span>Audio Only Mode (Extract audio track from video)</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Audio Extraction Format (-x --audio-format)
                    </label>
                    <select
                      value={audioFormat}
                      disabled={!audioOnly}
                      onChange={(e) => setAudioFormat(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, opacity: audioOnly ? 1 : 0.6 }}
                    >
                      <option value="best">Best Original Quality (no re-encoding)</option>
                      <option value="mp3">MP3 (Universal Audio)</option>
                      <option value="m4a">M4A / AAC (Apple Quality)</option>
                      <option value="flac">FLAC (Lossless Studio)</option>
                      <option value="opus">Opus (High Efficiency)</option>
                      <option value="wav">WAV (Uncompressed)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Audio Bitrate / Quality (--audio-quality)
                    </label>
                    <select
                      value={audioQuality}
                      disabled={!audioOnly}
                      onChange={(e) => setAudioQuality(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, opacity: audioOnly ? 1 : 0.6 }}
                    >
                      <option value="320k">320 kbps (Maximum Fidelity)</option>
                      <option value="256k">256 kbps (High Quality)</option>
                      <option value="192k">192 kbps (Standard Quality)</option>
                      <option value="128k">128 kbps (Voice / Podcast)</option>
                      <option value="0">VBR 0 (Best Variable Bitrate)</option>
                    </select>
                  </div>

                  {audioStreams.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                        Exact Audio Stream (from Analysis)
                      </label>
                      <select
                        value={selectedAudioFormatId}
                        onChange={(e) => setSelectedAudioFormatId(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                      >
                        <option value="bestaudio">Best Available Audio (bestaudio)</option>
                        {audioStreams.map((f) => (
                          <option key={f.formatId} value={f.formatId}>
                            {f.formatId}: {f.acodec} ({f.abr ? `${Math.round(f.abr)}k` : 'auto'}) [{f.ext}]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Panel: 3. Subtitles & Captions */}
            {studioCategory === 'subtitles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={embedSubtitles}
                      onChange={(e) => setEmbedSubtitles(e.target.checked)}
                    />
                    <span>Embed Subtitles into Video (--embed-subs)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={writeSubtitles}
                      onChange={(e) => setWriteSubtitles(e.target.checked)}
                    />
                    <span>Write Subtitle Files to Disk (--write-subs)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={writeAutoSubtitles}
                      onChange={(e) => setWriteAutoSubtitles(e.target.checked)}
                    />
                    <span>Include Auto-Generated Captions (--write-auto-subs)</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Subtitle Format Conversion (--convert-subs)
                    </label>
                    <select
                      value={convertSubs}
                      onChange={(e) => setConvertSubs(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    >
                      <option value="none">Original / No Conversion</option>
                      <option value="srt">SubRip (SRT)</option>
                      <option value="vtt">WebVTT (VTT)</option>
                      <option value="ass">Advanced SubStation Alpha (ASS)</option>
                      <option value="lrc">LRC (Synchronized Lyrics)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Subtitle Languages (--sub-langs)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. en,es,fr,all"
                      value={subLanguages}
                      onChange={(e) => setSubLanguages(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {['en', 'en.*', 'es', 'fr', 'de', 'ja', 'all'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '2px 8px', fontSize: 11 }}
                          onClick={() => setSubLanguages(lang)}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Panel: 4. Chapters & SponsorBlock */}
            {studioCategory === 'chapters' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#161b22',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={embedChapters}
                        onChange={(e) => setEmbedChapters(e.target.checked)}
                      />
                      <span>Embed Chapter Markers (--embed-chapters)</span>
                    </label>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 24 }}>
                      Embeds video chapter divisions directly into the media container for media player navigation.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#161b22',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={splitChapters}
                        onChange={(e) => setSplitChapters(e.target.checked)}
                      />
                      <span>Split Chapters into Separate Files (--split-chapters)</span>
                    </label>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 24 }}>
                      Splits the downloaded media into individual tracks corresponding to each chapter.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#161b22',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sponsorBlockRemove}
                        onChange={(e) => setSponsorBlockRemove(e.target.checked)}
                      />
                      <span>Remove Sponsor Segments (--sponsorblock-remove)</span>
                    </label>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 24 }}>
                      Automatically cuts out sponsor segments, self-promos, and intros using the community SponsorBlock API.
                    </div>
                    {sponsorBlockRemove && (
                      <div style={{ marginTop: 8, paddingLeft: 24 }}>
                        <input
                          type="text"
                          value={sponsorBlockCategories}
                          onChange={(e) => setSponsorBlockCategories(e.target.value)}
                          placeholder="sponsor,intro,outro,selfpromo"
                          style={{ width: '100%', fontSize: 12, padding: '4px 8px' }}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#161b22',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sponsorBlockMark}
                        onChange={(e) => setSponsorBlockMark(e.target.checked)}
                      />
                      <span>Mark Sponsor Segments (--sponsorblock-mark all)</span>
                    </label>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 24 }}>
                      Creates chapter markers for sponsor segments without deleting the media frames.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Panel: 5. Speed & Aria2c */}
            {studioCategory === 'network' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Multi-Connection Fragments (-N --concurrent-fragments)
                  </label>
                  <select
                    value={concurrentFragments}
                    onChange={(e) => setConcurrentFragments(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value={1}>Single Thread (Default)</option>
                    <option value={4}>4 Concurrent Connections (Faster)</option>
                    <option value={8}>8 Concurrent Connections (High Speed)</option>
                    <option value={16}>16 Concurrent Connections (Maximum Throughput)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Download Speed Limit (--limit-rate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5M, 10M, 500K (Leave empty for max speed)"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Proxy Server (--proxy)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. http://127.0.0.1:8080 or socks5://127.0.0.1:1080"
                    value={proxy}
                    onChange={(e) => setProxy(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={useAria2}
                      onChange={(e) => setUseAria2(e.target.checked)}
                    />
                    <span>Enable Aria2c Downloader Accelerator (--downloader aria2c)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Sub-Panel: 6. Playlists & Clip Range */}
            {studioCategory === 'playlist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Playlist Extraction Mode
                    </label>
                    <select
                      value={isPlaylist ? 'playlist' : 'single'}
                      onChange={(e) => setIsPlaylist(e.target.value === 'playlist')}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    >
                      <option value="single">Single Video Mode (--no-playlist) [Protected & Recommended]</option>
                      <option value="playlist">Full Playlist Mode (--yes-playlist)</option>
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Single mode prevents accidental downloads of large or private Watch Later playlists when pasting video links with &amp;list=WL.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Playlist Item Selection (--playlist-items)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1-10 or 1,3,5"
                      value={playlistItems}
                      disabled={!isPlaylist}
                      onChange={(e) => setPlaylistItems(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, opacity: isPlaylist ? 1 : 0.6 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Time Section / Clip Range (--download-sections)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. *00:01:00-00:02:30 or *00:05:00-inf"
                      value={downloadSections}
                      onChange={(e) => setDownloadSections(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Download only a specific time slice directly from the stream without downloading the full video.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Panel: 7. Authentication & Cookies */}
            {studioCategory === 'auth' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Extract Cookies from Browser (--cookies-from-browser)
                  </label>
                  <select
                    value={cookiesBrowser}
                    onChange={(e) => setCookiesBrowser(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value="none">None (Public Access)</option>
                    <option value="chrome">Google Chrome</option>
                    <option value="firefox">Mozilla Firefox</option>
                    <option value="edge">Microsoft Edge</option>
                    <option value="brave">Brave Browser</option>
                    <option value="opera">Opera</option>
                    <option value="vivaldi">Vivaldi</option>
                  </select>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Allows downloading age-restricted, private, or member-only videos using your local browser login session.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Netscape Cookie File (--cookies)
                  </label>
                  <input
                    type="text"
                    placeholder="Path to cookies.txt"
                    value={cookieFile}
                    onChange={(e) => setCookieFile(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  />
                </div>
              </div>
            )}

            {/* Sub-Panel: 8. Advanced Custom CLI Arguments */}
            {studioCategory === 'advanced' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Arbitrary Raw yt-dlp Flags
                </label>
                <input
                  type="text"
                  placeholder="e.g. --geo-bypass --extractor-args youtube:player_client=ios --sleep-interval 2"
                  value={customArgs}
                  onChange={(e) => setCustomArgs(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Direct passthrough of any flags supported by yt-dlp. Separate arguments with spaces.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Live Command Inspector */}
        {activeTab === 'command' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              This exact command will be dispatched to yt-dlp by the main process:
            </div>
            <div
              className="code-block"
              style={{
                marginBottom: 12,
                fontSize: 12,
                lineHeight: 1.6,
                wordBreak: 'break-all',
                userSelect: 'all'
              }}
            >
              {liveCommandString}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: 12 }}
                onClick={handleCopyCommand}
              >
                {copiedCommand ? (
                  <>
                    <Check size={14} color="var(--accent-primary-bright)" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: 12 }}
                onClick={() => onNavigateToCommandBuilder(constructOptions())}
              >
                Open in Advanced Command Builder
              </button>
            </div>
          </div>
        )}

        {/* Global Options Footer Row */}
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
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                width: 140,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Folder size={16} color="var(--accent-primary-bright)" />
              Save Destination:
            </label>
            <input
              type="text"
              readOnly
              value={outputDir}
              style={{ flex: 1, minWidth: 260, fontSize: 13 }}
            />
            <button
              type="button"
              onClick={handleBrowseFolder}
              className="btn-secondary"
              style={{ fontSize: 13 }}
            >
              Browse...
            </button>
          </div>

          {/* Quick Feature Checkboxes */}
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
              Embed Tags &amp; Chapters
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={writeThumbnail}
                onChange={(e) => setWriteThumbnail(e.target.checked)}
              />
              Save Thumbnail Image
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={writeDescription}
                onChange={(e) => setWriteDescription(e.target.checked)}
              />
              Save Description (.txt)
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

