import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { DownloadJob, DownloadProgress, DownloadStatus, PresetProfile, AppSettings } from '../../shared/types';
import { LoggingService } from './LoggingService';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database | null = null;
  private dbPath: string;
  private logger = LoggingService.getInstance();
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  private constructor() {
    let baseDir: string;
    try {
      baseDir = app ? app.getPath('userData') : path.join(process.cwd(), '.data');
    } catch {
      baseDir = path.join(process.cwd(), '.data');
    }
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    this.dbPath = path.join(baseDir, 'yt-dlp-desktop.db');
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    const SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
        this.logger.info('system', `Loaded SQLite database from ${this.dbPath}`);
      } catch (err: any) {
        this.logger.warn('system', `Failed to open existing database: ${err.message}. Initializing fresh database.`);
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
      this.logger.info('system', `Initialized fresh SQLite database at ${this.dbPath}`);
    }

    this.runMigrations();
    this.repairCorruptedOutputPaths();
    this.seedDefaultPresets();
    this.persist();
  }

  private runMigrations(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        thumbnail TEXT,
        uploader TEXT,
        duration INTEGER,
        options_json TEXT NOT NULL,
        status TEXT NOT NULL,
        progress_json TEXT NOT NULL,
        output_path TEXT,
        file_size INTEGER,
        created_at INTEGER NOT NULL,
        completed_at INTEGER,
        error TEXT,
        error_details TEXT,
        command_executed TEXT,
        logs_json TEXT
      );

      CREATE TABLE IF NOT EXISTS presets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        options_json TEXT NOT NULL,
        is_builtin INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  private seedDefaultPresets(): void {
    if (!this.db) return;

    const countRes = this.db.exec("SELECT COUNT(*) as count FROM presets WHERE is_builtin = 1");
    const count = countRes[0]?.values[0]?.[0] as number;
    if (count > 0) return;

    const defaultPresets: PresetProfile[] = [
      {
        id: 'yt-best-mp4',
        name: 'YouTube Video (MP4)',
        description: 'Best video + best audio merged into MP4 with thumbnail and metadata',
        icon: 'video',
        isBuiltIn: true,
        options: {
          mergeOutputFormat: 'mp4',
          embedThumbnail: true,
          embedMetadata: true
        }
      },
      {
        id: 'yt-audio-mp3',
        name: 'YouTube Audio (MP3)',
        description: 'Extract best audio and transcode to 320k MP3 with embedded thumbnail',
        icon: 'music',
        isBuiltIn: true,
        options: {
          audioOnly: true,
          audioFormat: 'mp3',
          audioQuality: '0',
          embedThumbnail: true,
          embedMetadata: true
        }
      },
      {
        id: 'archive-full',
        name: 'Archive Best Quality',
        description: 'Maximum original fidelity + subtitles + descriptions + infojson',
        icon: 'archive',
        isBuiltIn: true,
        options: {
          embedMetadata: true,
          embedThumbnail: true,
          embedSubtitles: true,
          writeSubtitles: true,
          writeDescription: true,
          writeInfoJson: true
        }
      },
      {
        id: 'mobile-720p',
        name: 'Mobile Optimized (720p)',
        description: 'Lightweight 720p video ideal for mobile playback and storage saving',
        icon: 'smartphone',
        isBuiltIn: true,
        options: {
          formatSelection: 'bestvideo[height<=720]+bestaudio/best[height<=720]',
          mergeOutputFormat: 'mp4'
        }
      },
      {
        id: 'lossless-audio',
        name: 'Lossless Audio (FLAC)',
        description: 'Extract highest fidelity audio converted to lossless FLAC',
        icon: 'disc',
        isBuiltIn: true,
        options: {
          audioOnly: true,
          audioFormat: 'flac',
          embedMetadata: true
        }
      },
      {
        id: 'cinema-4k-mkv',
        name: '4K Cinema Master (AV1/MKV)',
        description: '2160p resolution with AV1 codec preference, chapter markers, and MKV container',
        icon: 'sparkles',
        isBuiltIn: true,
        options: {
          maxResolution: '2160p',
          videoCodecPreference: 'av01',
          mergeOutputFormat: 'mkv',
          embedChapters: true,
          embedThumbnail: true,
          embedMetadata: true
        }
      },
      {
        id: 'clean-podcast',
        name: 'Clean Podcast (SponsorBlock)',
        description: '320k MP3 extraction with automated removal of sponsor segments & intro fluff',
        icon: 'shield',
        isBuiltIn: true,
        options: {
          audioOnly: true,
          audioFormat: 'mp3',
          audioQuality: '0',
          sponsorBlockRemove: 'all',
          embedThumbnail: true,
          embedMetadata: true
        }
      },
      {
        id: 'ultra-turbo-16',
        name: 'Ultra Turbo Acceleration',
        description: '16-fragment multi-thread streaming with Aria2c high-bandwidth acceleration',
        icon: 'zap',
        isBuiltIn: true,
        options: {
          concurrentFragments: 16,
          useAria2: true,
          mergeOutputFormat: 'mp4',
          embedThumbnail: true,
          embedMetadata: true
        }
      }
    ];

    for (const p of defaultPresets) {
      this.db.run(
        "INSERT INTO presets (id, name, description, icon, options_json, is_builtin) VALUES (?, ?, ?, ?, ?, ?)",
        [p.id, p.name, p.description, p.icon, JSON.stringify(p.options), 1]
      );
    }
  }

  public persist(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (err: any) {
      this.logger.error('system', `Failed to write database to disk: ${err.message}`);
    }
  }

  private schedulePersist(): void {
    if (this.saveDebounceTimer) return;
    this.saveDebounceTimer = setTimeout(() => {
      this.saveDebounceTimer = null;
      this.persist();
    }, 1000);
  }

  // --- Downloads CRUD ---

  public saveJob(job: DownloadJob): void {
    if (!this.db) return;
    const stmt = `
      INSERT OR REPLACE INTO downloads (
        id, url, title, thumbnail, uploader, duration, options_json, status, progress_json,
        output_path, file_size, created_at, completed_at, error, error_details, command_executed, logs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    this.db.run(stmt, [
      job.id,
      job.url,
      job.title,
      job.thumbnail || null,
      job.uploader || null,
      job.duration || null,
      JSON.stringify(job.options),
      job.status,
      JSON.stringify(job.progress),
      job.outputPath || null,
      job.fileSize || null,
      job.createdAt,
      job.completedAt || null,
      job.error || null,
      job.errorDetails || null,
      job.commandExecuted || null,
      JSON.stringify(job.logs || [])
    ]);
    this.schedulePersist();
  }

  public updateJobProgress(id: string, progress: DownloadProgress, status: DownloadStatus): void {
    if (!this.db) return;
    this.db.run("UPDATE downloads SET progress_json = ?, status = ? WHERE id = ?", [
      JSON.stringify(progress),
      status,
      id
    ]);
    this.schedulePersist();
  }

  public getJob(id: string): DownloadJob | null {
    if (!this.db) return null;
    const res = this.db.exec("SELECT * FROM downloads WHERE id = ?", [id]);
    if (!res[0] || !res[0].values[0]) return null;
    return this.rowToJob(res[0].columns, res[0].values[0]);
  }

  public getAllJobs(): DownloadJob[] {
    if (!this.db) return [];
    const res = this.db.exec("SELECT * FROM downloads ORDER BY created_at DESC");
    if (!res[0]) return [];
    return res[0].values.map((row) => this.rowToJob(res[0].columns, row));
  }

  public getHistory(limit = 100): DownloadJob[] {
    if (!this.db) return [];
    const res = this.db.exec(
      "SELECT * FROM downloads WHERE status IN ('completed', 'error', 'cancelled') ORDER BY completed_at DESC, created_at DESC LIMIT ?",
      [limit]
    );
    if (!res[0]) return [];
    return res[0].values.map((row) => this.rowToJob(res[0].columns, row));
  }

  public deleteJob(id: string): boolean {
    if (!this.db) return false;
    this.db.run("DELETE FROM downloads WHERE id = ?", [id]);
    this.schedulePersist();
    return true;
  }

  public clearHistory(): boolean {
    if (!this.db) return false;
    this.db.run("DELETE FROM downloads WHERE status IN ('completed', 'error', 'cancelled')");
    this.schedulePersist();
    return true;
  }

  private repairCorruptedOutputPaths(): void {
    if (!this.db) return;
    try {
      const res = this.db.exec("SELECT id, output_path FROM downloads WHERE output_path LIKE '%.f%'");
      if (!res[0] || !res[0].values) return;
      for (const row of res[0].values) {
        const id = row[0] as string;
        const outPath = row[1] as string;
        if (outPath) {
          const resolved = this.resolveActualFilePath(outPath);
          if (resolved && resolved !== outPath) {
            this.db.run("UPDATE downloads SET output_path = ? WHERE id = ?", [resolved, id]);
            this.logger.info('system', `Repaired job output path for [${id}]: ${resolved}`);
          }
        }
      }
    } catch (err: any) {
      this.logger.warn('system', `Failed to repair corrupted output paths: ${err.message}`);
    }
  }

  public resolveActualFilePath(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    try {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) return filePath;

      const filename = path.basename(filePath);

      // Strip intermediate stream tokens e.g. .f251-12.webm
      const stripped = filename.replace(/\.f\d+(?:-\d+)?(\.[a-z0-9]+)$/i, '$1');
      const strippedPath = path.join(dir, stripped);
      if (fs.existsSync(strippedPath)) {
        return strippedPath;
      }

      // Check common extensions
      const baseWithoutExt = stripped.replace(/\.[a-z0-9]+$/i, '');
      const exts = ['.webm', '.mp4', '.mkv', '.mp3', '.m4a', '.opus', '.wav', '.flac'];
      for (const ext of exts) {
        const candidate = path.join(dir, baseWithoutExt + ext);
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      // Check bracketed ID
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
      // fallback
    }
    return filePath;
  }

  private rowToJob(columns: string[], values: any[]): DownloadJob {
    const row: any = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx];
    });

    const rawOutputPath = row.output_path || undefined;
    const outputPath = this.resolveActualFilePath(rawOutputPath);

    return {
      id: row.id,
      url: row.url,
      title: row.title,
      thumbnail: row.thumbnail || undefined,
      uploader: row.uploader || undefined,
      duration: row.duration || undefined,
      options: row.options_json ? JSON.parse(row.options_json) : { url: row.url },
      status: row.status as DownloadStatus,
      progress: row.progress_json ? JSON.parse(row.progress_json) : {
        percent: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        speed: '0 B/s',
        speedBytesPerSec: 0,
        eta: '--:--',
        etaSeconds: 0,
        statusText: row.status,
        stage: 'queued'
      },
      outputPath,
      fileSize: row.file_size || undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at || undefined,
      error: row.error || undefined,
      errorDetails: row.error_details || undefined,
      commandExecuted: row.command_executed || undefined,
      logs: row.logs_json ? JSON.parse(row.logs_json) : []
    };
  }

  // --- Presets CRUD ---

  public getPresets(): PresetProfile[] {
    if (!this.db) return [];
    const res = this.db.exec("SELECT * FROM presets ORDER BY is_builtin DESC, name ASC");
    if (!res[0]) return [];
    return res[0].values.map((row) => {
      const obj: any = {};
      res[0].columns.forEach((c, idx) => { obj[c] = row[idx]; });
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        icon: obj.icon,
        options: JSON.parse(obj.options_json || '{}'),
        isBuiltIn: Boolean(obj.is_builtin)
      };
    });
  }

  public savePreset(preset: PresetProfile): PresetProfile {
    if (!this.db) return preset;
    this.db.run(
      "INSERT OR REPLACE INTO presets (id, name, description, icon, options_json, is_builtin) VALUES (?, ?, ?, ?, ?, ?)",
      [preset.id, preset.name, preset.description, preset.icon, JSON.stringify(preset.options), preset.isBuiltIn ? 1 : 0]
    );
    this.schedulePersist();
    return preset;
  }

  public deletePreset(id: string): boolean {
    if (!this.db) return false;
    this.db.run("DELETE FROM presets WHERE id = ? AND is_builtin = 0", [id]);
    this.schedulePersist();
    return true;
  }

  // --- Settings CRUD ---

  public getSettings(): AppSettings {
    const defaults: AppSettings = {
      defaultOutputDir: path.join(process.env.USERPROFILE || process.env.HOME || '.', 'Downloads'),
      maxConcurrentDownloads: 2,
      defaultPresetId: 'yt-best-mp4',
      filenameTemplate: '%(title)s [%(id)s].%(ext)s',
      customYtDlpPath: '',
      customFFmpegPath: '',
      theme: 'dark',
      accentColor: 'emerald',
      enableNotifications: true,
      defaultRateLimit: '',
      proxyUrl: '',
      browserCookies: '',
      concurrentFragments: 8,
      defaultAudioBitrate: 'best',
      embedThumbnail: true,
      embedSubtitles: false,
      autoRetryCount: 5,
      sponsorBlockMode: 'disabled',
      layoutDensity: 'comfortable'
    };

    if (!this.db) return defaults;
    const res = this.db.exec("SELECT key, value FROM settings");
    if (!res[0]) return defaults;

    const loaded: any = { ...defaults };
    res[0].values.forEach(([k, v]) => {
      try {
        loaded[k as string] = JSON.parse(v as string);
      } catch {
        loaded[k as string] = v;
      }
    });

    return loaded;
  }

  public saveSettings(settings: Partial<AppSettings>): AppSettings {
    if (!this.db) return this.getSettings();
    for (const [key, value] of Object.entries(settings)) {
      this.db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, JSON.stringify(value)]);
    }
    this.schedulePersist();
    return this.getSettings();
  }
}
