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

  private constructor() {}

  public static getInstance(): YtDlpService {
    if (!YtDlpService.instance) {
      YtDlpService.instance = new YtDlpService();
    }
    return YtDlpService.instance;
  }

  public async detect(customPath?: string): Promise<YtDlpExecutable> {
    // 1. Check custom path if supplied
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

    // 2. Check local workspace
    let workspaceRoot: string | null = null;
    let candidateDirs = [process.cwd(), __dirname];
    for (const startDir of candidateDirs) {
      let current = startDir;
      for (let i = 0; i < 6; i++) {
        if (fs.existsSync(path.join(current, 'yt-dlp.cmd')) || fs.existsSync(path.join(current, 'yt_dlp'))) {
          workspaceRoot = current;
          break;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
      }
      if (workspaceRoot) break;
    }

    if (workspaceRoot) {
      const localCmd = path.join(workspaceRoot, 'yt-dlp.cmd');
      const localPyModule = path.join(workspaceRoot, 'yt_dlp');

      if (process.platform === 'win32' && fs.existsSync(localCmd)) {
        const ver = await this.testBinary(localCmd, ['--version'], workspaceRoot);
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
        const ver = await this.testBinary('python', ['-m', 'yt_dlp', '--version'], workspaceRoot);
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

    // 3. Check system PATH
    const systemVer = await this.testBinary('yt-dlp', ['--version']);
    if (systemVer) {
      this.executable = {
        cmd: 'yt-dlp',
        argsPrefix: [],
        source: 'system',
        version: systemVer,
        path: 'yt-dlp'
      };
      this.logger.info('yt-dlp', `Detected system yt-dlp (${systemVer})`);
      return this.executable;
    }

    // 4. Not found
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
        const child = spawn(cmd, args, {
          cwd: cwd || process.cwd(),
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
        throw new Error('yt-dlp is not installed or available on this system.');
      }
    }

    const { cmd, argsPrefix } = this.executable;
    const args = [
      ...argsPrefix,
      '--dump-single-json',
      '--no-warnings',
      '--no-check-certificates',
      '--skip-download',
      url.trim()
    ];

    this.logger.info('yt-dlp', `Analyzing URL: ${url}`);

    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
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
          this.logger.error('yt-dlp', `Analysis failed with code ${code}: ${stderr}`);
          return reject(new Error(stderr.trim() || `Analysis process exited with code ${code}`));
        }

        try {
          const firstBrace = stdout.indexOf('{');
          const lastBrace = stdout.lastIndexOf('}');
          if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('No valid JSON output produced by yt-dlp');
          }
          const jsonStr = stdout.slice(firstBrace, lastBrace + 1);
          const raw = JSON.parse(jsonStr);
          const metadata = this.normalizeMetadata(raw, url);
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
      id: raw.id || Math.random().toString(36).substring(2, 9),
      title: raw.title || raw.fulltitle || 'Untitled Media',
      url: raw.webpage_url || fallbackUrl,
      thumbnail: raw.thumbnail || undefined,
      description: raw.description || undefined,
      uploader: raw.uploader || raw.channel || undefined,
      uploaderId: raw.uploader_id || undefined,
      uploaderUrl: raw.uploader_url || undefined,
      duration: raw.duration || undefined,
      durationString: raw.duration_string || undefined,
      viewCount: raw.view_count || undefined,
      likeCount: raw.like_count || undefined,
      uploadDate: raw.upload_date || undefined,
      extractor: raw.extractor_key || raw.extractor || undefined,
      webpageUrl: raw.webpage_url || undefined,
      formats,
      subtitles,
      chapters,
      isPlaylist: raw._type === 'playlist' || Array.isArray(raw.entries),
      playlistCount: Array.isArray(raw.entries) ? raw.entries.length : undefined
    };
  }
}
