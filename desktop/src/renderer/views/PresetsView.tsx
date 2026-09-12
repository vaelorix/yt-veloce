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
  Layers
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

  // Form states for editor
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formatSelection, setFormatSelection] = useState('');
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [mergeOutputFormat, setMergeOutputFormat] = useState('mp4');
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [embedMetadata, setEmbedMetadata] = useState(true);
  const [embedSubtitles, setEmbedSubtitles] = useState(false);

  const startCreate = () => {
    setName('');
    setDescription('');
    setFormatSelection('bv*+ba/b');
    setAudioOnly(false);
    setAudioFormat('mp3');
    setMergeOutputFormat('mp4');
    setEmbedThumbnail(true);
    setEmbedMetadata(true);
    setEmbedSubtitles(false);
    setIsCreatingNew(true);
    setEditingPreset(null);
  };

  const startEdit = (p: PresetProfile) => {
    setName(p.name);
    setDescription(p.description);
    setFormatSelection(p.options.formatSelection || '');
    setAudioOnly(Boolean(p.options.audioOnly));
    setAudioFormat(p.options.audioFormat || 'mp3');
    setMergeOutputFormat(p.options.mergeOutputFormat || 'mp4');
    setEmbedThumbnail(p.options.embedThumbnail ?? true);
    setEmbedMetadata(p.options.embedMetadata ?? true);
    setEmbedSubtitles(Boolean(p.options.embedSubtitles));
    setEditingPreset(p);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const newPreset: PresetProfile = {
      id: editingPreset ? editingPreset.id : `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'User custom preset',
      icon: audioOnly ? 'music' : 'video',
      isBuiltIn: false,
      options: {
        formatSelection: audioOnly ? undefined : formatSelection,
        audioOnly,
        audioFormat: audioOnly ? (audioFormat as any) : undefined,
        mergeOutputFormat: !audioOnly ? (mergeOutputFormat as any) : undefined,
        embedThumbnail,
        embedMetadata,
        embedSubtitles
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
    a.download = 'yt-dlp-presets.json';
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
        alert('Invalid JSON file.');
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
      default: return <Film size={20} color="var(--accent-primary)" />;
    }
  };

  return (
    <div className="view-container">
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Create and manage specialized profiles to speed up downloads and apply consistent settings.
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getPresetIcon(preset.icon)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{preset.name}</h3>
                    {preset.isBuiltIn && <span className="badge badge-neutral" style={{ fontSize: 10 }}>Built-in</span>}
                  </div>
                </div>

                {!preset.isBuiltIn && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => startEdit(preset)} className="btn-icon" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDeletePreset(preset.id)} className="btn-icon" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
                {preset.description}
              </p>

              {/* Options Summary Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {preset.options.audioOnly ? (
                  <span className="badge badge-primary">
                    Audio ({preset.options.audioFormat || 'MP3'})
                  </span>
                ) : (
                  <span className="badge badge-primary">
                    {preset.options.mergeOutputFormat ? `Merge to ${preset.options.mergeOutputFormat}` : 'Video'}
                  </span>
                )}
                {preset.options.embedThumbnail && <span className="badge badge-neutral">Thumb</span>}
                {preset.options.embedMetadata && <span className="badge badge-neutral">Meta</span>}
                {preset.options.embedSubtitles && <span className="badge badge-neutral">Subs</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => onApplyPreset(preset)}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                Use in New Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preset Editor Modal */}
      {(isCreatingNew || editingPreset) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: 540,
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {isCreatingNew ? 'Create New Preset' : `Edit Preset: ${editingPreset?.name}`}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube 4K Archival"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Downloads video and audio in maximum resolution..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={audioOnly}
                    onChange={(e) => setAudioOnly(e.target.checked)}
                  />
                  Audio Only Mode
                </label>
              </div>

              {audioOnly ? (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Audio Format</label>
                  <select
                    value={audioFormat}
                    onChange={(e) => setAudioFormat(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="mp3">MP3</option>
                    <option value="m4a">M4A</option>
                    <option value="opus">Opus</option>
                    <option value="flac">FLAC</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Format Expression</label>
                    <input
                      type="text"
                      value={formatSelection}
                      onChange={(e) => setFormatSelection(e.target.value)}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Container Format</label>
                    <select
                      value={mergeOutputFormat}
                      onChange={(e) => setMergeOutputFormat(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="mp4">MP4</option>
                      <option value="mkv">MKV</option>
                      <option value="webm">WebM</option>
                    </select>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, marginTop: 4 }}>
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
                  Embed Metadata
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={embedSubtitles}
                    onChange={(e) => setEmbedSubtitles(e.target.checked)}
                  />
                  Embed Subtitles
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
