import { app, BrowserWindow } from 'electron';
import path from 'path';
import { DatabaseService } from './services/DatabaseService';
import { YtDlpService } from './services/YtDlpService';
import { FFmpegService } from './services/FFmpegService';
import { DownloadManager } from './services/DownloadManager';
import { LoggingService } from './services/LoggingService';
import { registerIpcHandlers } from './ipc/registerIpcHandlers';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  const logger = LoggingService.getInstance();
  logger.info('system', 'Starting yt-dlp Professional Desktop GUI...');

  // Initialize Core Services
  const db = DatabaseService.getInstance();
  await db.initialize();

  const settings = db.getSettings();
  const ytdlp = YtDlpService.getInstance();
  await ytdlp.detect(settings.customYtDlpPath);

  const ffmpeg = FFmpegService.getInstance();
  await ffmpeg.detect(settings.customFFmpegPath);

  const downloadManager = DownloadManager.getInstance();
  await downloadManager.initialize();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1000,
    minHeight: 650,
    backgroundColor: '#090d16',
    title: 'yt-dlp Desktop Control Center',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  registerIpcHandlers(mainWindow);

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    // Ensure the URL ends with a trailing slash so Vite serves index.html
    const normalizedUrl = devUrl.endsWith('/') ? devUrl : devUrl + '/';
    await mainWindow.loadURL(normalizedUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
