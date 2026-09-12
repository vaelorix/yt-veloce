import React, { useState } from 'react';
import { DownloadJob } from '../../../shared/types';
import {
  X,
  Terminal,
  FileText,
  AlertCircle,
  CheckCircle2,
  Folder,
  Play,
  Copy,
  Check,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface DownloadDetailsModalProps {
  job: DownloadJob | null;
  onClose: () => void;
  onOpenFile: (filePath: string) => void;
  onOpenFolder: (filePath: string) => void;
  onRetry: (id: string) => void;
}

export const DownloadDetailsModal: React.FC<DownloadDetailsModalProps> = ({
  job,
  onClose,
  onOpenFile,
  onOpenFolder,
  onRetry
}) => {
  if (!job) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'command' | 'logs' | 'troubleshoot'>('overview');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopyCommand = () => {
    if (job.commandExecuted) {
      navigator.clipboard.writeText(job.commandExecuted);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  // Generate intelligent diagnostic suggestions for errors
  const getTroubleshootingAdvice = () => {
    const errText = `${job.error || ''} ${job.errorDetails || ''} ${(job.logs || []).slice(-10).join(' ')}`.toLowerCase();

    if (errText.includes('requested format is not available') || errText.includes('format is not available')) {
      return {
        what: 'The requested video or audio format is not provided by the server.',
        why: 'The platform changed available resolutions, or the requested format ID does not exist for this specific upload.',
        fix: 'Switch your download profile to "Best Video + Best Audio" (bv*+ba/b) or use the Format Explorer to select an existing stream ID.'
      };
    }

    if (errText.includes('sign in to confirm') || errText.includes('bot') || errText.includes('http error 429')) {
      return {
        what: 'Platform verification or rate limit encountered.',
        why: 'The service requires login verification or has temporarily rate-limited your IP.',
        fix: 'Enable browser cookies in Settings or New Download (e.g. Chrome/Firefox cookies) or configure a proxy in Network Settings.'
      };
    }

    if (errText.includes('ffmpeg') && (errText.includes('not found') || errText.includes('is not recognized'))) {
      return {
        what: 'FFmpeg executable could not be found.',
        why: 'Post-processing tasks like merging streams or extracting MP3 require FFmpeg.',
        fix: 'Download FFmpeg or configure its executable path in Settings -> FFmpeg.'
      };
    }

    if (errText.includes('timeout') || errText.includes('connection refused') || errText.includes('network is unreachable')) {
      return {
        what: 'Network connection failed.',
        why: 'The host could not be reached or your connection dropped.',
        fix: 'Check your internet connection, test without VPN/proxy, and retry the download.'
      };
    }

    return {
      what: 'Download encountered an unexpected error.',
      why: 'yt-dlp returned a non-zero exit code.',
      fix: 'Review the terminal logs in the "Raw Logs" tab to see the exact error message from the engine.'
    };
  };

  const advice = getTroubleshootingAdvice();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 760,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#161b22',
          borderColor: '#30363d',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (matching Screenshot 3) */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#161b22'
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {job.title || 'Download Details'}
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginTop: 2
              }}
            >
              Job ID: {job.id}
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 16px',
            backgroundColor: 'var(--bg-main)'
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'command', label: 'CLI Command' },
            { id: 'logs', label: `Raw Logs (${job.logs.length})` },
            ...(job.status === 'error' ? [{ id: 'troubleshoot', label: 'Troubleshooting' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 14px',
                borderBottom:
                  activeTab === tab.id
                    ? '2px solid var(--accent-primary-bright)'
                    : '2px solid transparent',
                color:
                  activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: 12,
                borderRadius: 0,
                backgroundColor: 'transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: 18,
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            backgroundColor: 'var(--bg-main)'
          }}
        >
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  backgroundColor: '#161b22',
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                {job.thumbnail && (
                  <img
                    src={job.thumbnail}
                    alt="thumbnail"
                    style={{
                      width: 130,
                      height: 74,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #30363d'
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {job.title}
                  </h3>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      wordBreak: 'break-all'
                    }}
                  >
                    {job.url}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span className="badge badge-primary">{job.status}</span>
                    {job.outputPath && (
                      <span className="badge badge-neutral">File Saved</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Detail Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 10
                }}
              >
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{job.progress.percent}%</div>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current Speed</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--accent-primary-bright)'
                    }}
                  >
                    {job.progress.speed}
                  </div>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ETA</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{job.progress.eta}</div>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stage</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{job.progress.stage}</div>
                </div>
              </div>

              {/* Output Path Info */}
              {job.outputPath && (
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Output Location
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      wordBreak: 'break-all',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {job.outputPath}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => onOpenFile(job.outputPath!)}
                      className="btn-primary"
                      style={{ fontSize: 12, height: 28 }}
                    >
                      <Play size={13} /> Open Media
                    </button>
                    <button
                      onClick={() => onOpenFolder(job.outputPath!)}
                      className="btn-secondary"
                      style={{ fontSize: 12, height: 28 }}
                    >
                      <Folder size={13} /> Show in Folder
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: CLI Command */}
          {activeTab === 'command' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Backend Execution Syntax:
                </span>
                <button onClick={handleCopyCommand} className="btn-secondary" style={{ fontSize: 11, height: 26 }}>
                  {copiedCmd ? <Check size={13} color="var(--accent-primary-bright)" /> : <Copy size={13} />}
                  <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="code-block" style={{ fontSize: 12 }}>
                {job.commandExecuted || 'No command string captured.'}
              </div>
            </div>
          )}

          {/* Tab 3: Raw Logs */}
          {activeTab === 'logs' && (
            <div
              className="code-block"
              style={{
                height: 320,
                overflowY: 'auto',
                fontSize: 11,
                lineHeight: 1.6,
                color: 'var(--text-secondary)'
              }}
            >
              {job.logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>No console output recorded yet.</div>
              ) : (
                job.logs.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: line.includes('STDERR') || line.includes('ERROR')
                        ? 'var(--accent-danger)'
                        : undefined
                    }}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Troubleshooting */}
          {activeTab === 'troubleshoot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-danger-glow)',
                  border: '1px solid rgba(248, 81, 73, 0.35)'
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: 'var(--accent-danger)',
                    marginBottom: 4
                  }}
                >
                  Diagnostic Alert
                </div>
                <div style={{ fontSize: 12 }}>{advice.what}</div>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  Likely Cause
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {advice.why}
                </div>
              </div>

              <div
                className="card"
                style={{
                  padding: 14,
                  borderColor: 'rgba(63, 185, 80, 0.4)',
                  backgroundColor: 'var(--accent-primary-glow)'
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'var(--accent-primary-bright)',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Sparkles size={15} />
                  Suggested Solution
                </div>
                <div style={{ fontSize: 12 }}>{advice.fix}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (matching Screenshot 3: Cancel and Save/Action buttons) */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#161b22'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Status: {job.status}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '5px 14px', fontSize: 12 }}>
              Close
            </button>
            {job.status === 'error' && (
              <button
                onClick={() => {
                  onRetry(job.id);
                  onClose();
                }}
                className="btn-primary"
                style={{ padding: '5px 14px', fontSize: 12 }}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
