import { spawn, ChildProcess } from 'child_process';
import { DownloadProgress, DownloadStatus } from '../../shared/types';
import { LoggingService } from './LoggingService';

export interface ProcessCallbacks {
  onProgress: (progress: DownloadProgress) => void;
  onLog: (line: string) => void;
  onCompleted: (outputPath?: string) => void;
  onError: (error: string, details?: string) => void;
}

export class ProcessManager {
  private static instance: ProcessManager;
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private logger = LoggingService.getInstance();

  private constructor() {}

  public static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager();
    }
    return ProcessManager.instance;
  }

  public spawnDownload(
    jobId: string,
    cmd: string,
    args: string[],
    callbacks: ProcessCallbacks
  ): void {
    // Add progress formatting flags
    const executionArgs = [
      ...args.slice(0, -1), // all options before URL
      '--newline',
      '--progress',
      '--progress-template',
      'download:[AGY_PROG] %(progress.downloaded_bytes)s %(progress.total_bytes)s %(progress.speed)s %(progress.eta)s %(progress.status)s %(progress.filename)s',
      args[args.length - 1] // URL
    ];

    this.logger.info('download', `Starting download job [${jobId}] with command: ${cmd} ${executionArgs.join(' ')}`, jobId);

    const child = spawn(cmd, executionArgs, {
      shell: process.platform === 'win32'
    });

    this.runningProcesses.set(jobId, child);

    let detectedOutputPath: string | undefined;
    let lastErrorSnippet = '';

    child.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/);

      for (const line of lines) {
        if (!line.trim()) continue;
        callbacks.onLog(line);

        // 1. Check structured [AGY_PROG] line
        if (line.includes('[AGY_PROG]')) {
          const parsed = this.parseStructuredProgress(line);
          if (parsed) {
            if (parsed.filename) detectedOutputPath = parsed.filename;
            callbacks.onProgress(parsed);
          }
          continue;
        }

        // 2. Check fallback standard yt-dlp progress
        // e.g. [download]  45.2% of 120.50MiB at 4.20MiB/s ETA 00:15
        if (line.startsWith('[download]')) {
          const fallback = this.parseFallbackProgress(line);
          if (fallback) {
            callbacks.onProgress(fallback);
          }
          // Check for destination filename
          const destMatch = line.match(/\[download\] Destination:\s*(.+)$/i);
          if (destMatch) {
            detectedOutputPath = destMatch[1].trim();
          }
          continue;
        }

        // 3. Check post-processing stages
        if (line.startsWith('[Merger]') || line.startsWith('[ExtractAudio]') || line.startsWith('[Fixup]')) {
          callbacks.onProgress({
            percent: 99,
            downloadedBytes: 0,
            totalBytes: 0,
            speed: 'Processing...',
            speedBytesPerSec: 0,
            eta: 'Finishing',
            etaSeconds: 0,
            statusText: 'Post-processing media (FFmpeg)',
            stage: 'postprocessing',
            filename: detectedOutputPath
          });
        }
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      callbacks.onLog(`[STDERR] ${text}`);
      this.logger.warn('yt-dlp', text, jobId);
      lastErrorSnippet = text;
    });

    child.on('error', (err) => {
      this.runningProcesses.delete(jobId);
      this.logger.error('download', `Spawn error on job [${jobId}]: ${err.message}`, jobId);
      callbacks.onError(`Process execution error: ${err.message}`);
    });

    child.on('close', (code) => {
      this.runningProcesses.delete(jobId);

      if (code === 0) {
        this.logger.info('download', `Job [${jobId}] completed successfully`, jobId);
        callbacks.onProgress({
          percent: 100,
          downloadedBytes: 0,
          totalBytes: 0,
          speed: 'Done',
          speedBytesPerSec: 0,
          eta: '00:00',
          etaSeconds: 0,
          statusText: 'Completed',
          stage: 'finished',
          filename: detectedOutputPath
        });
        callbacks.onCompleted(detectedOutputPath);
      } else {
        this.logger.error('download', `Job [${jobId}] failed with exit code ${code}`, jobId);
        callbacks.onError(
          `Download process exited with code ${code}`,
          lastErrorSnippet || 'Unknown engine error. Inspect the job logs for details.'
        );
      }
    });
  }

  public cancel(jobId: string): boolean {
    const child = this.runningProcesses.get(jobId);
    if (!child || child.killed) return false;

    this.logger.info('download', `Terminating process for job [${jobId}] (PID: ${child.pid})`, jobId);

    if (process.platform === 'win32' && child.pid) {
      // Tree kill on Windows
      spawn('taskkill', ['/pid', child.pid.toString(), '/T', '/F']);
    } else {
      child.kill('SIGTERM');
      setTimeout(() => {
        if (this.runningProcesses.has(jobId)) {
          child.kill('SIGKILL');
        }
      }, 1000);
    }

    this.runningProcesses.delete(jobId);
    return true;
  }

  public isRunning(jobId: string): boolean {
    return this.runningProcesses.has(jobId);
  }

  private parseStructuredProgress(line: string): DownloadProgress | null {
    try {
      const match = line.match(/\[AGY_PROG\]\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*(.*)$/);
      if (!match) return null;

      const downloadedBytes = parseFloat(match[1]) || 0;
      const totalBytes = parseFloat(match[2]) || 0;
      const rawSpeed = match[3];
      const rawEta = match[4];
      const status = match[5];
      const filename = match[6] ? match[6].trim() : undefined;

      const percent = totalBytes > 0 ? Math.min(100, (downloadedBytes / totalBytes) * 100) : 0;
      const speedBytesPerSec = parseFloat(rawSpeed) || 0;
      const etaSeconds = parseInt(rawEta, 10) || 0;

      return {
        percent: Math.round(percent * 10) / 10,
        downloadedBytes,
        totalBytes,
        speed: this.formatSpeed(speedBytesPerSec),
        speedBytesPerSec,
        eta: this.formatEta(etaSeconds),
        etaSeconds,
        statusText: status === 'finished' ? 'Finalizing' : 'Downloading',
        stage: status === 'finished' ? 'postprocessing' : 'downloading',
        filename: filename && filename !== 'NA' ? filename : undefined
      };
    } catch {
      return null;
    }
  }

  private parseFallbackProgress(line: string): DownloadProgress | null {
    // [download]  45.2% of 120.50MiB at 4.20MiB/s ETA 00:15
    const match = line.match(/\[download\]\s+([\d\.]+)%\s+of\s+~?([\d\.]+[A-Za-z]+)\s+at\s+~?([\d\.]+[A-Za-z]+\/s)\s+ETA\s+(\S+)/);
    if (!match) return null;

    const percent = parseFloat(match[1]) || 0;
    const speed = match[3] || '0 B/s';
    const eta = match[4] || '--:--';

    return {
      percent: Math.round(percent * 10) / 10,
      downloadedBytes: 0,
      totalBytes: 0,
      speed,
      speedBytesPerSec: 0,
      eta,
      etaSeconds: 0,
      statusText: 'Downloading',
      stage: 'downloading'
    };
  }

  private formatSpeed(bytesPerSec: number): string {
    if (!bytesPerSec || isNaN(bytesPerSec)) return '0 B/s';
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let i = 0;
    let v = bytesPerSec;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(1)} ${units[i]}`;
  }

  private formatEta(seconds: number): string {
    if (!seconds || isNaN(seconds) || seconds < 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
