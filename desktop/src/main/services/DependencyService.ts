import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { LoggingService } from './LoggingService';
import { YtDlpService } from './YtDlpService';
import { FFmpegService } from './FFmpegService';

export interface DependencyItem {
  id: 'ytdlp' | 'ffmpeg' | 'ffprobe' | 'python';
  name: string;
  description: string;
  category: 'core' | 'media' | 'runtime';
  status: 'installed' | 'missing' | 'installing' | 'error';
  version: string | null;
  path: string | null;
  requiredFor: string;
}

export class DependencyService {
  private static instance: DependencyService;
  private logger = LoggingService.getInstance();
  private installing: Map<string, boolean> = new Map();

  private constructor() {}

  public static getInstance(): DependencyService {
    if (!DependencyService.instance) {
      DependencyService.instance = new DependencyService();
    }
    return DependencyService.instance;
  }

  public async getStatus(): Promise<DependencyItem[]> {
    const ytdlp = await YtDlpService.getInstance().detect();
    const ffmpeg = await FFmpegService.getInstance().detect();

    // Check python
    let pythonVersion: string | null = null;
    let pythonPath: string | null = null;
    try {
      const child = spawn('python', ['--version'], { shell: process.platform === 'win32' });
      let out = '';
      child.stdout?.on('data', (d) => { out += d.toString(); });
      child.stderr?.on('data', (d) => { out += d.toString(); });
      await new Promise((res) => child.on('close', res));
      if (out) {
        pythonVersion = out.trim();
        pythonPath = 'System PATH';
      }
    } catch {
      // Python check failed
    }

    return [
      {
        id: 'ytdlp',
        name: 'yt-dlp Core Engine',
        description: 'Command-line audio/video downloader and platform metadata extractor.',
        category: 'core',
        status: ytdlp.source !== 'none' ? 'installed' : 'missing',
        version: ytdlp.version,
        path: ytdlp.path,
        requiredFor: 'All downloading, formats discovery, and playlist extraction.'
      },
      {
        id: 'ffmpeg',
        name: 'FFmpeg Audio & Video Processor',
        description: 'Complete cross-platform multimedia framework for format conversion and stream merging.',
        category: 'media',
        status: ffmpeg.available ? 'installed' : 'missing',
        version: ffmpeg.version,
        path: ffmpeg.path,
        requiredFor: 'Merging 1080p/4K video + audio streams, MP3 conversion, and thumbnail embedding.'
      },
      {
        id: 'ffprobe',
        name: 'FFprobe Stream Analyzer',
        description: 'Multimedia stream analyzer for probing bitrates, codecs, and audio channel layouts.',
        category: 'media',
        status: ffmpeg.ffprobeAvailable ? 'installed' : 'missing',
        version: ffmpeg.version,
        path: ffmpeg.path ? ffmpeg.path.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1') : null,
        requiredFor: 'Deep stream verification and container format checking.'
      },
      {
        id: 'python',
        name: 'Python 3 Runtime',
        description: 'Underlying scripting execution environment for yt-dlp execution.',
        category: 'runtime',
        status: pythonVersion ? 'installed' : 'missing',
        version: pythonVersion,
        path: pythonPath,
        requiredFor: 'Executing the Python yt-dlp backend engine.'
      }
    ];
  }

  public async install(dependencyId: string): Promise<{ success: boolean; message: string }> {
    if (this.installing.get(dependencyId)) {
      return { success: false, message: 'Installation is already in progress.' };
    }

    this.installing.set(dependencyId, true);
    this.logger.info('system', `Initiating automated installation for ${dependencyId}...`);

    try {
      if (dependencyId === 'ffmpeg') {
        return await this.installFFmpeg();
      } else if (dependencyId === 'ytdlp') {
        return await this.installYtDlp();
      }
      return { success: false, message: `Unknown dependency: ${dependencyId}` };
    } finally {
      this.installing.set(dependencyId, false);
    }
  }

  private async installFFmpeg(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this.logger.info('ffmpeg', 'Attempting installation of FFmpeg via Windows Package Manager (winget)...');

      const proc = spawn(
        'winget',
        ['install', '--id', 'Gyan.FFmpeg', '-e', '--accept-source-agreements', '--accept-package-agreements'],
        { shell: true }
      );

      let output = '';
      proc.stdout?.on('data', (d) => {
        const text = d.toString();
        output += text;
        this.logger.info('ffmpeg', text.trim());
      });

      proc.stderr?.on('data', (d) => {
        const text = d.toString();
        output += text;
        this.logger.warn('ffmpeg', text.trim());
      });

      proc.on('close', async (code) => {
        const info = await FFmpegService.getInstance().detect();
        if (info.available) {
          this.logger.info('ffmpeg', `FFmpeg installed and verified successfully: ${info.version}`);
          resolve({ success: true, message: `FFmpeg successfully installed (${info.version})` });
        } else if (code === 0) {
          resolve({
            success: true,
            message: 'FFmpeg installed. You may need to restart the application for system PATH to refresh.'
          });
        } else {
          resolve({
            success: false,
            message: `winget returned exit code ${code}. Please verify winget or place ffmpeg in system PATH.`
          });
        }
      });

      proc.on('error', (err) => {
        resolve({ success: false, message: `Failed to launch installer: ${err.message}` });
      });
    });
  }

  private async installYtDlp(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this.logger.info('yt-dlp', 'Updating yt-dlp via python pip...');
      const proc = spawn('python', ['-m', 'pip', 'install', '-U', 'yt-dlp'], { shell: true });

      proc.on('close', async (code) => {
        const ytdlp = await YtDlpService.getInstance().detect();
        if (code === 0 && ytdlp.source !== 'none') {
          resolve({ success: true, message: `yt-dlp updated to ${ytdlp.version}` });
        } else {
          resolve({ success: false, message: `pip exited with code ${code}` });
        }
      });
    });
  }
}
