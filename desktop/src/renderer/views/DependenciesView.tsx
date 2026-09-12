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
  Check,
  Zap
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
    const timeout = setTimeout(() => {
      setInstallingId(null);
      setInstallMessage('Installation request reached client timeout. Refreshing status...');
      fetchDependencies();
    }, 45000);

    try {
      const res = await window.electronAPI.installDependency(id);
      clearTimeout(timeout);
      setInstallMessage(res.message);
      await fetchDependencies();
      onRefreshEngine();
    } catch (err: any) {
      clearTimeout(timeout);
      setInstallMessage(`Installation error: ${err.message}`);
    } finally {
      clearTimeout(timeout);
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
            System Dependencies & Toolchains
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Verify yt-dlp core, FFmpeg encoders, Python runtime, and stream accelerators
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {missingCount > 0 && (
            <button
              onClick={() => handleInstall('all')}
              disabled={installingId !== null}
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: 12 }}
            >
              {installingId === 'all' ? (
                <>
                  <RotateCw size={13} className="animate-spin" />
                  <span>Installing All...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Install All Missing</span>
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
            backgroundColor: installMessage.includes('error') || installMessage.includes('Failed')
              ? 'var(--accent-danger-glow)'
              : 'var(--accent-primary-glow)',
            border: `1px solid ${
              installMessage.includes('error') || installMessage.includes('Failed')
                ? 'rgba(248, 81, 73, 0.4)'
                : 'var(--accent-success-border)'
            }`,
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: installMessage.includes('error') || installMessage.includes('Failed')
              ? 'var(--accent-danger)'
              : 'var(--accent-primary-bright)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {installMessage.includes('error') || installMessage.includes('Failed') ? (
            <AlertTriangle size={15} />
          ) : (
            <Check size={15} />
          )}
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
          backgroundColor: 'var(--bg-surface)',
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
                ? 'All Core & Multimedia Dependencies Verified'
                : `${missingCount} Component${missingCount > 1 ? 's' : ''} Missing`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {missingCount === 0
                ? 'yt-dlp stream analyzer, FFmpeg stream merger, and Python 3 are active and ready.'
                : 'Click "Auto-Install All Missing" to download and configure required toolchains automatically.'}
            </div>
          </div>
        </div>

        {missingCount > 0 && (
          <button
            onClick={() => handleInstall('all')}
            disabled={installingId !== null}
            className="btn-primary"
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            {installingId ? 'Installing...' : 'Auto-Install All'}
          </button>
        )}
      </div>

      {/* Dependency Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dependencies.map((dep) => {
          const isInstalled = dep.status === 'installed';
          const isInstalling = installingId === dep.id || (installingId === 'all' && !isInstalled);

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
                  ) : dep.category === 'accelerator' ? (
                    <Zap size={18} />
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
                          backgroundColor: 'var(--bg-card-subtle)',
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
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span>
                      <strong>Used for:</strong> {dep.requiredFor}
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
                            maxWidth: 340
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
                    disabled={isInstalling || installingId !== null}
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

                {isInstalled && (dep.id === 'ytdlp' || dep.id === 'ffmpeg') && (
                  <button
                    onClick={() => handleInstall(dep.id)}
                    disabled={isInstalling || installingId !== null}
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
