import React, { useState } from 'react';
import { PresetProfile } from '../../../shared/types';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Check,
  Film,
  Music,
  Archive,
  Smartphone,
  Disc,
  Layers,
  Zap,
  Shield,
  Sparkles,
  Terminal,
  X,
  Copy,
  Scissors
} from 'lucide-react';

interface PresetsViewProps {
  presets: PresetProfile[];
  onSavePreset: (preset: PresetProfile) => void;
  onDeletePreset: (id: string) => void;
  onApplyPreset: (preset: PresetProfile) => void;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  presets,
  onSavePreset,
  onDeletePreset,
  onApplyPreset
}) => {
  const [editingPreset, setEditingPreset] = useState<PresetProfile | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'subs' | 'advanced'>('video');

  // Form states for editor
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('video');
  const [audioOnly, setAudioOnly] = useState(false);

  // Video & Codecs
  const [maxResolution, setMaxResolution] = useState<'best' | '2160p' | '1440p' | '1080p' | '720p' | '480p'>('best');
  const [videoCodecPreference, setVideoCodecPreference] = useState<'any' | 'avc' | 'vp9' | 'av01'>('any');
  const [prefer60fps, setPrefer60fps] = useState(false);
  const [mergeOutputFormat, setMergeOutputFormat] = useState('mp4');
  const [formatSelection, setFormatSelection] = useState('bv*+ba/b');

  // Audio
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [audioQuality, setAudioQuality] = useState('0');

  // Subtitles & Metadata
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [embedMetadata, setEmbedMetadata] = useState(true);
  const [embedSubtitles, setEmbedSubtitles] = useState(false);
  const [convertSubs, setConvertSubs] = useState<'none' | 'srt' | 'vtt' | 'ass'>('srt');
  const [subtitlesLangs, setSubtitlesLangs] = useState('en,en.*');

  // Chapters & SponsorBlock
  const [embedChapters, setEmbedChapters] = useState(true);
  const [splitChapters, setSplitChapters] = useState(false);
  const [sponsorBlockRemove, setSponsorBlockRemove] = useState<'none' | 'all' | 'sponsor' | 'selfpromo'>('none');

  // Network & Turbo
  const [concurrentFragments, setConcurrentFragments] = useState(4);
  const [useAria2, setUseAria2] = useState(false);
  const [customArgs, setCustomArgs] = useState('');

  const startCreate = () => {
    setName('');
    setDescription('');
    setIcon('video');
    setAudioOnly(false);
    setMaxResolution('best');
    setVideoCodecPreference('any');
    setPrefer60fps(false);
    setMergeOutputFormat('mp4');
    setFormatSelection('bv*+ba/b');
    setAudioFormat('mp3');
    setAudioQuality('0');
    setEmbedThumbnail(true);
    setEmbedMetadata(true);
    setEmbedSubtitles(false);
    setConvertSubs('srt');
    setSubtitlesLangs('en,en.*');
    setEmbedChapters(true);
    setSplitChapters(false);
    setSponsorBlockRemove('none');
    setConcurrentFragments(4);
    setUseAria2(false);
    setCustomArgs('');
    setActiveTab('video');
    setIsCreatingNew(true);
    setEditingPreset(null);
  };

  const startEdit = (p: PresetProfile) => {
    setName(p.name);
    setDescription(p.description);
    setIcon(p.icon || 'video');
    setAudioOnly(Boolean(p.options.audioOnly));
    setMaxResolution(p.options.maxResolution || 'best');
    setVideoCodecPreference(p.options.videoCodecPreference || 'any');
    setPrefer60fps(Boolean(p.options.prefer60fps));
    setMergeOutputFormat(p.options.mergeOutputFormat || 'mp4');
    setFormatSelection(p.options.formatSelection || 'bv*+ba/b');
    setAudioFormat(p.options.audioFormat || 'mp3');
    setAudioQuality(p.options.audioQuality || '0');
    setEmbedThumbnail(p.options.embedThumbnail ?? true);
    setEmbedMetadata(p.options.embedMetadata ?? true);
    setEmbedSubtitles(Boolean(p.options.embedSubtitles));
    setConvertSubs(p.options.convertSubs || 'srt');
    setSubtitlesLangs(p.options.subtitlesLangs || 'en,en.*');
    setEmbedChapters(p.options.embedChapters ?? true);
    setSplitChapters(Boolean(p.options.splitChapters));
    setSponsorBlockRemove(p.options.sponsorBlockRemove || 'none');
    setConcurrentFragments(p.options.concurrentFragments || 4);
    setUseAria2(Boolean(p.options.useAria2));
    setCustomArgs(p.options.customArgs || '');
    setActiveTab('video');
    setEditingPreset(p);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const newPreset: PresetProfile = {
      id: editingPreset ? editingPreset.id : `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom user preset',
      icon,
      isBuiltIn: false,
      options: {
        audioOnly,
        maxResolution: !audioOnly && maxResolution !== 'best' ? maxResolution : undefined,
        videoCodecPreference: !audioOnly && videoCodecPreference !== 'any' ? videoCodecPreference : undefined,
        prefer60fps: !audioOnly ? prefer60fps : undefined,
        mergeOutputFormat: !audioOnly ? (mergeOutputFormat as any) : undefined,
        formatSelection: !audioOnly && formatSelection !== 'bv*+ba/b' ? formatSelection : undefined,
        audioFormat: audioOnly ? (audioFormat as any) : undefined,
        audioQuality: audioOnly ? audioQuality : undefined,
        embedThumbnail,
        embedMetadata,
        embedSubtitles,
        convertSubs: embedSubtitles && convertSubs !== 'none' ? convertSubs : undefined,
        subtitlesLangs: embedSubtitles ? subtitlesLangs : undefined,
        embedChapters,
        splitChapters,
        sponsorBlockRemove: sponsorBlockRemove !== 'none' ? sponsorBlockRemove : undefined,
        concurrentFragments: concurrentFragments > 1 ? concurrentFragments : undefined,
        useAria2,
        customArgs: customArgs.trim() || undefined
      }
    };
    onSavePreset(newPreset);
    setEditingPreset(null);
    setIsCreatingNew(false);
  };

  const handleExportAll = () => {
    const json = JSON.stringify(presets, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yt-veloce-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          imported.forEach((p) => {
            if (p.name && p.options) {
              onSavePreset({
                ...p,
                id: `imported-${Math.random().toString(36).substring(2, 7)}`,
                isBuiltIn: false
              });
            }
          });
        }
      } catch {
        alert('Invalid JSON preset file.');
      }
    };
    reader.readAsText(file);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'music': return <Music size={20} color="var(--accent-primary)" />;
      case 'archive': return <Archive size={20} color="var(--accent-purple)" />;
      case 'smartphone': return <Smartphone size={20} color="var(--accent-warning)" />;
      case 'disc': return <Disc size={20} color="var(--accent-success)" />;
      case 'zap': return <Zap size={20} color="#e3b341" />;
      case 'shield': return <Shield size={20} color="#58a6ff" />;
      case 'sparkles': return <Sparkles size={20} color="#bc8cff" />;
      default: return <Film size={20} color="var(--accent-primary)" />;
    }
  };

  // Generate preview CLI arguments string
  const generateCliPreview = (): string => {
    const flags: string[] = ['yt-dlp', '--no-playlist'];
    if (audioOnly) {
      flags.push('-x', `--audio-format ${audioFormat}`, `--audio-quality ${audioQuality}`);
    } else {
      let format = 'bv*+ba/b';
      if (maxResolution !== 'best') {
        const height = maxResolution.replace('p', '');
        format = `bv*[height<=${height}]+ba/b[height<=${height}]`;
      }
      if (videoCodecPreference !== 'any') {
        format = `bv*[vcodec^=${videoCodecPreference}]+ba/b`;
      }
      flags.push(`-f "${format}"`);
      if (mergeOutputFormat) flags.push(`--merge-output-format ${mergeOutputFormat}`);
    }
    if (embedThumbnail) flags.push('--embed-thumbnail');
    if (embedMetadata) flags.push('--embed-metadata');
    if (embedSubtitles) {
      flags.push('--embed-subs', `--sub-langs "${subtitlesLangs}"`);
      if (convertSubs !== 'none') flags.push(`--convert-subs ${convertSubs}`);
    }
    if (embedChapters) flags.push('--embed-chapters');
    if (splitChapters) flags.push('--split-chapters');
    if (sponsorBlockRemove !== 'none') flags.push(`--sponsorblock-remove ${sponsorBlockRemove}`);
    if (concurrentFragments > 1) flags.push(`-N ${concurrentFragments}`);
    if (useAria2) flags.push('--downloader aria2c');
    if (customArgs.trim()) flags.push(customArgs.trim());
    flags.push('<URL>');
    return flags.join(' ');
  };

  return (
    <div className="view-container">
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Create and manage specialized profiles to speed up downloads and apply consistent yt-dlp configurations.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <label className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
            <Upload size={14} /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
          </label>
          <button onClick={handleExportAll} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Download size={14} /> Export All
          </button>
          <button onClick={startCreate} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
            <Plus size={15} /> New Preset
          </button>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16
        }}
      >
        {presets.map((preset) => {
          const isBuiltIn = Boolean(preset.isBuiltIn);

          return (
            <div
              key={preset.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getPresetIcon(preset.icon)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{preset.name}</h4>
                      {isBuiltIn && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            padding: '1px 6px',
                            borderRadius: 3,
                            backgroundColor: 'rgba(46, 160, 67, 0.16)',
                            border: '1px solid rgba(46, 160, 67, 0.35)',
                            color: 'var(--accent-primary-bright)'
                          }}
                        >
                          BUILT-IN
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  {preset.description}
                </p>

                {/* Configuration Highlights Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {preset.options.audioOnly ? (
                    <span className="badge badge-success">Audio {preset.options.audioFormat?.toUpperCase() || 'MP3'}</span>
                  ) : (
                    <span className="badge badge-primary">{preset.options.mergeOutputFormat?.toUpperCase() || 'MP4'}</span>
                  )}
                  {preset.options.maxResolution && (
                    <span className="badge badge-neutral">{preset.options.maxResolution}</span>
                  )}
                  {preset.options.videoCodecPreference && preset.options.videoCodecPreference !== 'any' && (
                    <span className="badge badge-neutral">{preset.options.videoCodecPreference.toUpperCase()}</span>
                  )}
                  {preset.options.embedSubtitles && (
                    <span className="badge badge-neutral">Subs</span>
                  )}
                  {preset.options.sponsorBlockRemove && preset.options.sponsorBlockRemove !== 'none' && (
                    <span className="badge badge-warning">SponsorBlock</span>
                  )}
                  {preset.options.useAria2 && (
                    <span className="badge badge-info">Aria2c</span>
                  )}
                  {preset.options.concurrentFragments && preset.options.concurrentFragments > 1 && (
                    <span className="badge badge-neutral">-N {preset.options.concurrentFragments}</span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <button
                  onClick={() => onApplyPreset(preset)}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  <Check size={13} /> Use Preset
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => startEdit(preset)}
                    className="btn-secondary"
                    style={{ padding: '5px 8px', fontSize: 12 }}
                    title={isBuiltIn ? "View & Clone Preset" : "Edit Preset"}
                  >
                    <Edit2 size={13} />
                  </button>
                  {!isBuiltIn && (
                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      className="btn-danger"
                      style={{ padding: '5px 8px', fontSize: 12 }}
                      title="Delete Preset"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern High-End Preset Editor Modal */}
      {(isCreatingNew || editingPreset) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: 'var(--accent-primary-bright)' }}>
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                    {isCreatingNew ? 'Create New Preset Profile' : `Edit Preset: ${editingPreset?.name}`}
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Configure comprehensive yt-dlp flags for automated stream conversion
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPreset(null);
                  setIsCreatingNew(false);
                }}
                className="btn-secondary"
                style={{ padding: '4px 8px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Identity (Name, Description & Icon) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Profile Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 4K Cinema Master (AV1 + Opus in MKV)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Extracts highest 4K stream with clean audio and chapter markers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Icon Badge</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, backgroundColor: 'var(--bg-card)', padding: 6, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  {[
                    { id: 'video', label: 'Film' },
                    { id: 'music', label: 'Music' },
                    { id: 'archive', label: 'Box' },
                    { id: 'zap', label: 'Speed' },
                    { id: 'shield', label: 'Shield' },
                    { id: 'sparkles', label: 'Stars' },
                    { id: 'smartphone', label: 'Mobile' },
                    { id: 'disc', label: 'Disc' }
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setIcon(ic.id)}
                      style={{
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        border: icon === ic.id ? '1px solid var(--accent-primary-bright)' : '1px solid transparent',
                        backgroundColor: icon === ic.id ? 'rgba(46, 160, 67, 0.2)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {getPresetIcon(ic.id)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              {[
                { id: 'video', label: 'Video & Stream' },
                { id: 'audio', label: 'Audio & Extraction' },
                { id: 'subs', label: 'Subtitles & Metadata' },
                { id: 'advanced', label: 'SponsorBlock & Network' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn-${activeTab === tab.id ? 'primary' : 'secondary'}`}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Video & Stream */}
            {activeTab === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <input
                    type="checkbox"
                    id="audioOnlyToggle"
                    checked={audioOnly}
                    onChange={(e) => setAudioOnly(e.target.checked)}
                  />
                  <label htmlFor="audioOnlyToggle" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Audio-Only Profile (Disable Video Streams)
                  </label>
                </div>

                {!audioOnly && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Resolution Ceiling</label>
                      <select
                        value={maxResolution}
                        onChange={(e) => setMaxResolution(e.target.value as any)}
                        style={{ width: '100%' }}
                      >
                        <option value="best">Best Available (Original)</option>
                        <option value="2160p">4K (2160p)</option>
                        <option value="1440p">1440p (QHD)</option>
                        <option value="1080p">1080p (Full HD)</option>
                        <option value="720p">720p (HD)</option>
                        <option value="480p">480p (SD)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Video Codec Preference</label>
                      <select
                        value={videoCodecPreference}
                        onChange={(e) => setVideoCodecPreference(e.target.value as any)}
                        style={{ width: '100%' }}
                      >
                        <option value="any">Any / Best Native</option>
                        <option value="avc">H.264 / AVC (Most Compatible)</option>
                        <option value="vp9">VP9 (High Efficiency)</option>
                        <option value="av01">AV1 (Next-Gen High Fidelity)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Container Format</label>
                      <select
                        value={mergeOutputFormat}
                        onChange={(e) => setMergeOutputFormat(e.target.value)}
                        style={{ width: '100%' }}
                      >
                        <option value="mp4">MP4 (Universal)</option>
                        <option value="mkv">MKV (Best for multi-stream/subs)</option>
                        <option value="webm">WebM (Open Web)</option>
                        <option value="mov">MOV (Apple QuickTime)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>60 FPS Preference</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38 }}>
                        <input
                          type="checkbox"
                          id="fps60"
                          checked={prefer60fps}
                          onChange={(e) => setPrefer60fps(e.target.checked)}
                        />
                        <label htmlFor="fps60" style={{ fontSize: 13, cursor: 'pointer' }}>
                          Prioritize 60 FPS streams
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Audio & Extraction */}
            {activeTab === 'audio' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Audio Format</label>
                  <select
                    value={audioFormat}
                    onChange={(e) => setAudioFormat(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="mp3">MP3 (Universal compatibility)</option>
                    <option value="m4a">M4A / AAC (Apple devices)</option>
                    <option value="opus">Opus (Highest quality at low size)</option>
                    <option value="flac">FLAC (Lossless Master)</option>
                    <option value="wav">WAV (Uncompressed PCM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Audio Bitrate Quality</label>
                  <select
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="0">Best VBR (Quality 0 - ~320 kbps)</option>
                    <option value="320K">320 kbps Constant</option>
                    <option value="256K">256 kbps Constant</option>
                    <option value="192K">192 kbps Standard</option>
                    <option value="128K">128 kbps Voice / Efficient</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab 3: Subtitles & Metadata */}
            {activeTab === 'subs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={embedThumbnail}
                      onChange={(e) => setEmbedThumbnail(e.target.checked)}
                    />
                    Embed Cover Thumbnail
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={embedMetadata}
                      onChange={(e) => setEmbedMetadata(e.target.checked)}
                    />
                    Embed ID3 / MP4 Metadata
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={embedSubtitles}
                      onChange={(e) => setEmbedSubtitles(e.target.checked)}
                    />
                    Embed Subtitles Track
                  </label>
                </div>

                {embedSubtitles && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Convert Subtitles Format</label>
                      <select
                        value={convertSubs}
                        onChange={(e) => setConvertSubs(e.target.value as any)}
                        style={{ width: '100%' }}
                      >
                        <option value="srt">SRT (SubRip)</option>
                        <option value="vtt">VTT (WebVTT)</option>
                        <option value="ass">ASS (Advanced SubStation Alpha)</option>
                        <option value="none">Keep Original</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Subtitle Languages</label>
                      <input
                        type="text"
                        value={subtitlesLangs}
                        onChange={(e) => setSubtitlesLangs(e.target.value)}
                        placeholder="en,en.*,es"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: SponsorBlock & Network */}
            {activeTab === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>SponsorBlock Removal</label>
                    <select
                      value={sponsorBlockRemove}
                      onChange={(e) => setSponsorBlockRemove(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="none">Disabled (Keep all content)</option>
                      <option value="all">Remove All (Sponsor, Intro, Outro, Self-Promo)</option>
                      <option value="sponsor">Remove Paid Sponsor Segments Only</option>
                      <option value="selfpromo">Remove Self-Promotion Only</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Multi-Thread Fragments (-N)</label>
                    <select
                      value={concurrentFragments}
                      onChange={(e) => setConcurrentFragments(parseInt(e.target.value, 10))}
                      style={{ width: '100%' }}
                    >
                      <option value="1">1 Connection (Default)</option>
                      <option value="4">4 Concurrent Streams</option>
                      <option value="8">8 Concurrent Streams</option>
                      <option value="16">16 Concurrent Streams (Turbo)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={embedChapters}
                      onChange={(e) => setEmbedChapters(e.target.checked)}
                    />
                    Embed Chapter Markers
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={splitChapters}
                      onChange={(e) => setSplitChapters(e.target.checked)}
                    />
                    Split Into Multiple Files by Chapter
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={useAria2}
                      onChange={(e) => setUseAria2(e.target.checked)}
                    />
                    Accelerate with Aria2c Engine
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Custom yt-dlp Arguments</label>
                  <input
                    type="text"
                    placeholder="e.g. --geo-bypass --write-auto-subs"
                    value={customArgs}
                    onChange={(e) => setCustomArgs(e.target.value)}
                    style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>
            )}

            {/* Live Command Preview Box */}
            <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <Terminal size={12} color="var(--accent-primary-bright)" />
                <span>Generated yt-dlp Profile Command:</span>
              </div>
              <code style={{ fontSize: 11, color: '#7ee787', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                {generateCliPreview()}
              </code>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <button
                onClick={() => {
                  setEditingPreset(null);
                  setIsCreatingNew(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={!name.trim()}>
                Save Preset Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
