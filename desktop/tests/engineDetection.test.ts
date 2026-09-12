import { describe, it, expect } from 'vitest';
import { YtDlpService } from '../src/main/services/YtDlpService';
import { FFmpegService } from '../src/main/services/FFmpegService';
import { DependencyService } from '../src/main/services/DependencyService';

describe('Engine Detection Integration', () => {
  it('should detect local workspace yt-dlp', async () => {
    const service = YtDlpService.getInstance();
    const execInfo = await service.detect();

    expect(['workspace', 'system']).toContain(execInfo.source);
    expect(execInfo.version).toBe('2026.08.19');
    expect(execInfo.path).toBeDefined();
  });

  it('should check FFmpeg availability without crashing', async () => {
    const ffmpegService = FFmpegService.getInstance();
    const info = await ffmpegService.detect();

    expect(info).toBeDefined();
    expect(typeof info.available).toBe('boolean');
  });

  it('should detect system dependencies including AtomicParsley and Aria2', async () => {
    const depService = DependencyService.getInstance();
    const deps = await depService.getStatus();

    expect(deps.length).toBe(6);
    const ap = deps.find((d) => d.id === 'atomicparsley');
    const aria = deps.find((d) => d.id === 'aria2');
    expect(ap?.status).toBe('installed');
    expect(aria?.status).toBe('installed');
  });
});
