import React, { useState, useMemo } from 'react';
import { FormatItem } from '../../../shared/types';
import {
  Layers,
  Search,
  Filter,
  Check,
  ArrowUpDown,
  Download,
  Terminal,
  HelpCircle,
  Copy
} from 'lucide-react';

interface FormatExplorerViewProps {
  formats: FormatItem[];
  onSelectFormatExpression: (expr: string) => void;
}

export const FormatExplorerView: React.FC<FormatExplorerViewProps> = ({
  formats,
  onSelectFormatExpression
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customExpression, setCustomExpression] = useState('bv*+ba/b');
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [copiedExpr, setCopiedExpr] = useState(false);

  // Filter chips
  const filterChips = [
    { id: 'all', label: 'All Streams' },
    { id: '4k', label: '4K / 2160p' },
    { id: '1440p', label: '1440p QHD' },
    { id: '1080p', label: '1080p FHD' },
    { id: '720p', label: '720p HD' },
    { id: 'audio', label: 'Audio Only' },
    { id: 'mp4', label: 'MP4' },
    { id: 'webm', label: 'WebM' },
    { id: 'av1', label: 'AV1' },
    { id: 'vp9', label: 'VP9' },
    { id: 'h264', label: 'H.264' }
  ];

  const filteredFormats = useMemo(() => {
    return formats.filter((f) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.formatId.toLowerCase().includes(q) ||
          f.resolution.toLowerCase().includes(q) ||
          f.vcodec.toLowerCase().includes(q) ||
          f.acodec.toLowerCase().includes(q) ||
          f.ext.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Filter chips
      if (activeFilter === '4k') return f.resolution.includes('2160') || (f.height && f.height >= 2160);
      if (activeFilter === '1440p') return f.resolution.includes('1440') || (f.height && f.height === 1440);
      if (activeFilter === '1080p') return f.resolution.includes('1080') || (f.height && f.height === 1080);
      if (activeFilter === '720p') return f.resolution.includes('720') || (f.height && f.height === 720);
      if (activeFilter === 'audio') return f.hasAudio && !f.hasVideo;
      if (activeFilter === 'mp4') return f.ext === 'mp4';
      if (activeFilter === 'webm') return f.ext === 'webm';
      if (activeFilter === 'av1') return f.vcodec.toLowerCase().includes('av01') || f.vcodec.toLowerCase().includes('av1');
      if (activeFilter === 'vp9') return f.vcodec.toLowerCase().includes('vp9');
      if (activeFilter === 'h264') return f.vcodec.toLowerCase().includes('avc') || f.vcodec.toLowerCase().includes('h264');

      return true;
    });
  }, [formats, activeFilter, searchQuery]);

  const handleCopyExpression = () => {
    navigator.clipboard.writeText(customExpression);
    setCopiedExpr(true);
    setTimeout(() => setCopiedExpr(false), 2000);
  };

  const handleRowClick = (item: FormatItem) => {
    setSelectedFormatId(item.formatId);
    if (item.hasVideo && !item.hasAudio) {
      setCustomExpression(`${item.formatId}+bestaudio/best`);
    } else if (item.hasAudio && !item.hasVideo) {
      setCustomExpression(item.formatId);
    } else {
      setCustomExpression(item.formatId);
    }
  };

  return (
    <div className="view-container">
      {/* Format Builder Card */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={17} color="var(--accent-primary-bright)" />
          yt-dlp Format Selector Expression
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Construct or fine-tune raw yt-dlp format expressions (e.g. <code>bv*[height&lt;=1080]+ba/b</code> or specific IDs like <code>137+140</code>).
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={customExpression}
            onChange={(e) => setCustomExpression(e.target.value)}
            placeholder="e.g. bv*+ba/b or 137+140"
            style={{ flex: 1, minWidth: 260, fontFamily: 'var(--font-mono)', fontSize: 14, padding: '10px 14px' }}
          />

          <button onClick={handleCopyExpression} className="btn-secondary" style={{ padding: '10px 16px' }}>
            {copiedExpr ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
            {copiedExpr ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={() => onSelectFormatExpression(customExpression)}
            className="btn-primary"
            style={{ padding: '10px 20px' }}
          >
            <Download size={16} />
            Apply to New Download
          </button>
        </div>

        {/* Quick Expression Presets */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
          {[
            { label: 'Best Video + Best Audio', expr: 'bv*+ba/b' },
            { label: 'Max 1080p MP4', expr: 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]' },
            { label: 'Best 4K Stream', expr: 'bv*[height<=2160]+ba/b' },
            { label: 'Best Audio Only', expr: 'ba/b' },
            { label: 'Smallest Video Size', expr: 'wv*+wa/w' }
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="badge badge-neutral"
              style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 11 }}
              onClick={() => setCustomExpression(item.expr)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={activeFilter === chip.id ? 'badge badge-primary' : 'badge badge-neutral'}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 'var(--radius-full)'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 240 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search formats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Formats Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Format ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Container</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Resolution</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>FPS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Video Codec</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Audio Codec</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bitrate (TBR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Est. Size</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormats.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    {formats.length === 0
                      ? 'No media analyzed yet. Enter a URL on the "New Download" page and click Analyze to populate streams.'
                      : 'No formats match your current search and filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredFormats.map((f) => {
                  const isSelected = selectedFormatId === f.formatId;
                  return (
                    <tr
                      key={f.formatId}
                      onClick={() => handleRowClick(f)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--accent-primary-glow)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        <span className="badge badge-primary">{f.formatId}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontWeight: 500 }}>
                        {f.ext}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {f.resolution}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{f.fps || '—'}</td>
                      <td style={{ padding: '12px 16px', color: f.hasVideo ? 'inherit' : 'var(--text-muted)' }}>
                        {f.vcodec}
                      </td>
                      <td style={{ padding: '12px 16px', color: f.hasAudio ? 'inherit' : 'var(--text-muted)' }}>
                        {f.acodec}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {f.tbr ? `${Math.round(f.tbr)} kbps` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {f.filesize
                          ? `${(f.filesize / (1024 * 1024)).toFixed(1)} MB`
                          : f.filesizeApprox
                          ? `~${(f.filesizeApprox / (1024 * 1024)).toFixed(1)} MB`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(f);
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
