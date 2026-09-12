import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
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
    const info: FFmpegInfo = {
      available: false,
      version: null,
      path: null,
      ffprobeAvailable: false
    };

    const candidates = this.getCandidatePaths(customPath);

    for (const candidate of candidates) {
      try {
        const versionOutput = await this.runCommand(candidate, ['-version']);
        if (versionOutput) {
          info.available = true;
          info.path = candidate;
          const match = versionOutput.match(/ffmpeg version\s+([^\s]+)/i);
          info.version = match ? match[1] : 'detected';
          this.logger.info('ffmpeg', `FFmpeg detected: ${info.version} at ${candidate}`);

          // Also check ffprobe in the same directory or candidate
          const ffprobeCandidate = candidate === 'ffmpeg'
            ? 'ffprobe'
            : candidate.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');

          try {
            const probeOut = await this.runCommand(ffprobeCandidate, ['-version']);
            if (probeOut) {
              info.ffprobeAvailable = true;
            }
          } catch {
            // ffprobe check failed
          }

          this.cachedInfo = info;
          return info;
        }
      } catch {
        // try next candidate
      }
    }

    this.cachedInfo = info;
    return info;
  }

  private getCandidatePaths(customPath?: string): string[] {
    const list: string[] = [];

    if (customPath && customPath.trim().length > 0) {
      list.push(customPath.trim());
    }

    // Default system PATH
    list.push('ffmpeg');

    if (process.platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA || '';
      const userProfile = process.env.USERPROFILE || '';
      const programFiles = process.env.ProgramFiles || 'C:\\Program Files';

      if (localAppData) {
        // Winget Links and WindowsApps aliases
        list.push(path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'));
        list.push(path.join(localAppData, 'Microsoft', 'WindowsApps', 'ffmpeg.exe'));

        // WinGet Packages directory search for Gyan.FFmpeg
        const wingetPackages = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
        if (fs.existsSync(wingetPackages)) {
          try {
            const dirs = fs.readdirSync(wingetPackages);
            for (const d of dirs) {
              if (d.toLowerCase().includes('ffmpeg')) {
                const packageDir = path.join(wingetPackages, d);
                if (fs.existsSync(path.join(packageDir, 'bin', 'ffmpeg.exe'))) {
                  list.push(path.join(packageDir, 'bin', 'ffmpeg.exe'));
                }
                const subDirs = fs.readdirSync(packageDir);
                for (const sub of subDirs) {
                  const nestedBin = path.join(packageDir, sub, 'bin', 'ffmpeg.exe');
                  if (fs.existsSync(nestedBin)) {
                    list.push(nestedBin);
                  }
                }
              }
            }
          } catch {
            // Ignore readdir errors
          }
        }
      }

      // Standard installation locations
      list.push(path.join(programFiles, 'ffmpeg', 'bin', 'ffmpeg.exe'));
      list.push('C:\\ffmpeg\\bin\\ffmpeg.exe');
      list.push('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe');

      if (userProfile) {
        list.push(path.join(userProfile, 'scoop', 'shims', 'ffmpeg.exe'));
      }
    }

    return Array.from(new Set(list));
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

      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });

      child.on('error', (err) => reject(err));
      child.on('close', (code) => {
        if (code === 0) resolve(stdout || stderr);
        else reject(new Error(`Exit code ${code}: ${stderr}`));
      });
    });
  }
}
