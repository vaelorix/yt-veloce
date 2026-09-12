import { describe, it, expect } from 'vitest';
import { ProcessManager } from '../src/main/services/ProcessManager';

describe('ProcessManager Progress Parsing', () => {
  const manager = ProcessManager.getInstance();

  it('should parse structured [AGY_PROG] line', () => {
    // line format: [AGY_PROG] <downloadedBytes> <totalBytes> <speed> <eta> <status> <filename>
    const line = '[AGY_PROG] 52428800 104857600 5242880 10 downloading /downloads/video.mp4';
    
    // Access the private method for unit testing
    const parsed = (manager as any).parseStructuredProgress(line);

    expect(parsed).not.toBeNull();
    expect(parsed.percent).toBe(50);
    expect(parsed.downloadedBytes).toBe(52428800);
    expect(parsed.totalBytes).toBe(104857600);
    expect(parsed.eta).toBe('00:10');
    expect(parsed.statusText).toBe('Downloading');
    expect(parsed.filename).toBe('/downloads/video.mp4');
  });

  it('should parse fallback standard yt-dlp percent progress output', () => {
    const line = '[download]  45.2% of 120.50MiB at 4.20MiB/s ETA 00:15';
    
    const parsed = (manager as any).parseFallbackProgress(line);

    expect(parsed).not.toBeNull();
    expect(parsed.percent).toBe(45.2);
    expect(parsed.speed).toBe('4.20MiB/s');
    expect(parsed.eta).toBe('00:15');
    expect(parsed.statusText).toBe('Downloading');
  });

  it('should return null on non-progress lines', () => {
    const line = '[info] dQw4w9WgXcQ: Downloading webpage';
    const parsed = (manager as any).parseStructuredProgress(line);
    const fallback = (manager as any).parseFallbackProgress(line);

    expect(parsed).toBeNull();
    expect(fallback).toBeNull();
  });
});
