# yt-dlp Professional Desktop GUI

A professional, production-quality Electron desktop graphical user interface for [yt-dlp](https://github.com/yt-dlp/yt-dlp).

This project provides a comprehensive desktop frontend that exposes the power of yt-dlp through an intuitive, modern, and highly configurable GUI while preserving access to advanced functionality. **It is a fork built on top of the original yt-dlp project.**

## Features

- **Intuitive Dashboard:** Get an overview of your active downloads, recent history, and system status at a glance.
- **Advanced Download Manager:** Queue, pause, resume, cancel, or retry your downloads seamlessly.
- **Format Explorer:** Select specific video and audio formats effortlessly with a specialized expression builder.
- **Command Builder:** Automatically generates yt-dlp CLI commands as you configure your options, allowing you to learn the underlying CLI commands or copy them for terminal use.
- **Presets & Profiles:** Save and reuse custom download configurations (like "Best Video + Audio", "Audio Only MP3", etc.).
- **Live Logs & History:** Track the detailed execution logs and review download history in a structured format.
- **Cross-Platform:** Works on Windows, macOS, and Linux out-of-the box using Electron.

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
