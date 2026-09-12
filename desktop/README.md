# yt-dlp Desktop Control Center

A professional, production-grade cross-platform Electron desktop GUI for **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**.

This application acts as a graphical orchestration layer that exposes the power and versatility of yt-dlp through an intuitive, modern interface while preserving full transparency into the exact command-line arguments being executed.

---

## Key Features

- **Engine Auto-Detection**: Automatically detects and leverages local workspace `yt-dlp` (`python -m yt_dlp` or `.\yt-dlp.cmd`), system PATH executables, or custom user-configured paths.
- **Deep Media Analysis**: Extract video/audio metadata, thumbnails, chapters, upload dates, view counts, and available streams with one click.
- **Format Explorer**: Interactive format inspection matrix with resolution, FPS, video codecs (AV1, VP9, H.264), audio codecs (Opus, AAC, FLAC), bitrates, and estimated file sizes.
- **Advanced Command Builder**: Real-time two-way synchronization between GUI controls and the underlying `yt-dlp` CLI command, complete with flag explanations, clipboard copying, and shell script export (`.bat`, `.sh`, `.ps1`).
- **Download Queue & Concurrency Management**: Manage concurrent downloads, pause, resume, cancel, and automatically retry failed jobs.
- **Persistent SQLite History & Profiles**: Fast local storage with `sql.js` (WebAssembly SQLite) for download history, settings, and custom presets with zero native compilation issues.
- **Intelligent Error Diagnostics**: Translates common technical failures (format missing, rate limiting, FFmpeg missing) into actionable troubleshooting advice.
- **Strict Security Boundaries**: Context isolation enabled, node integration disabled in the renderer, typed IPC validation, and child process execution without arbitrary shell execution.

---

## Technology Stack

- **Desktop Framework**: Electron 34
- **Frontend**: React 18, TypeScript, Vite 6
- **Database**: SQLite (`sql.js`)
- **Icons & Styling**: Lucide Icons, Modern Vanilla CSS design system with Dark & Light theme modes
- **Engine Core**: yt-dlp + FFmpeg / FFprobe
- **Test Runner**: Vitest

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3.8+](https://www.python.org/) or a standalone [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) binary
- [FFmpeg](https://ffmpeg.org/) (recommended for merging audio/video streams and transcoding)

### Development Setup

From the repository root:

```bash
# Run unit test suite
npm test

# Run development server (launches Vite HMR + Electron)
npm run dev

# Build production bundles
npm run build
```

Or navigate to the `desktop/` directory:

```bash
cd desktop
npm install
npm run dev
```

---

## Project Structure

```
desktop/
├── scripts/
│   └── dev.mjs                     # Development launcher (Vite + Electron)
├── src/
│   ├── main/
│   │   ├── index.ts                # Electron entry point & window management
│   │   ├── ipc/
│   │   │   └── registerIpcHandlers.ts # Whitelisted IPC handlers
│   │   └── services/
│   │       ├── CommandBuilderService.ts # Options-to-CLI argument compiler
│   │       ├── DatabaseService.ts       # SQLite storage & schema migrations
│   │       ├── DownloadManager.ts       # Concurrency, queue, and lifecycle
│   │       ├── FFmpegService.ts         # FFmpeg / FFprobe detection
│   │       ├── LoggingService.ts        # Circular log buffer & IPC streaming
│   │       ├── ProcessManager.ts        # Child process spawning & progress parser
│   │       └── YtDlpService.ts          # yt-dlp discovery & URL analyzer
│   ├── preload/
│   │   └── index.ts                # contextBridge secure API
│   ├── renderer/
│   │   ├── App.tsx                 # Main application shell
│   │   ├── main.tsx                # React DOM mount
│   │   ├── components/layout/      # Collapsible Sidebar & Header
│   │   ├── styles/                 # Design system tokens & global styles
│   │   └── views/
│   │       ├── DashboardView.tsx   # System metrics & quick launcher
│   │       ├── NewDownloadView.tsx # URL analyzer & stream picker
│   │       ├── FormatExplorerView.tsx # Stream matrix & format expression builder
│   │       ├── QueueView.tsx       # Live progress cards & controls
│   │       ├── DownloadDetailsModal.tsx # Log inspector & troubleshooting
│   │       ├── CommandBuilderView.tsx # Dedicated CLI command generator
│   │       ├── HistoryView.tsx     # Searchable media history
│   │       ├── PresetsView.tsx     # Profile creation & JSON import/export
│   │       ├── LogsView.tsx        # Searchable console & log exporter
│   │       ├── SettingsView.tsx    # Paths, limits, templates, and theme
│   │       └── AboutView.tsx       # Architecture & keyboard shortcuts
│   └── shared/
│       └── types.ts                # Shared TypeScript contracts & interfaces
├── tests/
│   ├── commandBuilder.test.ts      # Argument generation tests
│   ├── database.test.ts            # SQLite CRUD & preset tests
│   ├── engineDetection.test.ts     # Local engine detection tests
│   └── progressParser.test.ts      # Structured progress line tests
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Security Model

1. **Context Isolation**: Renderer execution has no direct access to Node.js APIs or the local file system.
2. **Safe Spawning**: yt-dlp arguments are passed as discrete array items to `child_process.spawn()` with `shell: false` where appropriate, preventing shell injection attacks.
3. **No Arbitrary Command Execution**: The renderer cannot execute arbitrary CLI strings. Every command is assembled through verified typed schemas.
4. **Credential Privacy**: Cookies and authentication parameters are marked sensitive and never output to UI logs or exported JSON files.

---

## License

This project is open-source under the MIT License. It is designed to complement the yt-dlp ecosystem while respecting upstream project policies.
