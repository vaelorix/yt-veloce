export interface EngineStatus {
  ytdlpAvailable: boolean;
  ytdlpVersion: string | null;
  ytdlpPath: string | null;
  ytdlpSource: 'workspace' | 'system' | 'custom' | 'none';
  ffmpegAvailable: boolean;
  ffmpegVersion: string | null;
  ffmpegPath: string | null;
  ffprobeAvailable: boolean;
  platform: string;
  arch: string;
}

export interface FormatItem {
  formatId: string;
  formatNote?: string;
  ext: string;
  resolution: string;
  width?: number | null;
  height?: number | null;
  fps?: number | null;
  vcodec: string;
  acodec: string;
  vbr?: number | null;
  abr?: number | null;
  tbr?: number | null;
  filesize?: number | null;
  filesizeApprox?: number | null;
  dynamicRange?: string | null;
  audioChannels?: number | null;
  language?: string | null;
  protocol?: string;
  container?: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface SubtitleTrack {
  ext: string;
  url?: string;
  name: string;
  lang: string;
  isAuto: boolean;
}

export interface ChapterItem {
  startTime: number;
  endTime: number;
  title: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  uploader?: string;
  uploaderId?: string;
  uploaderUrl?: string;
  duration?: number;
  durationString?: string;
  viewCount?: number;
  likeCount?: number;
  uploadDate?: string;
  extractor?: string;
  webpageUrl?: string;
  formats: FormatItem[];
  subtitles: SubtitleTrack[];
  chapters: ChapterItem[];
  isPlaylist?: boolean;
  playlistCount?: number;
}

export interface DownloadOptions {
  url: string;
  presetId?: string;
  formatSelection?: string;
  outputDir?: string;
  filenameTemplate?: string;
  audioOnly?: boolean;
  audioFormat?: 'mp3' | 'm4a' | 'opus' | 'flac' | 'wav' | 'best';
  audioQuality?: string;
  videoFormat?: 'mp4' | 'mkv' | 'webm' | 'best';
  mergeOutputFormat?: 'mp4' | 'mkv' | 'webm';
  embedSubtitles?: boolean;
  embedThumbnail?: boolean;
  embedMetadata?: boolean;
  writeSubtitles?: boolean;
  writeAutoSubtitles?: boolean;
  subLanguages?: string;
  writeThumbnail?: boolean;
  writeDescription?: boolean;
  writeInfoJson?: boolean;
  rateLimit?: string;
  proxy?: string;
  cookiesBrowser?: string;
  cookieFile?: string;
  customArgs?: string[];
}

export interface DownloadProgress {
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: string;
  speedBytesPerSec: number;
  eta: string;
  etaSeconds: number;
  statusText: string;
  filename?: string;
  stage: 'queued' | 'analyzing' | 'downloading' | 'postprocessing' | 'finished';
}

export type DownloadStatus = 
  | 'queued' 
  | 'analyzing' 
  | 'downloading' 
  | 'postprocessing' 
  | 'completed' 
  | 'paused' 
  | 'error' 
  | 'cancelled';

export interface DownloadJob {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  uploader?: string;
  duration?: number;
  options: DownloadOptions;
  status: DownloadStatus;
  progress: DownloadProgress;
  outputPath?: string;
  fileSize?: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
  errorDetails?: string;
  commandExecuted?: string;
  logs: string[];
}

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: Partial<DownloadOptions>;
  isBuiltIn: boolean;
}

export interface AppSettings {
  defaultOutputDir: string;
  maxConcurrentDownloads: number;
  defaultPresetId: string;
  filenameTemplate: string;
  customYtDlpPath: string;
  customFFmpegPath: string;
  theme: 'dark' | 'light' | 'system';
  enableNotifications: boolean;
  defaultRateLimit: string;
  proxyUrl: string;
  browserCookies: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'system' | 'yt-dlp' | 'ffmpeg' | 'download' | 'scheduler';
  message: string;
  jobId?: string;
}

export interface CommandBuildResult {
  command: string;
  args: string[];
  explanations: {
    flag: string;
    value?: string;
    description: string;
  }[];
}

export interface ElectronAPI {
  // Engine
  getEngineStatus: () => Promise<EngineStatus>;
  checkEngineHealth: () => Promise<EngineStatus>;
  
  // Analysis & Commands
  analyzeUrl: (url: string) => Promise<VideoMetadata>;
  buildCommand: (options: DownloadOptions) => Promise<CommandBuildResult>;
  
  // Downloads & Queue
  startDownload: (options: DownloadOptions) => Promise<string>;
  startBatchDownloads: (optionsList: DownloadOptions[]) => Promise<string[]>;
  pauseDownload: (id: string) => Promise<boolean>;
  resumeDownload: (id: string) => Promise<boolean>;
  cancelDownload: (id: string) => Promise<boolean>;
  retryDownload: (id: string) => Promise<boolean>;
  deleteDownload: (id: string) => Promise<boolean>;
  getDownloads: () => Promise<DownloadJob[]>;
  getJobDetails: (id: string) => Promise<DownloadJob | null>;
  
  // History
  getHistory: (limit?: number) => Promise<DownloadJob[]>;
  clearHistory: () => Promise<boolean>;
  
  // Presets
  getPresets: () => Promise<PresetProfile[]>;
  savePreset: (preset: PresetProfile) => Promise<PresetProfile>;
  deletePreset: (id: string) => Promise<boolean>;
  
  // Settings & OS
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  selectDirectory: () => Promise<string | null>;
  openPath: (filePath: string) => Promise<boolean>;
  showItemInFolder: (filePath: string) => Promise<boolean>;
  
  // Logs
  getLogs: (filter?: { level?: string; category?: string; jobId?: string }) => Promise<LogEntry[]>;
  clearLogs: () => Promise<boolean>;
  
  // Events
  onProgress: (callback: (data: { id: string; progress: DownloadProgress }) => void) => () => void;
  onJobStatusChange: (callback: (data: { id: string; status: DownloadStatus; error?: string }) => void) => () => void;
  onLogEntry: (callback: (log: LogEntry) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
