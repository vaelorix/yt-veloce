import { describe, it, expect } from 'vitest';
import { YtDlpService } from '../src/main/services/YtDlpService';
import { FFmpegService } from '../src/main/services/FFmpegService';

describe('Engine Detection Integration', () => {
  it('should detect local workspace yt-dlp', async () => {
    const service = YtDlpService.getInstance();
    const execInfo = await service.detect();

    expect(execInfo.source).toBe('workspace');
    expect(execInfo.version).toBe('2026.08.19');
    expect(execInfo.path).toBeDefined();
  });

  it('should check FFmpeg availability without crashing', async () => {
    const ffmpegService = FFmpegService.getInstance();
    const info = await ffmpegService.detect();

    expect(info).toBeDefined();
    expect(typeof info.available).toBe('boolean');
  });
});
