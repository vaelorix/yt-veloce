import { spawn } from 'child_process';
import { LoggingService } from './LoggingService';

export interface FFmpegInfo {
  available: boolean;
  version: string | null;
  path: string | null;
  ffprobeAvailable: boolean;
}

export class FFmpegService {
  private static instance: FFmpegService;
  private logger = LoggingService.getInstance();
  private cachedInfo: FFmpegInfo | null = null;

  private constructor() {}

  public static getInstance(): FFmpegService {
    if (!FFmpegService.instance) {
      FFmpegService.instance = new FFmpegService();
    }
    return FFmpegService.instance;
  }

  public async detect(customPath?: string): Promise<FFmpegInfo> {
    const binary = customPath && customPath.trim().length > 0 ? customPath.trim() : 'ffmpeg';
    const info: FFmpegInfo = {
      available: false,
      version: null,
      path: null,
      ffprobeAvailable: false
    };

    try {
      const versionOutput = await this.runCommand(binary, ['-version']);
      if (versionOutput) {
        info.available = true;
        info.path = binary;
        const match = versionOutput.match(/ffmpeg version\s+([^\s]+)/i);
        info.version = match ? match[1] : 'detected';
        this.logger.info('ffmpeg', `FFmpeg detected: ${info.version} at ${binary}`);
      }
    } catch {
      // FFmpeg not found or failed
    }

    try {
      const ffprobeBinary = customPath ? customPath.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1') : 'ffprobe';
      const ffprobeOutput = await this.runCommand(ffprobeBinary, ['-version']);
      if (ffprobeOutput) {
        info.ffprobeAvailable = true;
      }
    } catch {
      // FFprobe not found
    }

    this.cachedInfo = info;
    return info;
  }

  public getCachedInfo(): FFmpegInfo {
    return this.cachedInfo || {
      available: false,
      version: null,
      path: null,
      ffprobeAvailable: false
    };
  }

  private runCommand(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { shell: process.platform === 'win32' });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('error', (err) => reject(err));
      child.on('close', (code) => {
        if (code === 0) resolve(stdout || stderr);
        else reject(new Error(`Exit code ${code}: ${stderr}`));
      });
    });
  }
}
