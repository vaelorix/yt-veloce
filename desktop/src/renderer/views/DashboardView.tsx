import React, { useState } from 'react';
import { DownloadJob, EngineStatus, PresetProfile } from '../../../shared/types';
import {
  Download,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  HardDrive,
  Cpu,
  Film,
  Play,
  Pause,
  RotateCw,
  Folder,
  SlidersHorizontal,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface DashboardViewProps {
  jobs: DownloadJob[];
  engineStatus: EngineStatus | null;
  presets: PresetProfile[];
  onNavigate: (view: any) => void;
  onQuickDownload: (url: string, presetId?: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onOpenDetails: (job: DownloadJob) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  engineStatus,
  presets,
  onNavigate,
  onQuickDownload,
  onPause,
  onResume,
  onOpenDetails
}) => {
  const activeJobs = jobs.filter((j) => j.status === 'downloading' || j.status === 'postprocessing');
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'error');

  // Compute total speed
  let totalSpeedBytes = 0;
  activeJobs.forEach((j) => {
    totalSpeedBytes += j.progress.speedBytesPerSec || 0;
  });

  return (
    <div className="view-container">
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {/* Active Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary-glow)',
              color: 'var(--accent-primary-bright)',
              border: '1px solid var(--accent-success-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Download size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Active Downloads</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{activeJobs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-primary-bright)' }}>
              {activeJobs.length > 0 ? 'Processing streams' : 'Idle'}
            </div>
          </div>
        </div>

        {/* Queued Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-warning-glow)',
              color: 'var(--accent-warning)',
              border: '1px solid rgba(210, 153, 34, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ListOrdered size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>In Queue</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{queuedJobs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {queuedJobs.length > 0 ? 'Waiting for slot' : 'Queue empty'}
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-success-glow)',
              color: 'var(--accent-success)',
              border: '1px solid var(--accent-success-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Completed</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{completedJobs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-success)' }}>Saved to library</div>
          </div>
        </div>

        {/* Engine Health Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              backgroundColor: engineStatus?.ytdlpAvailable
                ? 'var(--accent-success-glow)'
                : 'var(--accent-danger-glow)',
              color: engineStatus?.ytdlpAvailable
                ? 'var(--accent-success)'
                : 'var(--accent-danger)',
              border: engineStatus?.ytdlpAvailable
                ? '1px solid var(--accent-success-border)'
                : '1px solid rgba(248, 81, 73, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Engine Health</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {engineStatus?.ytdlpAvailable ? 'Operational' : 'Action Needed'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {engineStatus?.ytdlpVersion ? `yt-dlp ${engineStatus.ytdlpVersion}` : 'Not detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Media Studio Quick Actions Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
          border: '1px solid var(--border-color)',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(46, 160, 67, 0.15)',
              border: '1px solid rgba(46, 160, 67, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary-bright)'
            }}
          >
            <Download size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Media Acquisition Studio
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Inspect live streams, select video/audio codecs, configure SponsorBlock, and queue conversions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('new-download')}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <PlusCircle size={15} />
            <span>Open Download Studio</span>
            <kbd style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.3)' }}>Ctrl+N</kbd>
          </button>
          <button
            onClick={() => onNavigate('queue')}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ListOrdered size={15} />
            <span>View Queue ({activeJobs.length + queuedJobs.length})</span>
          </button>
        </div>
      </div>

      {/* Active Downloads Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowDown size={18} color="var(--accent-primary)" />
            Active Downloads ({activeJobs.length})
          </h3>
          {activeJobs.length > 0 && (
            <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => onNavigate('queue')}>
              View Full Queue
            </button>
          )}
        </div>

        {activeJobs.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10
            }}
          >
            <Download size={32} style={{ opacity: 0.4 }} />
            <div>No active downloads running right now.</div>
            <button className="btn-secondary" onClick={() => onNavigate('new-download')} style={{ marginTop: 8 }}>
              Start New Download
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  padding: 14,
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
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
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 500
                        }}
                        title={job.title}
                      >
                        {job.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                        <span>{job.uploader || 'yt-dlp engine'}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                          {job.progress.speed}
                        </span>
                        <span>•</span>
                        <span>ETA: {job.progress.eta}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => onPause(job.id)}
                      className="btn-icon"
                      title="Pause Download"
                    >
                      <Pause size={16} />
                    </button>
                    <button
                      onClick={() => onOpenDetails(job)}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '5px 10px' }}
                    >
                      Inspect Logs
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="progress-bar-track" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.max(2, job.progress.percent)}%` }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, width: 44, textAlign: 'right' }}>
                    {job.progress.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Engine Info & Presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Presets Quick Launcher */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={18} color="var(--accent-purple)" />
            Download Profiles
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {presets.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.description}</div>
                </div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => {
                    setSelectedPresetId(p.id);
                    onNavigate('new-download');
                  }}
                >
                  Use Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Diagnostics Card */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={18} color="var(--accent-primary)" />
            Engine Environment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>yt-dlp Core</span>
              <span style={{ fontWeight: 600, color: engineStatus?.ytdlpAvailable ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {engineStatus?.ytdlpVersion || 'Not Found'} ({engineStatus?.ytdlpSource || 'none'})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>FFmpeg Post-Processor</span>
              <span style={{ fontWeight: 600, color: engineStatus?.ffmpegAvailable ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                {engineStatus?.ffmpegAvailable ? `Ready (${engineStatus.ffmpegVersion || 'detected'})` : 'Missing (Optional)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform Architecture</span>
              <span style={{ fontWeight: 500 }}>
                {engineStatus?.platform || 'Unknown'} ({engineStatus?.arch || 'Unknown'})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Queue Concurrency</span>
              <span style={{ fontWeight: 500 }}>2 jobs parallel (default)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
