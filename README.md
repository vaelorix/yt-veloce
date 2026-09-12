# yt-veloce — High-Velocity Desktop Media Engine

A high-performance, production-quality desktop graphical control center for [yt-dlp](https://github.com/yt-dlp/yt-dlp).

**yt-veloce** provides a comprehensive, modern desktop interface exposing the complete feature set of `yt-dlp` through an intuitive, streamlined UI while preserving deep configurability, stream inspection, and automated toolchain orchestration. **It is a fork and desktop interface built on top of the original yt-dlp project.**

## Features

- **Media Acquisition Studio:** Unified URL intake and format configuration with SponsorBlock, subtitle embedding, multi-track extraction, and custom CLI flags.
- **System Dependencies & Toolchain Auto-Detection:** Automatically discovers and verifies system installations of `yt-dlp`, `FFmpeg`, `FFprobe`, `Python 3`, `AtomicParsley`, and `aria2c` multi-threaded accelerator (including WinGet, Scoop, and Chocolatey packages) without terminal friction.
- **Format Explorer:** Live `-F` stream probe inspecting all container codecs, bitrates, resolutions, and direct one-click selection.
- **Command Builder & Script Exporter:** Real-time CLI argument generation with instant `.bat`, `.ps1`, and `.sh` export.
- **Custom Presets & Profiles:** Full CRUD preset engine for 4K HDR, Best MP4, MP3 320k, FLAC Lossless, and Archive formats.
- **Intuitive Dashboard & Queue:** Concurrent download management with live speed graphs, progress bars, pause/resume/cancel controls, and persistent SQLite history.
- **Native Custom Titlebar & Glassmorphism Aesthetics:** Clean dark/light theme designed with modern high-contrast typography, collapsible sidebar, and responsive views.

## Acknowledgements & Upstream

This project is powered by and forked from **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**.
All core downloading and extraction capabilities are provided by the `yt-dlp` project.

- **yt-dlp GitHub:** [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **yt-dlp Discord Server:** [https://discord.gg/H5MNcFW63r](https://discord.gg/H5MNcFW63r)

## Quick Start (GUI)

You can simply launch the application using the included VBS script on Windows or using standard npm scripts:

**Launch silently on Windows:**
Simply double click `launch.vbs` in the root folder to start the GUI control center without any console windows.

**Running via NPM:**
```bash
# Install dependencies
cd desktop
npm install

# Run the app
npm start
```
