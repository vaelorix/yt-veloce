<p align="center">
  <img src="https://media.tenor.com/1eZJF7qDOIQAAAAM/beatboxing-cat-cat.gif" width="380" alt="yt-veloce supersonic beatbox cat" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);" />
</p>

<h1 align="center">⚡ yt-veloce</h1>

<p align="center">
  <strong>High-Velocity Desktop Media Engine & Next-Gen Graphical Cockpit for <a href="https://github.com/yt-dlp/yt-dlp">yt-dlp</a></strong>
</p>

<p align="center">
  <a href="https://github.com/vaelorix/yt-veloce/releases"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=for-the-badge&logo=windows&logoColor=white" alt="Platforms" /></a>
  <a href="https://github.com/vaelorix/yt-veloce/releases"><img src="https://img.shields.io/badge/Version-1.0.0-emerald?style=for-the-badge&color=2ea043" alt="Version" /></a>
  <a href="https://github.com/yt-dlp/yt-dlp"><img src="https://img.shields.io/badge/yt--dlp%20Core-2026.08.19-red?style=for-the-badge&logo=youtube&logoColor=white" alt="yt-dlp" /></a>
  <a href="https://discord.gg/H5MNcFW63r"><img src="https://img.shields.io/badge/Discord-yt--dlp%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-The%20Unlicense-lightgrey?style=for-the-badge" alt="License" /></a>
</p>

---

<p align="center">
  <a href="https://github.com/vaelorix/yt-veloce/releases/latest">
    <img src="https://img.shields.io/badge/⬇️_Download_Windows-Installer_(.exe)-2ea043?style=for-the-badge&logo=windows&logoColor=white" height="38" />
  </a>
  &nbsp;
  <a href="https://github.com/vaelorix/yt-veloce/releases/latest">
    <img src="https://img.shields.io/badge/⬇️_Download_macOS-Package_(.dmg)-1f6feb?style=for-the-badge&logo=apple&logoColor=white" height="38" />
  </a>
  &nbsp;
  <a href="https://github.com/vaelorix/yt-veloce/releases/latest">
    <img src="https://img.shields.io/badge/⬇️_Download_Linux-AppImage_(.AppImage)-f0883e?style=for-the-badge&logo=linux&logoColor=white" height="38" />
  </a>
  &nbsp;
  <a href="#-quick-start--silent-launch">
    <img src="https://img.shields.io/badge/🚀_Quick_Run-Silent_Launcher_(.vbs)-a371f7?style=for-the-badge" height="38" />
  </a>
</p>

---

### 🛠️ Languages, Frameworks & Toolchains

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React%2018-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Electron%2034-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Python%203-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3" />
  <img src="https://img.shields.io/badge/Vite%206-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/SQLite%203-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/FFmpeg-007808?style=flat-square&logo=ffmpeg&logoColor=white" alt="FFmpeg" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/CSS3%20Tokens-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/PowerShell-5391FE?style=flat-square&logo=powershell&logoColor=white" alt="PowerShell" />
  <img src="https://img.shields.io/badge/Aria2c%20Turbo-D32F2F?style=flat-square&logo=speedtest&logoColor=white" alt="Aria2c" />
</p>

---

## 📑 Table of Contents

1. [Overview & Philosophy](#-overview--philosophy)
2. [Key Capabilities & Feature Tour](#-key-capabilities--feature-tour)
   - [Media Acquisition Studio](#1-media-acquisition-studio-single-entry-hub)
   - [Automated Toolchain Discovery & Health Checker](#2-automated-toolchain-discovery--health-checker)
   - [Presets & Automation Profiles Studio](#3-presets--automation-profiles-studio)
   - [Visual Command Builder & Script Exporter](#4-visual-command-builder--script-exporter)
   - [Format Explorer (Live Stream Probing)](#5-format-explorer-live-stream-probing)
   - [Multi-Connection Queue & Bandwidth Manager](#6-multi-connection-queue--bandwidth-manager)
   - [Persistent SQLite Engine & Diagnostics](#7-persistent-sqlite-engine--diagnostics)
3. [Quick Start & Silent Launch](#-quick-start--silent-launch)
4. [Development & Compilation Guide](#-development--compilation-guide)
5. [Keyboard Shortcuts Reference](#-keyboard-shortcuts-reference)
6. [Architecture & System Design](#-architecture--system-design)
7. [Troubleshooting & Dependency Setup](#-troubleshooting--dependency-setup)
8. [Acknowledgements & Upstream Attribution](#-acknowledgements--upstream-attribution)
9. [License](#-license)

---

## 🌟 Overview & Philosophy

**yt-veloce** is a cross-platform desktop application designed to unleash the complete power of **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** through a sleek, cyber-emerald glassmorphism interface.

* **Never Reinvent the Engine:** We preserve `yt-dlp` as the battle-tested, authoritative backend engine. `yt-veloce` serves as its desktop cockpit.
* **Two-Way Transparency:** Every button toggle, quality dropdown, or preset directly updates and displays the underlying `yt-dlp` CLI command line in real-time.
* **Strict Process Security:** `contextIsolation` is permanently enforced, direct Node integration is disabled in the renderer, and commands are spawned with strict sanitization and timeout protections without arbitrary shell injection.
* **Logical & Decluttered Workflow:** Download entry is consolidated into a dedicated studio rather than scattered buttons, with a collapsible sidebar and clean titlebar branding.

---

## 🎛️ Key Capabilities & Feature Tour

### 1. Media Acquisition Studio (Single Entry Hub)
* **Single Source of Truth:** Enter any URL (YouTube, Twitch, Vimeo, Bilibili, SoundCloud, Twitter/X, and 1,000+ supported sites).
* **Granular Extraction Modes:**
  * Video + Audio auto-merge (`bv*+ba/b` into MP4, MKV, WebM).
  * Audio extraction into MP3 (VBR 0 / 320kbps CBR), M4A/AAC, FLAC (Lossless), Opus, or WAV.
* **SponsorBlock Integration:** Automatically detect and excise sponsored segments, intros, outros, and self-promotions.
* **Subtitle Engine:** Select embedded or external subtitles, convert to `.srt`, `.vtt`, or `.ass`, and specify multi-language patterns.
* **Metadata & Cover Art:** Automatic high-res thumbnail embedding and ID3/MP4 metadata tagging via AtomicParsley.

### 2. Automated Toolchain Discovery & Health Checker
* **Zero-Friction Detection:** Checks and monitors 6 crucial tools:
  1. `yt-dlp` Core Engine (Bundled Python or Standalone binary)
  2. `FFmpeg` Multimedia Encoder & Muxer
  3. `FFprobe` Stream Analyzer
  4. `Python 3` Runtime Environment
  5. `AtomicParsley` Specialized MP4/M4A Tagging Utility
  6. `aria2c` High-Speed Multi-Connection Accelerator
* **Deep WinGet & Package Store Scanning:** Scans `%LOCALAPPDATA%\Microsoft\WinGet\Packages`, WinGet links, Scoop, and Chocolatey directories automatically.
* **Dynamic PATH Injection:** Automatically prepends detected external binaries to the active process environment at runtime.
* **Process Safeguards:** Automated installer execution with 40s hard timeouts, silent unattended execution, and responsive error handling.

### 3. Presets & Automation Profiles Studio
* **Built-in Curated Profiles:**
  * 🎬 **Ultra 4K / 60FPS Video:** Highest resolution stream with VP9/AV1 and Opus merged into MKV/MP4.
  * 📱 **Universal 1080p MP4:** High-compatibility H.264 + AAC container for mobile and web playback.
  * 🎵 **Studio Audio MP3 (320kbps):** Audiophile VBR 0 MP3 extraction with embedded cover art.
  * 🎼 **Lossless FLAC Master:** Pristine bit-perfect audio stream retention.
  * ⚡ **Turbo Multi-Threaded:** 8-connection accelerated downloads via `aria2c`.
  * 📦 **Full Archival Backup:** Complete metadata, description, comments, JSON info, and thumbnails.
* **Custom Profile Creator:** Intuitive modal with icon picker, resolution ceilings, codec filters, and instant command preview.

### 4. Visual Command Builder & Script Exporter
* Construct advanced yt-dlp commands interactively through grouped controls:
  * Network limits, proxy routing, cookies ingestion (`--cookies-from-browser chrome/firefox/brave/edge`).
  * Output template customization (`%(title)s [%(id)s].%(ext)s`).
  * Custom argument passthrough (`--geo-bypass`, `--write-thumbnail`, etc.).
* **One-Click Script Export:** Save ready-to-run `.bat` (Windows), `.ps1` (PowerShell), or `.sh` (Bash) scripts with one click.

### 5. Format Explorer (Live Stream Probing)
* Runs live `yt-dlp -F` stream inspections without starting a download.
* Displays an interactive, filterable data grid of all available video resolutions, video codecs, audio bitrates, and container formats.
* Select any format ID combination (e.g. `137+140`) and trigger instant downloads.

### 6. Multi-Connection Queue & Bandwidth Manager
* Live queue management with pause, resume, cancel, and retry capabilities.
* Real-time download speed meters, percentage progress bars, ETA calculations, and data size metrics.
* Configurable concurrent download workers (1 to 8 concurrent streams).

### 7. Persistent SQLite Engine & Diagnostics
* High-performance local SQLite storage (`yt-dlp-desktop.db`) storing complete history, custom presets, and persistent preferences.
* Automatic output path repair: eliminates missing file bugs by dynamically verifying merged video files on disk.
* Real-time diagnostics tab with searchable, colorized logs and single-click log export.

---

## 🚀 Quick Start & Silent Launch

### Method A: One-Click Windows Silent Launch (Recommended)
Double-click `launch.vbs` located in the root directory:
```
c:\Users\Vaelorix\Desktop\github contribution\yt-dlp\launch.vbs
```
> **Tip:** `launch.vbs` initializes the development server and launches the Electron application cleanly in the background without keeping an open terminal or command prompt window.

---

### Method B: Manual CLI Run (Developers)

#### 1. Prerequisites
* **Node.js** v18.0 or newer
* **Python** 3.8 or newer (with `yt-dlp` installed or using repository engine)
* **FFmpeg** installed (or auto-detected via WinGet)

#### 2. Installation & Launch
```bash
# Clone repository
git clone https://github.com/vaelorix/yt-veloce.git
cd yt-veloce

# Install desktop workspace dependencies
cd desktop
npm install

# Start development server with hot-reload
npm run dev
```

---

## 📦 Development & Compilation Guide

### Running Automated Test Suite
The project includes a comprehensive Vitest test suite covering engine detection, SQLite database persistence, CLI command generation, and progress parsing:
```bash
npm test
```

### Compiling Production Binaries
To build the distribution bundles (optimized Vite frontend + compiled TypeScript Electron main process):
```bash
npm --prefix desktop run build
```

To package native platform executables via Electron Builder:
```bash
# Windows (.exe installer & portable)
npm --prefix desktop run package:win

# macOS (.dmg)
npm --prefix desktop run package:mac

# Linux (.AppImage & .deb)
npm --prefix desktop run package:linux
```

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action | Description |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | **New Download** | Opens the Media Acquisition Studio |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | **Toggle Sidebar** | Collapses or expands the navigation sidebar |
| <kbd>Ctrl</kbd> + <kbd>J</kbd> | **Download Queue** | Switches to active downloads queue |
| <kbd>Ctrl</kbd> + <kbd>,</kbd> | **Settings** | Opens application configuration & path settings |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | **Global Search** | Focuses the quick navigation search bar |
| <kbd>F5</kbd> | **Reload Interface** | Refreshes current view and re-queries database |

---

## 🏗️ Architecture & System Design

```
yt-veloce/
├── desktop/
│   ├── src/
│   │   ├── main/                    # Electron Main Process (Node.js)
│   │   │   ├── index.ts             # Window lifecycle & initialization
│   │   │   ├── ipc/                 # Secure IPC dispatchers & handlers
│   │   │   └── services/            # Core business services
│   │   │       ├── YtDlpService.ts      # yt-dlp binary/python detection & execution
│   │   │       ├── FFmpegService.ts     # FFmpeg & FFprobe probe engine
│   │   │       ├── DependencyService.ts # WinGet, Scoop, & toolchain auto-discovery
│   │   │       ├── DownloadManager.ts   # Concurrency scheduler & queue orchestrator
│   │   │       ├── ProcessManager.ts    # Child process management & stream parsers
│   │   │       ├── DatabaseService.ts   # SQLite history, presets, and path repair
│   │   │       ├── CommandBuilderService.ts # Dynamic CLI argument synthesizer
│   │   │       └── LoggingService.ts    # Centralized event logger
│   │   ├── preload/                 # Electron Preload Bridge
│   │   │   └── index.ts             # Safe window.electronAPI context exposure
│   │   ├── renderer/                # React 18 User Interface (Vite)
│   │   │   ├── components/          # Reusable UI components & layouts
│   │   │   │   ├── layout/          # TitleBar, Header, Sidebar
│   │   │   │   └── VeloceLogo.tsx   # Supersonic vector brand logo
│   │   │   └── views/               # Application view controllers
│   │   │       ├── DashboardView.tsx
│   │   │       ├── NewDownloadView.tsx
│   │   │       ├── QueueView.tsx
│   │   │       ├── HistoryView.tsx
│   │   │       ├── PresetsView.tsx
│   │   │       ├── CommandBuilderView.tsx
│   │   │       ├── FormatExplorerView.tsx
│   │   │       ├── DependenciesView.tsx
│   │   │       ├── LogsView.tsx
│   │   │       ├── SettingsView.tsx
│   │   │       └── AboutView.tsx
│   │   └── shared/                  # Shared TypeScript interfaces & DTOs
│   │       └── types.ts
│   └── tests/                       # Automated integration test suite
├── launch.vbs                       # Windows silent background launcher
└── README.md                        # Documentation & User Guide
```

---

## 🔧 Troubleshooting & Dependency Setup

### 1. Dependencies Report "Missing"
Click **Dependencies** in the left sidebar and select **Check Status**.
`yt-veloce` searches standard directories and WinGet caches (`%LOCALAPPDATA%\Microsoft\WinGet\Packages`). If a tool is not installed on your system, install it in one terminal command:
```powershell
# Install FFmpeg
winget install Gyan.FFmpeg

# Install AtomicParsley (Optional for advanced MP4 tags)
winget install wez.atomicparsley

# Install Aria2c (Optional for multi-connection acceleration)
winget install aria2.aria2
```
`yt-veloce` will automatically discover the installed binaries upon clicking **Check Status**.

### 2. Downloading Age-Restricted or Member-Only Content
Go to **Settings** or **New Download > Advanced Options**:
- Set **Extract Cookies From Browser** to your daily browser (`chrome`, `firefox`, `brave`, `edge`).
- yt-dlp will automatically read session tokens to authenticate media downloads securely.

---

## 🤝 Acknowledgements & Upstream Attribution

**yt-veloce** is built directly upon the foundation of **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**.
We express our deepest gratitude to the yt-dlp core developers, contributors, and the broader open-source multimedia community.

* **yt-dlp Repository:** [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
* **yt-dlp Official Discord Server:** [https://discord.gg/H5MNcFW63r](https://discord.gg/H5MNcFW63r)
* **FFmpeg Project:** [https://ffmpeg.org](https://ffmpeg.org)

---

## 📜 License

This project is licensed under **The Unlicense** (Public Domain), adhering to the open and permissive licensing of upstream yt-dlp. You are free to copy, modify, distribute, and contribute to this project.
