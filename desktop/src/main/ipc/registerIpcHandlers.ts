import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EngineStatus, DownloadOptions, PresetProfile, AppSettings } from '../../shared/types';
import { YtDlpService } from '../services/YtDlpService';
import { FFmpegService } from '../services/FFmpegService';
import { DatabaseService } from '../services/DatabaseService';
import { DownloadManager } from '../services/DownloadManager';
import { CommandBuilderService } from '../services/CommandBuilderService';
import { LoggingService } from '../services/LoggingService';
import { DependencyService } from '../services/DependencyService';

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  const ytdlpService = YtDlpService.getInstance();
  const ffmpegService = FFmpegService.getInstance();
  const db = DatabaseService.getInstance();
  const downloadManager = DownloadManager.getInstance();
  const commandBuilder = CommandBuilderService.getInstance();
  const logger = LoggingService.getInstance();

  downloadManager.setMainWindow(mainWindow);
  logger.setMainWindow(mainWindow);

  // --- Engine Status ---
  ipcMain.handle('engine:status', async (): Promise<EngineStatus> => {
    const settings = db.getSettings();
    const ytExec = await ytdlpService.detect(settings.customYtDlpPath);
    const ffmpegInfo = await ffmpegService.detect(settings.customFFmpegPath);

    return {
      ytdlpAvailable: ytExec.source !== 'none',
      ytdlpVersion: ytExec.version,
      ytdlpPath: ytExec.path,
      ytdlpSource: ytExec.source,
      ffmpegAvailable: ffmpegInfo.available,
      ffmpegVersion: ffmpegInfo.version,
      ffmpegPath: ffmpegInfo.path,
      ffprobeAvailable: ffmpegInfo.ffprobeAvailable,
      platform: process.platform,
      arch: process.arch
    };
  });

  // --- Analysis & Command Building ---
  ipcMain.handle('engine:analyze', async (_, url: string) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      throw new Error('Please enter a valid URL.');
    }
    return ytdlpService.analyzeUrl(url.trim());
  });

  ipcMain.handle('command:build', async (_, options: DownloadOptions) => {
    const settings = db.getSettings();
    return commandBuilder.build(options, settings.defaultOutputDir);
  });

  // --- Downloads & Queue ---
  ipcMain.handle('download:start', async (_, options: DownloadOptions) => {
    return downloadManager.queueDownload(options);
  });

  ipcMain.handle('download:startBatch', async (_, optionsList: DownloadOptions[]) => {
    const ids: string[] = [];
    for (const opt of optionsList) {
      const id = await downloadManager.queueDownload(opt);
      ids.push(id);
    }
    return ids;
  });

  ipcMain.handle('download:pause', async (_, id: string) => {
    return downloadManager.pause(id);
  });

  ipcMain.handle('download:resume', async (_, id: string) => {
    return downloadManager.resume(id);
  });

  ipcMain.handle('download:cancel', async (_, id: string) => {
    return downloadManager.cancel(id);
  });

  ipcMain.handle('download:retry', async (_, id: string) => {
    return downloadManager.retry(id);
  });

  ipcMain.handle('download:delete', async (_, id: string) => {
    return downloadManager.deleteJob(id);
  });

  ipcMain.handle('download:list', async () => {
    return downloadManager.getJobs();
  });

  ipcMain.handle('download:details', async (_, id: string) => {
    return downloadManager.getJob(id);
  });

  // --- History ---
  ipcMain.handle('history:list', async (_, limit = 100) => {
    return db.getHistory(limit);
  });

  ipcMain.handle('history:clear', async () => {
    return db.clearHistory();
  });

  // --- Presets ---
  ipcMain.handle('presets:list', async () => {
    return db.getPresets();
  });

  ipcMain.handle('presets:save', async (_, preset: PresetProfile) => {
    return db.savePreset(preset);
  });

  ipcMain.handle('presets:delete', async (_, id: string) => {
    return db.deletePreset(id);
  });

  // --- Settings ---
  ipcMain.handle('settings:get', async () => {
    return db.getSettings();
  });

  ipcMain.handle('settings:update', async (_, settings: Partial<AppSettings>) => {
    return db.saveSettings(settings);
  });

  // --- System Integration ---
  ipcMain.handle('system:selectDirectory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || !result.filePaths.length) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('system:openExternal', async (_, url: string) => {
    if (!url) return false;
    try {
      await shell.openExternal(url);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('system:openPath', async (_, filePath: string) => {
    if (!filePath) return false;
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('mailto:')) {
      try {
        await shell.openExternal(filePath);
        return true;
      } catch {
        return false;
      }
    }
    const resolved = db.resolveActualFilePath(filePath) || filePath;
    if (fs.existsSync(resolved)) {
      const res = await shell.openPath(resolved);
      return res === '';
    }
    const dir = path.dirname(resolved);
    if (fs.existsSync(dir)) {
      const res = await shell.openPath(dir);
      return res === '';
    }
    return false;
  });

  ipcMain.handle('system:showItemInFolder', async (_, filePath: string) => {
    if (!filePath) return false;
    const resolved = db.resolveActualFilePath(filePath) || filePath;
    if (fs.existsSync(resolved)) {
      shell.showItemInFolder(resolved);
      return true;
    }
    const dir = path.dirname(resolved);
    if (fs.existsSync(dir)) {
      await shell.openPath(dir);
      return true;
    }
    return false;
  });

  // --- Logs ---
  ipcMain.handle('logs:get', async (_, filter) => {
    return logger.getLogs(filter);
  });

  ipcMain.handle('logs:clear', async () => {
    logger.clear();
    return true;
  });

  // --- Dependencies ---
  const dependencyService = DependencyService.getInstance();
  ipcMain.handle('dependencies:list', async () => {
    return dependencyService.getStatus();
  });

  ipcMain.handle('dependencies:install', async (_, name: string) => {
    return dependencyService.install(name);
  });

  // --- Window Controls (Frameless) ---
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow.isMaximized();
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-change', false);
  });
}
