import React, { useState } from 'react';
import { DownloadJob } from '../../../shared/types';
import {
  History,
  Search,
  Trash2,
  Folder,
  Play,
  Copy,
  RotateCw,
  Film,
  Calendar,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface HistoryViewProps {
  history: DownloadJob[];
  onOpenFile: (filePath: string) => void;
  onOpenFolder: (filePath: string) => void;
  onRedownload: (job: DownloadJob) => void;
  onClearHistory: () => void;
  onDeleteJob: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenFile,
  onOpenFolder,
  onRedownload,
  onClearHistory,
  onDeleteJob
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((j) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      (j.uploader && j.uploader.toLowerCase().includes(q)) ||
      j.url.toLowerCase().includes(q)
    );
  });

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="view-container">
      {/* Top Search & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search downloaded titles, uploaders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
          />
        </div>

        {history.length > 0 && (
          <button onClick={onClearHistory} className="btn-danger" style={{ fontSize: 12, padding: '6px 14px' }}>
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={36} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
            <div>No download history found.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px', width: 90 }}>Thumbnail</th>
                  <th style={{ padding: '12px 16px' }}>Title & Source</th>
                  <th style={{ padding: '12px 16px', width: 120 }}>Status</th>
                  <th style={{ padding: '12px 16px', width: 140 }}>Date Completed</th>
                  <th style={{ padding: '12px 16px', width: 180, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      {job.thumbnail ? (
                        <img
                          src={job.thumbnail}
                          alt="thumb"
                          style={{ width: 64, height: 38, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 64,
                            height: 38,
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Film size={18} color="var(--text-muted)" />
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 420
                        }}
                        title={job.title}
                      >
                        {job.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                        <span>{job.uploader || 'Web Media'}</span>
                        <span>•</span>
                        <span
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => handleCopyUrl(job.id, job.url)}
                          title="Click to copy URL"
                        >
                          {copiedId === job.id ? 'Copied!' : 'Copy URL'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      {job.status === 'completed' ? (
                        <span className="badge badge-success">Completed</span>
                      ) : job.status === 'error' ? (
                        <span className="badge badge-danger">Failed</span>
                      ) : (
                        <span className="badge badge-neutral">{job.status}</span>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : '—'}
                    </td>

                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {job.outputPath && (
                          <>
                            <button
                              onClick={() => onOpenFile(job.outputPath!)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              title="Play Media"
                            >
                              <Play size={13} />
                            </button>
                            <button
                              onClick={() => onOpenFolder(job.outputPath!)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              title="Open Folder"
                            >
                              <Folder size={13} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onRedownload(job)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          title="Re-download"
                        >
                          <RotateCw size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="btn-icon"
                          style={{ padding: '4px 8px' }}
                          title="Delete from History"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
