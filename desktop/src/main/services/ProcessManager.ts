import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { DownloadProgress, DownloadStatus } from '../../shared/types';
import { LoggingService } from './LoggingService';
import { YtDlpService } from './YtDlpService';

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

    const wsRoot = YtDlpService.getInstance().getWorkspaceRoot();
    const pythonPath = wsRoot
      ? `${wsRoot};${process.env.PYTHONPATH || ''}`
      : process.env.PYTHONPATH;

    const isScript = cmd.toLowerCase().endsWith('.cmd') || cmd.toLowerCase().endsWith('.bat');
    const child = spawn(cmd, executionArgs, {
      cwd: wsRoot || process.cwd(),
      env: {
        ...process.env,
        ...(pythonPath ? { PYTHONPATH: pythonPath } : {})
      },
      shell: isScript,
      stdio: ['ignore', 'pipe', 'pipe']
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
            if (parsed.filename && !parsed.filename.match(/\.f\d+(?:-\d+)?\./)) {
              detectedOutputPath = parsed.filename;
            } else if (!detectedOutputPath && parsed.filename) {
              detectedOutputPath = parsed.filename;
            }
            callbacks.onProgress(parsed);
          }
          continue;
        }

        // 2. Check fallback standard yt-dlp progress
        if (line.startsWith('[download]')) {
          const fallback = this.parseFallbackProgress(line);
          if (fallback) {
            callbacks.onProgress(fallback);
          }
          // Check for destination filename
          const destMatch = line.match(/\[download\] Destination:\s*(.+)$/i);
          if (destMatch) {
            const candidate = destMatch[1].trim();
            const isIntermediate = /\.f\d+(?:-\d+)?\./i.test(candidate);
            if (!detectedOutputPath || !isIntermediate) {
              detectedOutputPath = candidate;
            }
          }

          // Check if file has already been downloaded
          const alreadyMatch = line.match(/\[download\]\s+(.+?)\s+has already been downloaded/i);
          if (alreadyMatch) {
            detectedOutputPath = alreadyMatch[1].trim();
          }
          continue;
        }

        // 3. Check post-processing stages: Merger, ExtractAudio, Fixup
        const mergerMatch = line.match(/\[Merger\]\s+Merging formats into "([^"]+)"/i) ||
                            line.match(/\[Merger\]\s+Merging formats into\s+(.+)$/i);
        if (mergerMatch) {
          detectedOutputPath = mergerMatch[1].trim();
        }

        const audioMatch = line.match(/\[ExtractAudio\]\s+Destination:\s*(.+)$/i);
        if (audioMatch) {
          detectedOutputPath = audioMatch[1].trim();
        }

        const fixupMatch = line.match(/\[Fixup\w*\]\s+.*?into "([^"]+)"/i) ||
                           line.match(/\[Fixup\w*\]\s+Destination:\s*(.+)$/i);
        if (fixupMatch) {
          detectedOutputPath = fixupMatch[1].trim();
        }

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
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim()) continue;
        callbacks.onLog(`[STDERR] ${line}`);
      }
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
        const finalPath = this.resolveFinalFilePath(detectedOutputPath);
        this.logger.info('download', `Job [${jobId}] completed successfully, path: ${finalPath || 'unknown'}`, jobId);
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
          filename: finalPath
        });
        callbacks.onCompleted(finalPath);
      } else {
        this.logger.error('download', `Job [${jobId}] failed with exit code ${code}`, jobId);
        // Extract meaningful error line if present
        let errMessage = `Download process exited with code ${code}`;
        const errorLine = lastErrorSnippet.split(/\r?\n/).find((l) => l.includes('ERROR:'));
        if (errorLine) {
          errMessage = errorLine.replace(/^ERROR:\s*/, '').trim();
        }
        callbacks.onError(
          errMessage,
          lastErrorSnippet || 'Engine error occurred. Inspect the job logs for details.'
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

  public resolveFinalFilePath(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    try {
      if (fs.existsSync(filePath)) {
        return filePath;
      }

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) return filePath;

      const filename = path.basename(filePath);

      // 1. Strip intermediate stream tokens like .f251-12.webm or .f137.mp4
      const stripped = filename.replace(/\.f\d+(?:-\d+)?(\.[a-z0-9]+)$/i, '$1');
      const strippedPath = path.join(dir, stripped);
      if (fs.existsSync(strippedPath)) {
        return strippedPath;
      }

      // 2. Check other common container extensions with clean base
      const baseWithoutExt = stripped.replace(/\.[a-z0-9]+$/i, '');
      const mediaExts = ['.mp4', '.webm', '.mkv', '.mp3', '.m4a', '.opus', '.wav', '.flac'];
      for (const ext of mediaExts) {
        const candidate = path.join(dir, baseWithoutExt + ext);
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      // 3. Check for bracketed ID match: e.g. [DJmsXSr1jec]
      const idMatch = filename.match(/\[([a-zA-Z0-9_-]{6,15})\]/);
      if (idMatch) {
        const videoId = idMatch[1].toLowerCase();
        const files = fs.readdirSync(dir);
        const match = files.find(
          (f) =>
            f.toLowerCase().includes(`[${videoId}]`) &&
            !f.match(/\.f\d+(?:-\d+)?\./i) &&
            !f.endsWith('.part') &&
            !f.endsWith('.ytdl')
        );
        if (match) {
          return path.join(dir, match);
        }
      }
    } catch {
      // Return original on error
    }
    return filePath;
  }
}

