import { describe, it, expect, beforeAll } from 'vitest';
import { DatabaseService } from '../src/main/services/DatabaseService';
import { DownloadJob } from '../src/shared/types';

describe('DatabaseService SQLite Integration', () => {
  let db: DatabaseService;

  beforeAll(async () => {
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  it('should seed default presets', () => {
    const presets = db.getPresets();
    expect(presets.length).toBeGreaterThanOrEqual(5);
    
    const mp4Preset = presets.find((p) => p.id === 'yt-best-mp4');
    expect(mp4Preset).toBeDefined();
    expect(mp4Preset?.options.mergeOutputFormat).toBe('mp4');

    const mp3Preset = presets.find((p) => p.id === 'yt-audio-mp3');
    expect(mp3Preset).toBeDefined();
    expect(mp3Preset?.options.audioOnly).toBe(true);
  });

  it('should save, retrieve, and update a download job', () => {
    const testJob: DownloadJob = {
      id: 'test-job-1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      options: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      status: 'queued',
      progress: {
        percent: 0,
        downloadedBytes: 0,
        totalBytes: 1000,
        speed: '0 B/s',
        speedBytesPerSec: 0,
        eta: '--:--',
        etaSeconds: 0,
        statusText: 'Queued',
        stage: 'queued'
      },
      createdAt: Date.now(),
      logs: []
    };

    db.saveJob(testJob);
    const retrieved = db.getJob('test-job-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Rick Astley - Never Gonna Give You Up');

    // Update progress
    db.updateJobProgress(
      'test-job-1',
      {
        percent: 100,
        downloadedBytes: 1000,
        totalBytes: 1000,
        speed: 'Done',
        speedBytesPerSec: 0,
        eta: '00:00',
        etaSeconds: 0,
        statusText: 'Completed',
        stage: 'finished'
      },
      'completed'
    );

    const updated = db.getJob('test-job-1');
    expect(updated?.status).toBe('completed');
    expect(updated?.progress.percent).toBe(100);

    // Verify it appears in history
    const history = db.getHistory();
    expect(history.some((j) => j.id === 'test-job-1')).toBe(true);

    // Clean up
    db.deleteJob('test-job-1');
    expect(db.getJob('test-job-1')).toBeNull();
  });

  it('should retrieve and save settings', () => {
    const initialSettings = db.getSettings();
    expect(initialSettings.defaultPresetId).toBe('yt-best-mp4');

    db.saveSettings({ maxConcurrentDownloads: 4 });
    const updatedSettings = db.getSettings();
    expect(updatedSettings.maxConcurrentDownloads).toBe(4);
  });
});
