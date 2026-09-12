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
  ExternalLink
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
  const [quickUrl, setQuickUrl] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0]?.id || 'yt-best-mp4');

  const activeJobs = jobs.filter((j) => j.status === 'downloading' || j.status === 'postprocessing');
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'error');

  // Compute total speed
  let totalSpeedBytes = 0;
  activeJobs.forEach((j) => {
    totalSpeedBytes += j.progress.speedBytesPerSec || 0;
  });

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    onQuickDownload(quickUrl.trim(), selectedPresetId);
    setQuickUrl('');
  };

  return (
    <div className="view-container">
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Active Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary-glow)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Download size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Downloads</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{activeJobs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-primary)' }}>
              {activeJobs.length > 0 ? 'Processing streams' : 'Idle'}
            </div>
          </div>
        </div>

        {/* Queued Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-warning-glow)',
              color: 'var(--accent-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ListOrdered size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>In Queue</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{queuedJobs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {queuedJobs.length > 0 ? 'Waiting for slot' : 'Queue empty'}
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-success-glow)',
              color: 'var(--accent-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{completedJobs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-success)' }}>Saved to disk</div>
          </div>
        </div>

        {/* Engine Health Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              backgroundColor: engineStatus?.ytdlpAvailable ? 'var(--accent-success-glow)' : 'var(--accent-danger-glow)',
              color: engineStatus?.ytdlpAvailable ? 'var(--accent-success)' : 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Engine Health</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {engineStatus?.ytdlpAvailable ? 'Operational' : 'Action Needed'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {engineStatus?.ytdlpVersion ? `yt-dlp ${engineStatus.ytdlpVersion}` : 'Not detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Download Action Box */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={18} color="var(--accent-primary)" />
          Quick Download Launcher
        </h3>
        <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="url"
            placeholder="Paste YouTube, Vimeo, Twitch, or supported URL..."
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            style={{ flex: 1, minWidth: 280, fontSize: 14, padding: '10px 14px' }}
          />

          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            style={{ width: 220, padding: '10px 14px', fontSize: 13 }}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
            <Download size={16} />
            Download Now
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('new-download')}
            title="Open Advanced Analysis and Format Picker"
          >
            <SlidersHorizontal size={16} />
            Advanced Setup
          </button>
        </form>
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
                {engineStatus?.platform || process.platform} ({engineStatus?.arch || process.arch})
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
