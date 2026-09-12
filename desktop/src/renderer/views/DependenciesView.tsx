import React, { useState, useEffect, useCallback } from 'react';
import { DependencyItem } from '../../../shared/types';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Download,
  Terminal,
  Cpu,
  Film,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface DependenciesViewProps {
  onRefreshEngine: () => void;
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({ onRefreshEngine }) => {
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);

  const fetchDependencies = useCallback(async () => {
    setLoading(true);
    try {
      const items = await window.electronAPI.getDependencies();
      setDependencies(items);
    } catch (e) {
      console.error('Failed to fetch dependencies', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleInstall = async (id: string) => {
    setInstallingId(id);
    setInstallMessage(null);
    try {
      const res = await window.electronAPI.installDependency(id);
      setInstallMessage(res.message);
      await fetchDependencies();
      onRefreshEngine();
    } catch (err: any) {
      setInstallMessage(`Installation error: ${err.message}`);
    } finally {
      setInstallingId(null);
    }
  };

  const missingCount = dependencies.filter((d) => d.status === 'missing').length;

  return (
    <div className="view-container">
      {/* View Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            System Dependencies
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Status of backend binaries, media conversion tools, and execution environments
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {missingCount > 0 && (
            <button
              onClick={() => handleInstall('ffmpeg')}
              disabled={installingId !== null}
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: 12 }}
            >
              {installingId ? (
                <>
                  <RotateCw size={13} className="animate-spin" />
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Install Missing Dependencies</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              fetchDependencies();
              onRefreshEngine();
            }}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Check Status</span>
          </button>
        </div>
      </div>

      {/* Installation Notification */}
      {installMessage && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: installMessage.includes('error')
              ? 'var(--accent-danger-glow)'
              : 'var(--accent-primary-glow)',
            border: `1px solid ${installMessage.includes('error') ? 'rgba(248, 81, 73, 0.4)' : 'var(--accent-success-border)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: installMessage.includes('error') ? 'var(--accent-danger)' : 'var(--accent-primary-bright)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {installMessage.includes('error') ? <AlertTriangle size={15} /> : <Check size={15} />}
          <span>{installMessage}</span>
        </div>
      )}

      {/* Health Overview Status Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          backgroundColor: '#161b22',
          borderColor: missingCount === 0 ? 'var(--accent-success-border)' : 'rgba(210, 153, 34, 0.4)',
          padding: '14px 18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: missingCount === 0 ? 'var(--accent-primary-glow)' : 'var(--accent-warning-glow)',
              color: missingCount === 0 ? 'var(--accent-primary-bright)' : 'var(--accent-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {missingCount === 0 ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {missingCount === 0
                ? 'All Core Dependencies Installed & Verified'
                : `${missingCount} Optional Dependency Action Recommended`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {missingCount === 0
                ? 'High-resolution 4K/1080p merging, stream muxing, and format conversion are fully functional.'
                : 'FFmpeg is required to merge separate video and audio streams into single MP4/MKV files.'}
            </div>
          </div>
        </div>

        {missingCount > 0 && (
          <button
            onClick={() => handleInstall('ffmpeg')}
            disabled={installingId !== null}
            className="btn-primary"
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            Auto-Install FFmpeg
          </button>
        )}
      </div>

      {/* Dependency Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dependencies.map((dep) => {
          const isInstalled = dep.status === 'installed';
          const isInstalling = installingId === dep.id;

          return (
            <div
              key={dep.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isInstalled ? 'var(--accent-primary-glow)' : 'var(--accent-warning-glow)',
                    color: isInstalled ? 'var(--accent-primary-bright)' : 'var(--accent-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {dep.category === 'media' ? (
                    <Film size={18} />
                  ) : dep.category === 'core' ? (
                    <Download size={18} />
                  ) : (
                    <Cpu size={18} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {dep.name}
                    </span>
                    <span
                      className={`badge ${isInstalled ? 'badge-primary' : 'badge-warning'}`}
                      style={{ fontSize: 10, padding: '1px 6px' }}
                    >
                      {isInstalled ? 'Installed' : 'Missing'}
                    </span>
                    {dep.version && (
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          backgroundColor: '#161b22',
                          padding: '1px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        {dep.version}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {dep.description}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      marginTop: 4,
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      <strong>Required for:</strong> {dep.requiredFor}
                    </span>
                    {dep.path && (
                      <>
                        <span>•</span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 320
                          }}
                          title={dep.path}
                        >
                          {dep.path}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button on Right */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {!isInstalled && (
                  <button
                    onClick={() => handleInstall(dep.id)}
                    disabled={isInstalling}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '5px 14px' }}
                  >
                    {isInstalling ? (
                      <>
                        <RotateCw size={13} className="animate-spin" />
                        <span>Installing...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Install</span>
                      </>
                    )}
                  </button>
                )}

                {isInstalled && dep.id === 'ytdlp' && (
                  <button
                    onClick={() => handleInstall('ytdlp')}
                    disabled={isInstalling}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                    title="Check for upstream updates"
                  >
                    {isInstalling ? <RotateCw size={13} className="animate-spin" /> : <span>Update</span>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
