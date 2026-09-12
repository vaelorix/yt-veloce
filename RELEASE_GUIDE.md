# 🚀 yt-veloce Official Release & Packaging Guide

This guide provides full instructions for building, packaging, verifying, and deploying native executables of **yt-veloce** for **Windows**, **macOS**, and **Linux**.

---

## 📦 Distribution Packages & Supported Architectures

`yt-veloce` is distributed across all major desktop operating systems and CPU architectures:

| Platform | Architecture | Binary File | Description |
|---|---|---|---|
| **Windows** | `x64` (64-bit) | `yt-veloce-1.0.0-x64-setup.exe` | Standard Windows NSIS Installer (Desktop & Start Menu shortcuts) |
| **Windows** | `ia32` (32-bit) | `yt-veloce-1.0.0-ia32-setup.exe` | Legacy 32-bit Windows system installer |
| **Windows** | `arm64` (ARM) | `yt-veloce-1.0.0-arm64-setup.exe` | Native ARM64 installer for Snapdragon & Surface ARM devices |
| **Windows** | `x64` (Portable) | `yt-veloce-1.0.0-x64-portable.exe` | Zero-installation standalone executable (runs from USB or downloads) |
| **Windows** | `x64` (Archive) | `yt-veloce-1.0.0-win-x64.zip` | Extracted standalone folder |
| **macOS** | Apple Silicon | `yt-veloce-1.0.0-arm64.dmg` | Native Apple Silicon M1 / M2 / M3 / M4 disk image installer |
| **macOS** | Intel `x64` | `yt-veloce-1.0.0-x64.dmg` | Intel-based Mac disk image installer |
| **macOS** | Universal | `yt-veloce-1.0.0-universal.dmg` | Combined binary running natively on both Apple Silicon and Intel |
| **macOS** | All | `yt-veloce-1.0.0-mac.zip` | Compressed `.app` bundle archive |
| **Linux** | `x86_64` | `yt-veloce-1.0.0-x86_64.AppImage` | Universal Linux portable binary (Ubuntu, Fedora, Arch, Debian, etc.) |
| **Linux** | `arm64` | `yt-veloce-1.0.0-arm64.AppImage` | ARM64 Linux AppImage (Raspberry Pi 4/5, Asahi Linux, Pinebook) |
| **Linux** | `amd64` | `yt-veloce_1.0.0_amd64.deb` | Debian / Ubuntu / Linux Mint package |
| **Linux** | `arm64` | `yt-veloce_1.0.0_arm64.deb` | Debian / Ubuntu ARM package |
| **Linux** | `x86_64` | `yt-veloce-1.0.0.x86_64.rpm` | Red Hat / Fedora / openSUSE package |
| **Linux** | `x86_64` | `yt-veloce-1.0.0-linux-x64.tar.gz` | Generic compressed Linux distribution |

---

## 🔐 Verifying SHA-256 Checksums

Every release asset has a corresponding `.sha256` checksum or blockmap to guarantee cryptographic integrity.

### On Windows (PowerShell)
```powershell
Get-FileHash -Algorithm SHA256 .\yt-veloce-1.0.0-x64-setup.exe
```
Or using Command Prompt:
```cmd
certutil -hashfile yt-veloce-1.0.0-x64-setup.exe SHA256
```

### On macOS (Terminal)
```bash
shasum -a 256 yt-veloce-1.0.0-arm64.dmg
```

### On Linux (Bash)
```bash
sha256sum yt-veloce-1.0.0-x86_64.AppImage
```

---

## 🛠️ Building Binaries Locally

### Windows Local Build
To compile the Windows installer and portable `.exe` on your local Windows PC:
```powershell
# 1. Compile Vite frontend and TypeScript main process
npm --prefix desktop run build

# 2. Package Windows 64-bit and 32-bit executables
npm --prefix desktop run package:win
```
The output installers will be placed in:
```
desktop/dist-release/
├── yt-veloce-1.0.0-x64-setup.exe
├── yt-veloce-1.0.0-ia32-setup.exe
├── yt-veloce-1.0.0-x64-portable.exe
└── yt-veloce-1.0.0-win-x64.zip
```

---

## 🌐 Automated GitHub Actions CI/CD Release

When creating a new public release for all platforms simultaneously:

### Option 1: Trigger via Git Release Tag
```bash
# Create a release tag
git tag -a v1.0.0 -m "Release v1.0.0: High-Velocity Desktop Media Engine"

# Push the tag to GitHub
git push origin v1.0.0
```
GitHub Actions will automatically spin up:
1. `windows-latest` runner -> builds Windows x64, ia32, arm64, and portable installers.
2. `macos-latest` runner -> builds Apple Silicon and Intel macOS `.dmg` packages.
3. `ubuntu-latest` runner -> builds Linux `.AppImage`, `.deb`, and `.rpm` packages.
4. Automatically attaches all binaries and checksums to the release at `https://github.com/vaelorix/yt-veloce/releases/tag/v1.0.0`.

### Option 2: Trigger Manually from GitHub Web UI
1. Go to your repository on GitHub: `https://github.com/vaelorix/yt-veloce/actions`.
2. Select the **Release yt-veloce Multi-Platform Binaries** workflow.
3. Click **Run workflow**, enter the version tag (e.g. `v1.0.0`), and submit.
