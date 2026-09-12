# yt-dlp Desktop Architecture Documentation

## Overview

The application follows a decoupled multi-process architecture consisting of:
1. **Renderer Process**: Pure React 18 application with zero direct Node.js or native filesystem dependencies.
2. **Preload Layer**: A minimal, security-hardened bridge exposing typed methods through `contextBridge.exposeInMainWorld('electronAPI', ...)`.
3. **Main Process**: Electron Node.js backend organizing independent, testable services (`DownloadManager`, `YtDlpService`, `DatabaseService`, `CommandBuilderService`, `ProcessManager`, `FFmpegService`).

---

## Process Boundaries & Communication

```
[ React Renderer ]
       │
       ▼ (window.electronAPI)
[ Preload contextBridge ]
       │
       ▼ (ipcRenderer.invoke / ipcRenderer.on)
[ Main IPC Router (registerIpcHandlers) ]
       │
       ├─► YtDlpService (Detection & Analysis)
       ├─► DownloadManager (Queue Scheduling & Concurrency)
       │       └─► ProcessManager (child_process.spawn & line parsing)
       ├─► CommandBuilderService (Options -> CLI flags)
       ├─► DatabaseService (sql.js SQLite persistence)
       ├─► FFmpegService (Binary detection)
       └─► LoggingService (Ring buffer & event dispatch)
```

---

## Core Services

### 1. `YtDlpService`
- Discovers the `yt-dlp` executable across 4 sources:
  1. Workspace local: tests for `yt-dlp.cmd` or `python -m yt_dlp` in the repository
  2. System PATH: queries `yt-dlp --version`
  3. User custom configuration in Settings
- Executes `--dump-single-json` with resilience against non-JSON leading warnings.
- Maps raw yt-dlp streams to clean, normalized `FormatItem[]` (codecs, resolutions, bitrates, containers).

### 2. `CommandBuilderService`
- Pure function compiler converting `DownloadOptions` into:
  - `args: string[]`: Safe array for `child_process.spawn()`
  - `command: string`: Pretty CLI string for user copy / export
  - `explanations`: Explanatory tooltips for each flag
- Supports audio-only extraction, subtitle embedding, thumbnail writing, metadata tagging, proxy routing, and browser cookie loading.

### 3. `ProcessManager`
- Spawns yt-dlp with custom progress templates:
  `--progress-template "download:[AGY_PROG] %(progress.downloaded_bytes)s %(progress.total_bytes)s %(progress.speed)s %(progress.eta)s %(progress.status)s %(progress.filename)s"`
- Dual-mode parser: extracts structured `[AGY_PROG]` tokens while maintaining regex fallback for standard terminal output.
- Clean process termination via process tree kill (`taskkill /pid ... /T /F` on Windows) preventing orphaned child processes.

### 4. `DatabaseService`
- Backed by `sql.js` (WebAssembly SQLite).
- Automatically creates tables: `downloads`, `presets`, `settings`.
- Debounces file synchronization to disk (`yt-dlp-desktop.db`) to avoid I/O bottlenecks during heavy progress streaming.

---

## State Lifecycle of a Download Job

```
[ User Action ] -> Create Job
       │
       ▼
   'queued' ───(Queue slot available)───► 'downloading'
       ▲                                       │
       │ (Resume)                              ▼ (Progress 100%)
    'paused' ◄──────(User pause)──────── 'postprocessing'
       ▲                                       │
       │ (Retry)                               ▼
    'error' ◄───────(Failure)──────────── 'completed'
```
