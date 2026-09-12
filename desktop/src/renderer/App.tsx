import React, { useState, useEffect, useCallback } from 'react';
import {
  EngineStatus,
  DownloadJob,
  PresetProfile,
  AppSettings,
  LogEntry,
  DownloadOptions,
  VideoMetadata,
  FormatItem
} from '../shared/types';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { NewDownloadView } from './views/NewDownloadView';
import { QueueView } from './views/QueueView';
import { HistoryView } from './views/HistoryView';
import { FormatExplorerView } from './views/FormatExplorerView';
import { PresetsView } from './views/PresetsView';
import { CommandBuilderView } from './views/CommandBuilderView';
import { LogsView } from './views/LogsView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { DownloadDetailsModal } from './views/DownloadDetailsModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Application Data States
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [history, setHistory] = useState<DownloadJob[]>([]);
  const [presets, setPresets] = useState<PresetProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    defaultOutputDir: '',
    maxConcurrentDownloads: 2,
    defaultPresetId: 'yt-best-mp4',
    filenameTemplate: '%(title)s [%(id)s].%(ext)s',
    customYtDlpPath: '',
    customFFmpegPath: '',
    theme: 'dark',
    enableNotifications: true,
    defaultRateLimit: '',
    proxyUrl: '',
    browserCookies: ''
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Detailed inspect modal state
  const [inspectedJob, setInspectedJob] = useState<DownloadJob | null>(null);
  const [builderOptions, setBuilderOptions] = useState<DownloadOptions | undefined>(undefined);
  const [activeFormats, setActiveFormats] = useState<FormatItem[]>([]);

  // Calculate aggregate speed
  const totalSpeedBytes = jobs
    .filter((j) => j.status === 'downloading')
    .reduce((acc, j) => acc + (j.progress.speedBytesPerSec || 0), 0);

  const formatTotalSpeed = (bytesPerSec: number): string => {
    if (!bytesPerSec || isNaN(bytesPerSec)) return '0 B/s';
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let i = 0;
    let v = bytesPerSec;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(1)} ${units[i]}`;
  };

  // Initial Data Fetch
  const refreshEngine = useCallback(async () => {
    try {
      const status = await window.electronAPI.getEngineStatus();
      setEngineStatus(status);
    } catch (e) {
      console.error('Failed to get engine status', e);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedPresets, fetchedJobs, fetchedHistory, fetchedLogs] = await Promise.all([
        window.electronAPI.getSettings(),
        window.electronAPI.getPresets(),
        window.electronAPI.getDownloads(),
        window.electronAPI.getHistory(),
        window.electronAPI.getLogs()
      ]);

      setSettings(fetchedSettings);
      setTheme(fetchedSettings.theme === 'light' ? 'light' : 'dark');
      setPresets(fetchedPresets);
      setJobs(fetchedJobs);
      setHistory(fetchedHistory);
      setLogs(fetchedLogs);
    } catch (e) {
      console.error('Failed to load application data', e);
    }
  }, []);

  useEffect(() => {
    refreshEngine();
    refreshAllData();

    // Subscribe to IPC progress updates
    const unsubscribeProgress = window.electronAPI.onProgress(({ id, progress }) => {
      setJobs((prevJobs) =>
        prevJobs.map((j) => (j.id === id ? { ...j, progress } : j))
      );
      if (inspectedJob && inspectedJob.id === id) {
        setInspectedJob((prev) => (prev ? { ...prev, progress } : null));
      }
    });

    // Subscribe to IPC status updates
    const unsubscribeStatus = window.electronAPI.onJobStatusChange(({ id, status, error }) => {
      setJobs((prevJobs) =>
        prevJobs.map((j) => (j.id === id ? { ...j, status, error } : j))
      );
      if (inspectedJob && inspectedJob.id === id) {
        setInspectedJob((prev) => (prev ? { ...prev, status, error } : null));
      }
      if (status === 'completed' || status === 'error') {
        window.electronAPI.getHistory().then(setHistory);
      }
    });

    // Subscribe to IPC live logs
    const unsubscribeLogs = window.electronAPI.onLogEntry((log) => {
      setLogs((prev) => [...prev.slice(-1500), log]);
      if (log.jobId && inspectedJob && inspectedJob.id === log.jobId) {
        setInspectedJob((prev) =>
          prev ? { ...prev, logs: [...(prev.logs || []), log.message] } : null
        );
      }
    });

    return () => {
      unsubscribeProgress();
      unsubscribeStatus();
      unsubscribeLogs();
    };
  }, [refreshEngine, refreshAllData]);

  // Handle Theme Attribute on HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setCurrentView('new-download');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCurrentView('queue');
      } else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setCurrentView('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Job Actions
  const handleStartDownload = async (options: DownloadOptions, metadata?: VideoMetadata) => {
    try {
      await window.electronAPI.startDownload(options);
      const updatedJobs = await window.electronAPI.getDownloads();
      setJobs(updatedJobs);
      setCurrentView('queue');
    } catch (e) {
      console.error('Failed to start download', e);
    }
  };

  const handlePause = async (id: string) => {
    await window.electronAPI.pauseDownload(id);
    const updatedJobs = await window.electronAPI.getDownloads();
    setJobs(updatedJobs);
  };

  const handleResume = async (id: string) => {
    await window.electronAPI.resumeDownload(id);
    const updatedJobs = await window.electronAPI.getDownloads();
    setJobs(updatedJobs);
  };

  const handleCancel = async (id: string) => {
    await window.electronAPI.cancelDownload(id);
    const updatedJobs = await window.electronAPI.getDownloads();
    setJobs(updatedJobs);
  };

  const handleRetry = async (id: string) => {
    await window.electronAPI.retryDownload(id);
    const updatedJobs = await window.electronAPI.getDownloads();
    setJobs(updatedJobs);
  };

  const handleDelete = async (id: string) => {
    await window.electronAPI.deleteDownload(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setHistory((prev) => prev.filter((j) => j.id !== id));
  };

  const handleClearHistory = async () => {
    await window.electronAPI.clearHistory();
    setHistory([]);
  };

  const handleSavePreset = async (preset: PresetProfile) => {
    await window.electronAPI.savePreset(preset);
    const updated = await window.electronAPI.getPresets();
    setPresets(updated);
  };

  const handleDeletePreset = async (id: string) => {
    await window.electronAPI.deletePreset(id);
    const updated = await window.electronAPI.getPresets();
    setPresets(updated);
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await window.electronAPI.updateSettings(newSettings);
    setSettings(updated);
    if (newSettings.theme) {
      setTheme(newSettings.theme === 'light' ? 'light' : 'dark');
    }
    if (newSettings.customYtDlpPath !== undefined || newSettings.customFFmpegPath !== undefined) {
      refreshEngine();
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    handleSaveSettings({ theme: nextTheme });
  };

  return (
    <div className="app-container">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        queueCount={jobs.filter((j) => j.status === 'downloading' || j.status === 'queued').length}
      />

      {/* Main Workspace */}
      <div className="main-content">
        <Header
          currentView={currentView}
          engineStatus={engineStatus}
          totalSpeed={formatTotalSpeed(totalSpeedBytes)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onNewDownloadClick={() => setCurrentView('new-download')}
          activeCount={jobs.filter((j) => j.status === 'downloading' || j.status === 'postprocessing').length}
        />

        {/* View Routing */}
        {currentView === 'dashboard' && (
          <DashboardView
            jobs={jobs}
            engineStatus={engineStatus}
            presets={presets}
            onNavigate={setCurrentView}
            onQuickDownload={(url, presetId) => {
              handleStartDownload({ url, presetId });
            }}
            onPause={handlePause}
            onResume={handleResume}
            onOpenDetails={setInspectedJob}
          />
        )}

        {currentView === 'new-download' && (
          <NewDownloadView
            presets={presets}
            defaultOutputDir={settings.defaultOutputDir}
            onStartDownload={handleStartDownload}
            onSelectDirectory={() => window.electronAPI.selectDirectory()}
            onNavigateToCommandBuilder={(opts) => {
              setBuilderOptions(opts);
              setCurrentView('command-builder');
            }}
          />
        )}

        {currentView === 'queue' && (
          <QueueView
            jobs={jobs}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onDelete={handleDelete}
            onOpenDetails={setInspectedJob}
            onOpenFile={(p) => window.electronAPI.openPath(p)}
            onOpenFolder={(p) => window.electronAPI.showItemInFolder(p)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            history={history}
            onOpenFile={(p) => window.electronAPI.openPath(p)}
            onOpenFolder={(p) => window.electronAPI.showItemInFolder(p)}
            onRedownload={(j) => handleStartDownload(j.options)}
            onClearHistory={handleClearHistory}
            onDeleteJob={handleDelete}
          />
        )}

        {currentView === 'format-explorer' && (
          <FormatExplorerView
            formats={activeFormats}
            onSelectFormatExpression={(expr) => {
              setCurrentView('new-download');
            }}
          />
        )}

        {currentView === 'presets' && (
          <PresetsView
            presets={presets}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            onApplyPreset={() => setCurrentView('new-download')}
          />
        )}

        {currentView === 'command-builder' && (
          <CommandBuilderView
            initialOptions={builderOptions}
            defaultOutputDir={settings.defaultOutputDir}
            onSendToDownload={handleStartDownload}
          />
        )}

        {currentView === 'logs' && (
          <LogsView
            logs={logs}
            onClearLogs={() => {
              window.electronAPI.clearLogs();
              setLogs([]);
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            engineStatus={engineStatus}
            onSaveSettings={handleSaveSettings}
            onSelectDirectory={() => window.electronAPI.selectDirectory()}
            onRefreshEngine={refreshEngine}
          />
        )}

        {currentView === 'about' && <AboutView />}

        {/* Dedicated Bottom Status Bar (matching GitHub Power Suite) */}
        <footer className="app-statusbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary-bright)',
                boxShadow: '0 0 6px rgba(63, 185, 80, 0.5)'
              }}
            />
            {jobs.some((j) => j.status === 'downloading') ? (
              <span>
                Running yt-dlp worker · {totalSpeedBytes > 0 ? formatTotalSpeed(totalSpeedBytes) : 'processing'}
              </span>
            ) : (
              <span>yt-dlp Engine Ready · SQLite connected</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)' }}>
            <span>
              <strong style={{ color: 'var(--text-secondary)' }}>
                {jobs.filter((j) => j.status === 'queued').length}
              </strong>{' '}
              queued
            </span>
            <span>
              <strong style={{ color: 'var(--text-secondary)' }}>
                {jobs.filter((j) => j.status === 'downloading' || j.status === 'postprocessing').length}
              </strong>{' '}
              active
            </span>
            <span>
              <strong style={{ color: 'var(--text-secondary)' }}>{history.length}</strong> completed
            </span>
            <span>
              FFmpeg:{' '}
              <span
                style={{
                  color: engineStatus?.ffmpegAvailable ? 'var(--accent-primary-bright)' : 'var(--accent-warning)'
                }}
              >
                {engineStatus?.ffmpegAvailable ? 'Ready' : 'Missing'}
              </span>
            </span>
            <span>exit: 0</span>
          </div>
        </footer>
      </div>

      {/* Deep Inspection & Troubleshooting Modal */}
      {inspectedJob && (
        <DownloadDetailsModal
          job={inspectedJob}
          onClose={() => setInspectedJob(null)}
          onOpenFile={(p) => window.electronAPI.openPath(p)}
          onOpenFolder={(p) => window.electronAPI.showItemInFolder(p)}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};
