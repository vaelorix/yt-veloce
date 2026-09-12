import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { LoggingService } from './LoggingService';
import { YtDlpService } from './YtDlpService';
import { FFmpegService } from './FFmpegService';
import { DependencyItem } from '../../shared/types';

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

    // 1. Python check
    let pythonVersion: string | null = null;
    let pythonPath: string | null = null;
    try {
      const out = await this.probeCommand('python', ['--version']);
      if (out) {
        pythonVersion = out.trim();
        pythonPath = 'System PATH';
      }
    } catch {}

    // 2. AtomicParsley check
    let apVersion: string | null = null;
    let apPath: string | null = null;
    try {
      const out = await this.probeCommand('AtomicParsley', ['--version']);
      if (out) {
        apVersion = out.trim().split('\n')[0];
        apPath = 'System PATH';
      }
    } catch {}

    // 3. Aria2c check
    let ariaVersion: string | null = null;
    let ariaPath: string | null = null;
    try {
      const out = await this.probeCommand('aria2c', ['--version']);
      if (out) {
        const match = out.match(/aria2 version\s+([^\s]+)/i);
        ariaVersion = match ? match[1] : 'installed';
        ariaPath = 'System PATH';
      }
    } catch {}

    return [
      {
        id: 'ytdlp',
        name: 'yt-dlp Core Engine',
        description: 'Primary audio/video downloader, stream extractor, and playlist parser.',
        category: 'core',
        status: ytdlp.source !== 'none' ? 'installed' : 'missing',
        version: ytdlp.version,
        path: ytdlp.path,
        requiredFor: 'All media downloading, format exploration, and URL metadata analysis.'
      },
      {
        id: 'ffmpeg',
        name: 'FFmpeg Audio & Video Processor',
        description: 'Cross-platform multimedia framework for audio/video stream muxing and format conversion.',
        category: 'media',
        status: ffmpeg.available ? 'installed' : 'missing',
        version: ffmpeg.version,
        path: ffmpeg.path,
        requiredFor: 'Merging separate 1080p/4K video + audio streams, MP3 conversion, and thumbnail embedding.'
      },
      {
        id: 'ffprobe',
        name: 'FFprobe Stream Analyzer',
        description: 'Multimedia stream analyzer for probing container bitrates, codecs, and layouts.',
        category: 'media',
        status: ffmpeg.ffprobeAvailable ? 'installed' : 'missing',
        version: ffmpeg.version,
        path: ffmpeg.path ? ffmpeg.path.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1') : null,
        requiredFor: 'Container verification, format probing, and codec inspection.'
      },
      {
        id: 'python',
        name: 'Python 3 Runtime',
        description: 'Underlying execution environment for Python-based media utilities.',
        category: 'runtime',
        status: pythonVersion ? 'installed' : 'missing',
        version: pythonVersion,
        path: pythonPath,
        requiredFor: 'Running the Python yt-dlp backend engine.'
      },
      {
        id: 'atomicparsley',
        name: 'AtomicParsley (Optional)',
        description: 'Specialized command line tool for reading, parsing, and embedding MP4/M4A metadata & cover art.',
        category: 'media',
        status: apVersion ? 'installed' : 'missing',
        version: apVersion,
        path: apPath,
        requiredFor: 'High-fidelity MP4 and M4A tag & cover art embedding.'
      },
      {
        id: 'aria2',
        name: 'Aria2c Accelerator (Optional)',
        description: 'Ultra-fast multi-protocol & multi-connection download utility for accelerating transfers.',
        category: 'accelerator',
        status: ariaVersion ? 'installed' : 'missing',
        version: ariaVersion,
        path: ariaPath,
        requiredFor: 'Multi-threaded accelerated connection downloads (--external-downloader aria2c).'
      }
    ];
  }

  public async install(dependencyId: string): Promise<{ success: boolean; message: string }> {
    if (dependencyId === 'all') {
      return this.installAllMissing();
    }

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
      } else if (dependencyId === 'atomicparsley') {
        return await this.installAtomicParsley();
      } else if (dependencyId === 'aria2') {
        return await this.installAria2();
      }
      return { success: false, message: `Unknown dependency: ${dependencyId}` };
    } finally {
      this.installing.set(dependencyId, false);
    }
  }

  public async installAllMissing(): Promise<{ success: boolean; message: string }> {
    this.logger.info('system', 'Starting automated installation of all missing dependencies...');
    const status = await this.getStatus();
    const missing = status.filter((s) => s.status === 'missing' && s.id !== 'python');

    if (missing.length === 0) {
      return { success: true, message: 'All dependencies are already installed and verified!' };
    }

    const results: string[] = [];
    for (const item of missing) {
      try {
        const res = await this.install(item.id);
        results.push(`${item.name}: ${res.success ? 'Success' : 'Failed'}`);
      } catch (err: any) {
        results.push(`${item.name}: ${err.message}`);
      }
    }

    return {
      success: true,
      message: `Completed dependency install: ${results.join(', ')}`
    };
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
      this.logger.info('yt-dlp', 'Installing/updating yt-dlp via python pip...');
      const proc = spawn('python', ['-m', 'pip', 'install', '--upgrade', 'yt-dlp'], { shell: true });

      proc.on('close', async (code) => {
        const ytdlp = await YtDlpService.getInstance().detect();
        if (ytdlp.source !== 'none') {
          this.logger.info('yt-dlp', `yt-dlp is now available: ${ytdlp.version} (${ytdlp.path})`);
          resolve({ success: true, message: `yt-dlp successfully installed/updated to ${ytdlp.version}` });
        } else {
          resolve({ success: false, message: `pip exited with code ${code}` });
        }
      });

      proc.on('error', (err) => {
        resolve({ success: false, message: `Failed to launch pip: ${err.message}` });
      });
    });
  }

  private async installAtomicParsley(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this.logger.info('system', 'Installing AtomicParsley via winget...');
      const proc = spawn(
        'winget',
        ['install', '--id', 'wez.atomicparsley', '-e', '--accept-source-agreements', '--accept-package-agreements'],
        { shell: true }
      );

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          message: code === 0 ? 'AtomicParsley installed successfully.' : `winget exited with code ${code}`
        });
      });

      proc.on('error', (err) => {
        resolve({ success: false, message: `Failed to launch winget: ${err.message}` });
      });
    });
  }

  private async installAria2(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this.logger.info('system', 'Installing Aria2 via winget...');
      const proc = spawn(
        'winget',
        ['install', '--id', 'aria2.aria2', '-e', '--accept-source-agreements', '--accept-package-agreements'],
        { shell: true }
      );

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          message: code === 0 ? 'Aria2 installed successfully.' : `winget exited with code ${code}`
        });
      });

      proc.on('error', (err) => {
        resolve({ success: false, message: `Failed to launch winget: ${err.message}` });
      });
    });
  }

  private probeCommand(cmd: string, args: string[], timeoutMs = 2500): Promise<string> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const child = spawn(cmd, args, { shell: process.platform === 'win32' });
      let out = '';

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          try { child.kill(); } catch {}
          reject(new Error('Timeout'));
        }
      }, timeoutMs);

      child.stdout?.on('data', (d) => { out += d.toString(); });
      child.stderr?.on('data', (d) => { out += d.toString(); });

      child.on('error', (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      });

      child.on('close', (code) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          if (code === 0 && out.trim()) resolve(out.trim());
          else reject(new Error(`Exit code ${code}`));
        }
      });
    });
  }
}
