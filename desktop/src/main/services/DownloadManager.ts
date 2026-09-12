import { BrowserWindow } from 'electron';
import { DownloadJob, DownloadOptions, DownloadProgress, DownloadStatus, VideoMetadata } from '../../shared/types';
import { DatabaseService } from './DatabaseService';
import { ProcessManager } from './ProcessManager';
import { YtDlpService } from './YtDlpService';
import { CommandBuilderService } from './CommandBuilderService';
import { LoggingService } from './LoggingService';

export class DownloadManager {
  private static instance: DownloadManager;
  private db = DatabaseService.getInstance();
  private processManager = ProcessManager.getInstance();
  private ytdlpService = YtDlpService.getInstance();
  private commandBuilder = CommandBuilderService.getInstance();
  private logger = LoggingService.getInstance();

  private activeJobs: Map<string, DownloadJob> = new Map();
  private mainWindow: BrowserWindow | null = null;
  private isProcessingQueue = false;
  private progressThrottleMap: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  public setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }

  public async initialize(): Promise<void> {
    // Load uncompleted jobs from database into active memory
    const all = this.db.getAllJobs();
    for (const job of all) {
      if (job.status === 'downloading' || job.status === 'analyzing') {
        // App was closed while downloading; reset status to queued or paused
        job.status = 'paused';
        this.db.saveJob(job);
      }
      if (job.status === 'queued' || job.status === 'paused') {
        this.activeJobs.set(job.id, job);
      }
    }
    this.processQueue();
  }

  public async queueDownload(options: DownloadOptions, metadata?: VideoMetadata): Promise<string> {
    const id = Math.random().toString(36).substring(2, 10);
    const settings = this.db.getSettings();

    let title = 'Downloading Media';
    let thumbnail: string | undefined;
    let uploader: string | undefined;
    let duration: number | undefined;

    if (metadata) {
      title = metadata.title;
      thumbnail = metadata.thumbnail;
      uploader = metadata.uploader;
      duration = metadata.duration;
    }

    const job: DownloadJob = {
      id,
      url: options.url,
      title,
      thumbnail,
      uploader,
      duration,
      options,
      status: 'queued',
      progress: {
        percent: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        speed: 'Queued',
        speedBytesPerSec: 0,
        eta: '--:--',
        etaSeconds: 0,
        statusText: 'In Queue',
        stage: 'queued'
      },
      createdAt: Date.now(),
      logs: []
    };

    this.activeJobs.set(id, job);
    this.db.saveJob(job);

    this.emitStatus(job.id, 'queued');
    this.logger.info('download', `Job [${id}] added to queue: ${options.url}`, id);

    // If no title/metadata was passed, run a background analysis for metadata
    if (!metadata) {
      this.fetchMetadataInBackground(job);
    }

    this.processQueue();
    return id;
  }

  private async fetchMetadataInBackground(job: DownloadJob) {
    try {
      const meta = await this.ytdlpService.analyzeUrl(job.url);
      job.title = meta.title;
      job.thumbnail = meta.thumbnail;
      job.uploader = meta.uploader;
      job.duration = meta.duration;
      this.db.saveJob(job);
      this.emitStatus(job.id, job.status);
    } catch {
      // Ignore background analysis failures; the download itself will still proceed
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      const settings = this.db.getSettings();
      const maxConcurrent = settings.maxConcurrentDownloads || 2;

      let runningCount = 0;
      for (const job of this.activeJobs.values()) {
        if (job.status === 'downloading' || job.status === 'postprocessing') {
          runningCount++;
        }
      }

      if (runningCount >= maxConcurrent) {
        return;
      }

      // Find next queued job
      for (const job of this.activeJobs.values()) {
        if (runningCount >= maxConcurrent) break;

        if (job.status === 'queued') {
          runningCount++;
          this.executeJob(job);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private async executeJob(job: DownloadJob): Promise<void> {
    const settings = this.db.getSettings();
    const executable = this.ytdlpService.getExecutable();

    if (!executable || executable.source === 'none') {
      job.status = 'error';
      job.error = 'yt-dlp engine not found. Please install yt-dlp or configure its path in Settings.';
      this.db.saveJob(job);
      this.emitStatus(job.id, 'error', job.error);
      this.processQueue();
      return;
    }

    job.status = 'downloading';
    this.emitStatus(job.id, 'downloading');

    // Build command & args
    const buildResult = this.commandBuilder.build(job.options, settings.defaultOutputDir);
    job.commandExecuted = buildResult.command;
    this.db.saveJob(job);

    const cmd = executable.cmd;
    const args = [...executable.argsPrefix, ...buildResult.args];

    this.processManager.spawnDownload(job.id, cmd, args, {
      onProgress: (progress: DownloadProgress) => {
        job.progress = progress;
        job.status = progress.stage === 'postprocessing' ? 'postprocessing' : 'downloading';

        // Throttle progress events to UI to save IPC overhead (every ~80ms)
        const now = Date.now();
        const lastSent = this.progressThrottleMap.get(job.id) || 0;
        if (now - lastSent > 80 || progress.percent === 100) {
          this.progressThrottleMap.set(job.id, now);
          this.emitProgress(job.id, progress);
        }
      },
      onLog: (line: string) => {
        job.logs.push(line);
        if (job.logs.length > 500) {
          job.logs.shift();
        }
      },
      onCompleted: (outputPath?: string) => {
        job.status = 'completed';
        job.completedAt = Date.now();
        job.outputPath = outputPath || job.outputPath;
        this.db.saveJob(job);
        this.emitStatus(job.id, 'completed');
        this.processQueue();
      },
      onError: (errText: string, details?: string) => {
        job.status = 'error';
        job.error = errText;
        job.errorDetails = details;
        this.db.saveJob(job);
        this.emitStatus(job.id, 'error', errText);
        this.processQueue();
      }
    });
  }

  public async pause(id: string): Promise<boolean> {
    const job = this.activeJobs.get(id);
    if (!job) return false;

    if (job.status === 'downloading' || job.status === 'queued') {
      this.processManager.cancel(id);
      job.status = 'paused';
      job.progress.statusText = 'Paused';
      this.db.saveJob(job);
      this.emitStatus(id, 'paused');
      this.processQueue();
      return true;
    }
    return false;
  }

  public async resume(id: string): Promise<boolean> {
    const job = this.activeJobs.get(id);
    if (!job) return false;

    if (job.status === 'paused' || job.status === 'error') {
      job.status = 'queued';
      job.error = undefined;
      job.errorDetails = undefined;
      job.progress.statusText = 'Queued';
      this.db.saveJob(job);
      this.emitStatus(id, 'queued');
      this.processQueue();
      return true;
    }
    return false;
  }

  public async cancel(id: string): Promise<boolean> {
    const job = this.activeJobs.get(id);
    if (!job) return false;

    this.processManager.cancel(id);
    job.status = 'cancelled';
    job.progress.statusText = 'Cancelled';
    this.db.saveJob(job);
    this.emitStatus(id, 'cancelled');
    this.processQueue();
    return true;
  }

  public async retry(id: string): Promise<boolean> {
    let job = this.activeJobs.get(id);
    if (!job) {
      job = this.db.getJob(id) || undefined;
      if (job) this.activeJobs.set(id, job);
    }
    if (!job) return false;

    job.status = 'queued';
    job.error = undefined;
    job.errorDetails = undefined;
    job.progress = {
      percent: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      speed: 'Queued',
      speedBytesPerSec: 0,
      eta: '--:--',
      etaSeconds: 0,
      statusText: 'In Queue',
      stage: 'queued'
    };
    this.db.saveJob(job);
    this.emitStatus(id, 'queued');
    this.processQueue();
    return true;
  }

  public async deleteJob(id: string): Promise<boolean> {
    this.processManager.cancel(id);
    this.activeJobs.delete(id);
    return this.db.deleteJob(id);
  }

  public getJobs(): DownloadJob[] {
    return Array.from(this.activeJobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getJob(id: string): DownloadJob | null {
    return this.activeJobs.get(id) || this.db.getJob(id);
  }

  private emitProgress(id: string, progress: DownloadProgress): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('download:progress', { id, progress });
    }
  }

  private emitStatus(id: string, status: DownloadStatus, error?: string): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('download:status', { id, status, error });
    }
  }
}
