import { LogEntry } from '../../shared/types';
import { BrowserWindow } from 'electron';

export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private maxLogs = 2000;
  private mainWindow: BrowserWindow | null = null;

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  public setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', category: 'system' | 'yt-dlp' | 'ffmpeg' | 'download' | 'scheduler', message: string, jobId?: string): LogEntry {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 10),
      timestamp: Date.now(),
      level,
      category,
      message,
      jobId
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Forward to renderer if window exists and is not destroyed
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('log:entry', entry);
    }

    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${category.toUpperCase()}] [${level.toUpperCase()}]`;
    if (level === 'error') {
      console.error(`${prefix} ${message}`);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }

    return entry;
  }

  public info(category: 'system' | 'yt-dlp' | 'ffmpeg' | 'download' | 'scheduler', message: string, jobId?: string) {
    return this.log('info', category, message, jobId);
  }

  public warn(category: 'system' | 'yt-dlp' | 'ffmpeg' | 'download' | 'scheduler', message: string, jobId?: string) {
    return this.log('warn', category, message, jobId);
  }

  public error(category: 'system' | 'yt-dlp' | 'ffmpeg' | 'download' | 'scheduler', message: string, jobId?: string) {
    return this.log('error', category, message, jobId);
  }

  public debug(category: 'system' | 'yt-dlp' | 'ffmpeg' | 'download' | 'scheduler', message: string, jobId?: string) {
    return this.log('debug', category, message, jobId);
  }

  public getLogs(filter?: { level?: string; category?: string; jobId?: string }): LogEntry[] {
    return this.logs.filter((log) => {
      if (filter?.level && log.level !== filter.level) return false;
      if (filter?.category && log.category !== filter.category) return false;
      if (filter?.jobId && log.jobId !== filter.jobId) return false;
      return true;
    });
  }

  public clear(): void {
    this.logs = [];
  }
}
