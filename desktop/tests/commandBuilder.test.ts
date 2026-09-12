import { describe, it, expect } from 'vitest';
import { CommandBuilderService } from '../src/main/services/CommandBuilderService';
import { DownloadOptions } from '../src/shared/types';

describe('CommandBuilderService', () => {
  const service = CommandBuilderService.getInstance();

  it('should build default best video + audio command', () => {
    const options: DownloadOptions = {
      url: 'https://www.youtube.com/watch?v=test12345',
      outputDir: '/downloads'
    };

    const result = service.build(options);

    expect(result.args).toContain('-f');
    expect(result.args).toContain('bv*+ba/b');
    expect(result.args[result.args.length - 1]).toBe('https://www.youtube.com/watch?v=test12345');
    expect(result.command).toContain('yt-dlp');
    expect(result.command).toContain('bv*+ba/b');
  });

  it('should build audio extraction command when audioOnly is true', () => {
    const options: DownloadOptions = {
      url: 'https://www.youtube.com/watch?v=audio123',
      audioOnly: true,
      audioFormat: 'mp3',
      audioQuality: '0',
      embedThumbnail: true,
      embedMetadata: true
    };

    const result = service.build(options);

    expect(result.args).toContain('-x');
    expect(result.args).toContain('--audio-format');
    expect(result.args).toContain('mp3');
    expect(result.args).toContain('--audio-quality');
    expect(result.args).toContain('0');
    expect(result.args).toContain('--embed-thumbnail');
    expect(result.args).toContain('--embed-metadata');
  });

  it('should handle custom format expressions and subtitle embedding', () => {
    const options: DownloadOptions = {
      url: 'https://www.youtube.com/watch?v=custom',
      formatSelection: '137+140',
      mergeOutputFormat: 'mp4',
      embedSubtitles: true,
      subLanguages: 'en,es'
    };

    const result = service.build(options);

    expect(result.args).toContain('-f');
    expect(result.args).toContain('137+140');
    expect(result.args).toContain('--merge-output-format');
    expect(result.args).toContain('mp4');
    expect(result.args).toContain('--embed-subs');
    expect(result.args).toContain('--sub-langs');
    expect(result.args).toContain('en,es');
  });

  it('should include rate limiting and proxy when specified', () => {
    const options: DownloadOptions = {
      url: 'https://www.youtube.com/watch?v=rate',
      rateLimit: '2M',
      proxy: 'socks5://127.0.0.1:9050'
    };

    const result = service.build(options);

    expect(result.args).toContain('--limit-rate');
    expect(result.args).toContain('2M');
    expect(result.args).toContain('--proxy');
    expect(result.args).toContain('socks5://127.0.0.1:9050');
  });
});
