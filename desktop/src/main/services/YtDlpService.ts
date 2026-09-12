import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { EngineStatus, VideoMetadata, FormatItem, SubtitleTrack, ChapterItem } from '../../shared/types';
import { LoggingService } from './LoggingService';

export interface YtDlpExecutable {
  cmd: string;
  argsPrefix: string[];
  source: 'workspace' | 'system' | 'custom' | 'none';
  version: string | null;
  path: string | null;
}

export class YtDlpService {
  private static instance: YtDlpService;
  private logger = LoggingService.getInstance();
  private executable: YtDlpExecutable | null = null;
  private workspaceRoot: string | null = null;

  private constructor() {}

  public static getInstance(): YtDlpService {
    if (!YtDlpService.instance) {
      YtDlpService.instance = new YtDlpService();
    }
    return YtDlpService.instance;
  }

  public getWorkspaceRoot(): string | null {
    return this.workspaceRoot;
  }

  public async detect(customPath?: string): Promise<YtDlpExecutable> {
    // 1. Locate workspace root
    let wsRoot: string | null = null;
    const candidateDirs = [process.cwd(), __dirname];
    for (const startDir of candidateDirs) {
      let current = startDir;
      for (let i = 0; i < 6; i++) {
        if (
          fs.existsSync(path.join(current, 'yt-dlp.cmd')) ||
          fs.existsSync(path.join(current, 'yt_dlp')) ||
          fs.existsSync(path.join(current, 'desktop'))
        ) {
          wsRoot = current;
          break;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
      }
      if (wsRoot) break;
    }
    this.workspaceRoot = wsRoot;

    // 2. Check custom path if supplied
    if (customPath && customPath.trim().length > 0) {
      const trimmed = customPath.trim();
      const ver = await this.testBinary(trimmed, ['--version']);
      if (ver) {
        this.executable = {
          cmd: trimmed,
          argsPrefix: [],
          source: 'custom',
          version: ver,
          path: trimmed
        };
        this.logger.info('yt-dlp', `Using custom yt-dlp binary: ${trimmed} (${ver})`);
        return this.executable;
      }
    }

    // 3. Check standalone binary candidate locations
    const standaloneCandidates = this.getStandaloneBinaryCandidates();
    for (const candidate of standaloneCandidates) {
      try {
        if (path.isAbsolute(candidate) && !fs.existsSync(candidate)) continue;
        const ver = await this.testBinary(candidate, ['--version']);
        if (ver) {
          this.executable = {
            cmd: candidate,
            argsPrefix: [],
            source: 'system',
            version: ver,
            path: candidate
          };
          this.logger.info('yt-dlp', `Detected standalone yt-dlp binary (${ver}) at ${candidate}`);
          return this.executable;
        }
      } catch {
        // continue
      }
    }

    // 4. Check python -m yt_dlp
    try {
      const pyVer = await this.testBinary('python', ['-m', 'yt_dlp', '--version'], this.workspaceRoot || undefined);
      if (pyVer) {
        this.executable = {
          cmd: 'python',
          argsPrefix: ['-m', 'yt_dlp'],
          source: 'system',
          version: pyVer,
          path: 'python -m yt_dlp'
        };
        this.logger.info('yt-dlp', `Detected Python yt-dlp module (${pyVer})`);
        return this.executable;
      }
    } catch {
      // continue
    }

    // 5. Check local workspace Python module directly
    if (this.workspaceRoot) {
      const localCmd = path.join(this.workspaceRoot, 'yt-dlp.cmd');
      const localPyModule = path.join(this.workspaceRoot, 'yt_dlp');

      if (process.platform === 'win32' && fs.existsSync(localCmd)) {
        const ver = await this.testBinary(localCmd, ['--version'], this.workspaceRoot);
        if (ver) {
          this.executable = {
            cmd: localCmd,
            argsPrefix: [],
            source: 'workspace',
            version: ver,
            path: localCmd
          };
          this.logger.info('yt-dlp', `Detected workspace yt-dlp (${ver}) at ${localCmd}`);
          return this.executable;
        }
      }

      if (fs.existsSync(localPyModule)) {
        const ver = await this.testBinary('python', ['-m', 'yt_dlp', '--version'], this.workspaceRoot);
        if (ver) {
          this.executable = {
            cmd: 'python',
            argsPrefix: ['-m', 'yt_dlp'],
            source: 'workspace',
            version: ver,
            path: localPyModule
          };
          this.logger.info('yt-dlp', `Detected workspace Python yt-dlp module (${ver})`);
          return this.executable;
        }
      }
    }

    // 6. Not found
    this.executable = {
      cmd: '',
      argsPrefix: [],
      source: 'none',
      version: null,
      path: null
    };
    this.logger.warn('yt-dlp', 'No working yt-dlp executable found.');
    return this.executable;
  }

  private getStandaloneBinaryCandidates(): string[] {
    const list: string[] = ['yt-dlp'];

    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || '';
      const localAppData = process.env.LOCALAPPDATA || '';
      const userProfile = process.env.USERPROFILE || '';

      // Python Scripts folders in Roaming
      if (appData) {
        const pyRoaming = path.join(appData, 'Python');
        if (fs.existsSync(pyRoaming)) {
          try {
            const dirs = fs.readdirSync(pyRoaming);
            for (const d of dirs) {
              const bin = path.join(pyRoaming, d, 'Scripts', 'yt-dlp.exe');
              if (fs.existsSync(bin)) list.push(bin);
            }
          } catch {}
        }
      }

      // Python Scripts folders in LocalAppData
      if (localAppData) {
        const pyLocal = path.join(localAppData, 'Programs', 'Python');
        if (fs.existsSync(pyLocal)) {
          try {
            const dirs = fs.readdirSync(pyLocal);
            for (const d of dirs) {
              const bin = path.join(pyLocal, d, 'Scripts', 'yt-dlp.exe');
              if (fs.existsSync(bin)) list.push(bin);
            }
          } catch {}
        }
        list.push(path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'yt-dlp.exe'));
        list.push(path.join(localAppData, 'Microsoft', 'WindowsApps', 'yt-dlp.exe'));
      }

      if (userProfile) {
        list.push(path.join(userProfile, 'scoop', 'shims', 'yt-dlp.exe'));
      }
    }

    // Filter so existing absolute paths are tried first
    const existing = list.filter((p) => path.isAbsolute(p) && fs.existsSync(p));
    const others = list.filter((p) => !path.isAbsolute(p) || !fs.existsSync(p));

    return Array.from(new Set([...existing, ...others]));
  }

  public getExecutable(): YtDlpExecutable {
    return this.executable || {
      cmd: '',
      argsPrefix: [],
      source: 'none',
      version: null,
      path: null
    };
  }

  private testBinary(cmd: string, args: string[], cwd?: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const targetCwd = cwd || this.workspaceRoot || process.cwd();
        const pythonPath = this.workspaceRoot
          ? `${this.workspaceRoot};${process.env.PYTHONPATH || ''}`
          : process.env.PYTHONPATH;

        const child = spawn(cmd, args, {
          cwd: targetCwd,
          env: {
            ...process.env,
            ...(pythonPath ? { PYTHONPATH: pythonPath } : {})
          },
          shell: process.platform === 'win32'
        });

        let stdout = '';
        child.stdout?.on('data', (d) => { stdout += d.toString(); });
        child.on('error', () => resolve(null));
        child.on('close', (code) => {
          if (code === 0 && stdout.trim()) {
            resolve(stdout.trim().split('\n')[0].trim());
          } else {
            resolve(null);
          }
        });
      } catch {
        resolve(null);
      }
    });
  }

  public async analyzeUrl(url: string): Promise<VideoMetadata> {
    if (!this.executable || this.executable.source === 'none') {
      await this.detect();
      if (!this.executable || this.executable.source === 'none') {
        throw new Error('yt-dlp is not installed or available. Please install it in Dependencies.');
      }
    }

    const { cmd, argsPrefix } = this.executable;
    const cleanUrl = url.trim();

    const args = [
      ...argsPrefix,
      '--dump-single-json',
      '--no-warnings',
      '--no-check-certificates',
      '--skip-download',
      cleanUrl
    ];

    this.logger.info('yt-dlp', `Analyzing URL: ${cleanUrl}`);

    return new Promise((resolve, reject) => {
      const targetCwd = this.workspaceRoot || process.cwd();
      const pythonPath = this.workspaceRoot
        ? `${this.workspaceRoot};${process.env.PYTHONPATH || ''}`
        : process.env.PYTHONPATH;

      const child = spawn(cmd, args, {
        cwd: targetCwd,
        env: {
          ...process.env,
          ...(pythonPath ? { PYTHONPATH: pythonPath } : {})
        },
        shell: process.platform === 'win32'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => {
        this.logger.error('yt-dlp', `Analysis spawn error: ${err.message}`);
        reject(new Error(`Failed to execute yt-dlp: ${err.message}`));
      });

      child.on('close', (code) => {
        if (code !== 0) {
          const errText = stderr.trim();
          this.logger.error('yt-dlp', `Analysis failed with code ${code}: ${errText}`);
          if (errText.includes('is not a valid URL')) {
            return reject(new Error('The entered text is not a valid URL. Please enter a valid media link (e.g. YouTube, Vimeo, Twitter/X).'));
          }
          return reject(new Error(errText || `Analysis process exited with code ${code}`));
        }

        try {
          const firstBrace = stdout.indexOf('{');
          const lastBrace = stdout.lastIndexOf('}');
          if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('No valid JSON output produced by yt-dlp');
          }
          const jsonStr = stdout.slice(firstBrace, lastBrace + 1);
          const raw = JSON.parse(jsonStr);
          const metadata = this.normalizeMetadata(raw, cleanUrl);
          this.logger.info('yt-dlp', `Successfully analyzed "${metadata.title}" (${metadata.formats.length} formats found)`);
          resolve(metadata);
        } catch (err: any) {
          this.logger.error('yt-dlp', `Failed to parse metadata JSON: ${err.message}`);
          reject(new Error(`Failed to parse video info: ${err.message}`));
        }
      });
    });
  }

  private normalizeMetadata(raw: any, fallbackUrl: string): VideoMetadata {
    const rawFormats: any[] = raw.formats || [];
    const formats: FormatItem[] = rawFormats.map((f: any) => {
      const vcodec = f.vcodec && f.vcodec !== 'none' ? f.vcodec : 'none';
      const acodec = f.acodec && f.acodec !== 'none' ? f.acodec : 'none';
      const hasVideo = vcodec !== 'none';
      const hasAudio = acodec !== 'none';

      let resolution = f.resolution || '';
      if (!resolution && f.width && f.height) {
        resolution = `${f.width}x${f.height}`;
      }
      if (!resolution) {
        resolution = hasVideo ? (f.format_note || 'Video') : 'Audio only';
      }

      return {
        formatId: String(f.format_id),
        formatNote: f.format_note,
        ext: f.ext || 'unknown',
        resolution,
        width: f.width || null,
        height: f.height || null,
        fps: f.fps || null,
        vcodec,
        acodec,
        vbr: f.vbr || null,
        abr: f.abr || null,
        tbr: f.tbr || null,
        filesize: f.filesize || null,
        filesizeApprox: f.filesize_approx || null,
        dynamicRange: f.dynamic_range || null,
        audioChannels: f.audio_channels || null,
        language: f.language || null,
        protocol: f.protocol || undefined,
        container: f.container || f.ext || undefined,
        hasVideo,
        hasAudio
      };
    });

    // Extract subtitles
    const subtitles: SubtitleTrack[] = [];
    if (raw.subtitles) {
      for (const [lang, tracks] of Object.entries(raw.subtitles)) {
        const trackList = tracks as any[];
        trackList.forEach((t) => {
          subtitles.push({
            lang,
            name: lang,
            ext: t.ext || 'vtt',
            url: t.url,
            isAuto: false
          });
        });
      }
    }
    if (raw.automatic_captions) {
      for (const [lang, tracks] of Object.entries(raw.automatic_captions)) {
        const trackList = tracks as any[];
        trackList.forEach((t) => {
          subtitles.push({
            lang,
            name: `${lang} (Auto)`,
            ext: t.ext || 'vtt',
            url: t.url,
            isAuto: true
          });
        });
      }
    }

    // Extract chapters
    const chapters: ChapterItem[] = (raw.chapters || []).map((c: any) => ({
      startTime: c.start_time || 0,
      endTime: c.end_time || 0,
      title: c.title || 'Untitled Chapter'
    }));

    return {
      id: raw.id || 'unknown',
      title: raw.title || 'Untitled Media',
      url: fallbackUrl,
      thumbnail: raw.thumbnail || (raw.thumbnails && raw.thumbnails.length ? raw.thumbnails[raw.thumbnails.length - 1].url : undefined),
      description: raw.description || '',
      uploader: raw.uploader || raw.channel || '',
      uploaderId: raw.uploader_id || raw.channel_id || '',
      uploaderUrl: raw.uploader_url || raw.channel_url || '',
      duration: raw.duration || 0,
      durationString: raw.duration_string || (raw.duration ? `${Math.floor(raw.duration / 60)}:${String(raw.duration % 60).padStart(2, '0')}` : undefined),
      viewCount: raw.view_count || undefined,
      likeCount: raw.like_count || undefined,
      uploadDate: raw.upload_date || undefined,
      extractor: raw.extractor || raw.extractor_key || 'generic',
      webpageUrl: raw.webpage_url || fallbackUrl,
      formats,
      subtitles,
      chapters,
      isPlaylist: !!raw._type && raw._type === 'playlist',
      playlistCount: raw.playlist_count || (raw.entries ? raw.entries.length : undefined)
    };
  }
}
