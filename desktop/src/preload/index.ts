import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ElectronAPI, DownloadOptions, PresetProfile, AppSettings, DownloadProgress, DownloadStatus, LogEntry } from '../shared/types';

const api: ElectronAPI = {
  // Engine
  getEngineStatus: () => ipcRenderer.invoke('engine:status'),
  checkEngineHealth: () => ipcRenderer.invoke('engine:status'),

  // Analysis & Commands
  analyzeUrl: (url: string) => ipcRenderer.invoke('engine:analyze', url),
  buildCommand: (options: DownloadOptions) => ipcRenderer.invoke('command:build', options),

  // Downloads & Queue
  startDownload: (options: DownloadOptions) => ipcRenderer.invoke('download:start', options),
  startBatchDownloads: (optionsList: DownloadOptions[]) => ipcRenderer.invoke('download:startBatch', optionsList),
  pauseDownload: (id: string) => ipcRenderer.invoke('download:pause', id),
  resumeDownload: (id: string) => ipcRenderer.invoke('download:resume', id),
  cancelDownload: (id: string) => ipcRenderer.invoke('download:cancel', id),
  retryDownload: (id: string) => ipcRenderer.invoke('download:retry', id),
  deleteDownload: (id: string) => ipcRenderer.invoke('download:delete', id),
  getDownloads: () => ipcRenderer.invoke('download:list'),
  getJobDetails: (id: string) => ipcRenderer.invoke('download:details', id),

  // History
  getHistory: (limit?: number) => ipcRenderer.invoke('history:list', limit),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  // Presets
  getPresets: () => ipcRenderer.invoke('presets:list'),
  savePreset: (preset: PresetProfile) => ipcRenderer.invoke('presets:save', preset),
  deletePreset: (id: string) => ipcRenderer.invoke('presets:delete', id),

  // Settings & OS
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('settings:update', settings),
  selectDirectory: () => ipcRenderer.invoke('system:selectDirectory'),
  openPath: (filePath: string) => ipcRenderer.invoke('system:openPath', filePath),
  showItemInFolder: (filePath: string) => ipcRenderer.invoke('system:showItemInFolder', filePath),

  // Logs
  getLogs: (filter?: { level?: string; category?: string; jobId?: string }) => ipcRenderer.invoke('logs:get', filter),
  clearLogs: () => ipcRenderer.invoke('logs:clear'),

  // Dependencies
  getDependencies: () => ipcRenderer.invoke('dependencies:list'),
  installDependency: (id: string) => ipcRenderer.invoke('dependencies:install', id),

  // Events
  onProgress: (callback: (data: { id: string; progress: DownloadProgress }) => void) => {
    const handler = (_: IpcRendererEvent, data: { id: string; progress: DownloadProgress }) => callback(data);
    ipcRenderer.on('download:progress', handler);
    return () => ipcRenderer.removeListener('download:progress', handler);
  },

  onJobStatusChange: (callback: (data: { id: string; status: DownloadStatus; error?: string }) => void) => {
    const handler = (_: IpcRendererEvent, data: { id: string; status: DownloadStatus; error?: string }) => callback(data);
    ipcRenderer.on('download:status', handler);
    return () => ipcRenderer.removeListener('download:status', handler);
  },

  onLogEntry: (callback: (log: LogEntry) => void) => {
    const handler = (_: IpcRendererEvent, log: LogEntry) => callback(log);
    ipcRenderer.on('log:entry', handler);
    return () => ipcRenderer.removeListener('log:entry', handler);
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
