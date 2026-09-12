import React, { useState } from 'react';
import { DownloadJob, DownloadStatus } from '../../../shared/types';
import {
  ListOrdered,
  Play,
  Pause,
  RotateCw,
  XCircle,
  Trash2,
  Folder,
  FileText,
  AlertCircle,
  Clock,
  Film,
  ArrowDown
} from 'lucide-react';

interface QueueViewProps {
  jobs: DownloadJob[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (job: DownloadJob) => void;
  onOpenFile: (filePath: string) => void;
  onOpenFolder: (filePath: string) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  jobs,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onDelete,
  onOpenDetails,
  onOpenFile,
  onOpenFolder
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredJobs = jobs.filter((j) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return j.status === 'downloading' || j.status === 'postprocessing';
    if (filterStatus === 'queued') return j.status === 'queued';
    if (filterStatus === 'paused') return j.status === 'paused';
    if (filterStatus === 'completed') return j.status === 'completed';
    if (filterStatus === 'failed') return j.status === 'error';
    return true;
  });

  const getStatusBadge = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading':
        return <span className="badge badge-primary">Downloading</span>;
      case 'postprocessing':
        return <span className="badge badge-primary">Merging / Post-Processing</span>;
      case 'queued':
        return <span className="badge badge-warning">Queued</span>;
      case 'paused':
        return <span className="badge badge-neutral">Paused</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'error':
        return <span className="badge badge-danger">Failed</span>;
      case 'cancelled':
        return <span className="badge badge-neutral">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const handlePauseAll = () => {
    jobs.forEach((j) => {
      if (j.status === 'downloading' || j.status === 'queued') {
        onPause(j.id);
      }
    });
  };

  const handleResumeAll = () => {
    jobs.forEach((j) => {
      if (j.status === 'paused') {
        onResume(j.id);
      }
    });
  };

  return (
    <div className="view-container">
      {/* Control Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all', label: `All (${jobs.length})` },
            { id: 'active', label: `Active (${jobs.filter((j) => j.status === 'downloading' || j.status === 'postprocessing').length})` },
            { id: 'queued', label: `Queued (${jobs.filter((j) => j.status === 'queued').length})` },
            { id: 'paused', label: `Paused (${jobs.filter((j) => j.status === 'paused').length})` },
            { id: 'completed', label: `Completed (${jobs.filter((j) => j.status === 'completed').length})` },
            { id: 'failed', label: `Failed (${jobs.filter((j) => j.status === 'error').length})` }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={filterStatus === item.id ? 'badge badge-primary' : 'badge badge-neutral'}
              style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 'var(--radius-full)' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleResumeAll} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Play size={14} /> Resume All
          </button>
          <button onClick={handlePauseAll} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Pause size={14} /> Pause All
          </button>
        </div>
      </div>

      {/* Queue List */}
      {filteredJobs.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 50,
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}
        >
          <ListOrdered size={36} style={{ opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 500 }}>No downloads in this queue filter.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'pointer'
              }}
              onClick={() => onOpenDetails(job)}
            >
              {/* Job Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden' }}>
                  {job.thumbnail ? (
                    <img
                      src={job.thumbnail}
                      alt="thumb"
                      style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 48,
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Film size={20} color="var(--text-muted)" />
                    </div>
                  )}

                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 580
                      }}
                      title={job.title}
                    >
                      {job.title}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, marginTop: 4 }}>
                      {getStatusBadge(job.status)}
                      {job.status === 'downloading' && (
                        <>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                            {job.progress.speed}
                          </span>
                          <span>•</span>
                          <span>ETA: {job.progress.eta}</span>
                        </>
                      )}
                      {job.options.mergeOutputFormat && (
                        <span style={{ textTransform: 'uppercase' }}>
                          [{job.options.mergeOutputFormat}]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Action Buttons */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {job.status === 'downloading' && (
                    <button onClick={() => onPause(job.id)} className="btn-icon" title="Pause">
                      <Pause size={16} />
                    </button>
                  )}

                  {(job.status === 'paused' || job.status === 'cancelled') && (
                    <button onClick={() => onResume(job.id)} className="btn-icon" title="Resume">
                      <Play size={16} />
                    </button>
                  )}

                  {job.status === 'error' && (
                    <button onClick={() => onRetry(job.id)} className="btn-icon" title="Retry">
                      <RotateCw size={16} />
                    </button>
                  )}

                  {job.status === 'completed' && job.outputPath && (
                    <>
                      <button
                        onClick={() => onOpenFile(job.outputPath!)}
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        Play
                      </button>
                      <button
                        onClick={() => onOpenFolder(job.outputPath!)}
                        className="btn-icon"
                        title="Show in Folder"
                      >
                        <Folder size={16} />
                      </button>
                    </>
                  )}

                  {(job.status === 'downloading' || job.status === 'queued') && (
                    <button onClick={() => onCancel(job.id)} className="btn-icon" title="Cancel">
                      <XCircle size={16} />
                    </button>
                  )}

                  <button onClick={() => onDelete(job.id)} className="btn-icon" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Status Text */}
              {(job.status === 'downloading' || job.status === 'postprocessing' || job.status === 'queued') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="progress-bar-track" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.max(1, job.progress.percent)}%` }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, width: 44, textAlign: 'right' }}>
                    {job.progress.percent}%
                  </span>
                </div>
              )}

              {/* Error summary if failed */}
              {job.status === 'error' && job.error && (
                <div
                  style={{
                    backgroundColor: 'var(--accent-danger-glow)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: 12,
                    color: 'var(--accent-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{job.error}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
