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

  public findExecutable(toolName: string): string | null {
    const isWin = process.platform === 'win32';
    const exeName = isWin ? `${toolName}.exe` : toolName;

    // 1. Check WinGet Packages directory
    const localAppData = process.env.LOCALAPPDATA || '';
    if (localAppData && isWin) {
      const wingetPackages = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(wingetPackages)) {
        try {
          const dirs = fs.readdirSync(wingetPackages);
          for (const dir of dirs) {
            if (dir.toLowerCase().includes(toolName.toLowerCase())) {
              const packageDir = path.join(wingetPackages, dir);
              const found = this.searchExecutableRecursive(packageDir, toolName, 2);
              if (found) return found;
            }
          }
        } catch {}
      }

      // Check WinGet Links
      const wingetLinks = path.join(localAppData, 'Microsoft', 'WinGet', 'Links');
      if (fs.existsSync(wingetLinks)) {
        const candidate = path.join(wingetLinks, exeName);
        if (fs.existsSync(candidate)) return candidate;
      }
    }

    // 2. Check standard installation folders
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const userProfile = process.env.USERPROFILE || '';
    const candidates = [
      path.join(programFiles, toolName, exeName),
      path.join(programFilesX86, toolName, exeName),
      path.join(localAppData, 'Programs', toolName, exeName),
      path.join(userProfile, 'scoop', 'apps', toolName, 'current', exeName),
      path.join(process.env.ChocolateyInstall || 'C:\\ProgramData\\chocolatey', 'bin', exeName)
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }

    return null;
  }

  private searchExecutableRecursive(dir: string, toolName: string, maxDepth: number): string | null {
    if (maxDepth < 0) return null;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const nameLower = entry.name.toLowerCase();
        if (
          entry.isFile() &&
          nameLower.startsWith(toolName.toLowerCase()) &&
          (nameLower.endsWith('.exe') || !nameLower.includes('.'))
        ) {
          return full;
        } else if (entry.isDirectory()) {
          const res = this.searchExecutableRecursive(full, toolName, maxDepth - 1);
          if (res) return res;
        }
      }
    } catch {}
    return null;
  }

  private ensureDirInPath(exePath: string): void {
    if (!exePath || !path.isAbsolute(exePath)) return;
    const dir = path.dirname(exePath);
    if (process.env.PATH && !process.env.PATH.includes(dir)) {
      process.env.PATH = `${dir};${process.env.PATH}`;
      this.logger.info('system', `Appended ${dir} to active PATH`);
    }
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
    const apExe = this.findExecutable('AtomicParsley') || 'AtomicParsley';
    try {
      const out = await this.probeCommand(apExe, ['-v']);
      if (out) {
        const match = out.match(/AtomicParsley version:\s*([^\s]+)/i);
        apVersion = match ? match[1] : out.trim().split('\n')[0];
        apPath = path.isAbsolute(apExe) ? apExe : 'System PATH';
        this.ensureDirInPath(apExe);
      }
    } catch {
      try {
        const out = await this.probeCommand(apExe, ['--version']);
        if (out) {
          apVersion = out.trim().split('\n')[0];
          apPath = path.isAbsolute(apExe) ? apExe : 'System PATH';
          this.ensureDirInPath(apExe);
        }
      } catch {}
    }

    // 3. Aria2c check
    let ariaVersion: string | null = null;
    let ariaPath: string | null = null;
    const ariaExe = this.findExecutable('aria2c') || this.findExecutable('aria2') || 'aria2c';
    try {
      const out = await this.probeCommand(ariaExe, ['-v']);
      if (out) {
        const match = out.match(/aria2 version\s+([^\s]+)/i);
        ariaVersion = match ? match[1] : 'installed';
        ariaPath = path.isAbsolute(ariaExe) ? ariaExe : 'System PATH';
        this.ensureDirInPath(ariaExe);
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
    const existing = await FFmpegService.getInstance().detect();
    if (existing.available) {
      return { success: true, message: `FFmpeg already installed (${existing.version})` };
    }

    return new Promise((resolve) => {
      this.logger.info('ffmpeg', 'Attempting installation of FFmpeg via Windows Package Manager (winget)...');

      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { proc.kill('SIGTERM'); } catch {}
          resolve({ success: false, message: 'FFmpeg installation timed out.' });
        }
      }, 45000);

      const proc = spawn(
        'winget',
        ['install', '--id', 'Gyan.FFmpeg', '-e', '--accept-source-agreements', '--accept-package-agreements', '--disable-interactivity', '--silent'],
        { shell: true, stdio: ['ignore', 'pipe', 'pipe'] }
      );

      proc.on('close', async (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const info = await FFmpegService.getInstance().detect();
          if (info.available) {
            resolve({ success: true, message: `FFmpeg successfully installed (${info.version})` });
          } else {
            resolve({
              success: code === 0,
              message: code === 0 ? 'FFmpeg installed.' : `winget returned exit code ${code}`
            });
          }
        }
      });

      proc.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({ success: false, message: `Failed to launch installer: ${err.message}` });
        }
      });
    });
  }

  private async installYtDlp(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this.logger.info('yt-dlp', 'Installing/updating yt-dlp via python pip...');
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { proc.kill('SIGTERM'); } catch {}
          resolve({ success: false, message: 'yt-dlp install timed out.' });
        }
      }, 45000);

      const proc = spawn('python', ['-m', 'pip', 'install', '--upgrade', 'yt-dlp'], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      proc.on('close', async (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const ytdlp = await YtDlpService.getInstance().detect();
          if (ytdlp.source !== 'none') {
            resolve({ success: true, message: `yt-dlp successfully installed/updated to ${ytdlp.version}` });
          } else {
            resolve({ success: false, message: `pip exited with code ${code}` });
          }
        }
      });

      proc.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({ success: false, message: `Failed to launch pip: ${err.message}` });
        }
      });
    });
  }

  private async installAtomicParsley(): Promise<{ success: boolean; message: string }> {
    const existing = this.findExecutable('AtomicParsley');
    if (existing) {
      this.ensureDirInPath(existing);
      return { success: true, message: 'AtomicParsley already installed and verified.' };
    }

    return new Promise((resolve) => {
      this.logger.info('system', 'Installing AtomicParsley via winget...');
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { proc.kill('SIGTERM'); } catch {}
          resolve({ success: false, message: 'AtomicParsley installation timed out.' });
        }
      }, 40000);

      const proc = spawn(
        'winget',
        ['install', '--id', 'wez.atomicparsley', '-e', '--accept-source-agreements', '--accept-package-agreements', '--disable-interactivity', '--silent'],
        { shell: true, stdio: ['ignore', 'pipe', 'pipe'] }
      );

      proc.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const found = this.findExecutable('AtomicParsley');
          if (found) {
            this.ensureDirInPath(found);
            resolve({ success: true, message: 'AtomicParsley installed successfully.' });
          } else {
            resolve({
              success: code === 0,
              message: code === 0 ? 'AtomicParsley installed successfully.' : `winget exited with code ${code}`
            });
          }
        }
      });

      proc.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({ success: false, message: `Failed to launch winget: ${err.message}` });
        }
      });
    });
  }

  private async installAria2(): Promise<{ success: boolean; message: string }> {
    const existing = this.findExecutable('aria2c') || this.findExecutable('aria2');
    if (existing) {
      this.ensureDirInPath(existing);
      return { success: true, message: 'Aria2c already installed and verified.' };
    }

    return new Promise((resolve) => {
      this.logger.info('system', 'Installing Aria2 via winget...');
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { proc.kill('SIGTERM'); } catch {}
          resolve({ success: false, message: 'Aria2 installation timed out.' });
        }
      }, 40000);

      const proc = spawn(
        'winget',
        ['install', '--id', 'aria2.aria2', '-e', '--accept-source-agreements', '--accept-package-agreements', '--disable-interactivity', '--silent'],
        { shell: true, stdio: ['ignore', 'pipe', 'pipe'] }
      );

      proc.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const found = this.findExecutable('aria2c') || this.findExecutable('aria2');
          if (found) {
            this.ensureDirInPath(found);
            resolve({ success: true, message: 'Aria2 installed successfully.' });
          } else {
            resolve({
              success: code === 0,
              message: code === 0 ? 'Aria2 installed successfully.' : `winget exited with code ${code}`
            });
          }
        }
      });

      proc.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({ success: false, message: `Failed to launch winget: ${err.message}` });
        }
      });
    });
  }

  private probeCommand(cmd: string, args: string[], timeoutMs = 2500): Promise<string> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const child = spawn(cmd, args, { shell: process.platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
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
