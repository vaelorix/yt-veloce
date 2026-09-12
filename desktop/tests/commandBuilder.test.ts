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

  it('should default to --no-playlist and support --yes-playlist', () => {
    const defaultResult = service.build({ url: 'https://www.youtube.com/watch?v=single&list=WL' });
    expect(defaultResult.args).toContain('--no-playlist');
    expect(defaultResult.args).not.toContain('--yes-playlist');

    const playlistResult = service.build({
      url: 'https://www.youtube.com/playlist?list=PL123',
      isPlaylist: true,
      playlistItems: '1-5'
    });
    expect(playlistResult.args).toContain('--yes-playlist');
    expect(playlistResult.args).toContain('--playlist-items');
    expect(playlistResult.args).toContain('1-5');
  });

  it('should include SponsorBlock, Aria2, and fragment acceleration flags', () => {
    const options: DownloadOptions = {
      url: 'https://www.youtube.com/watch?v=fast',
      concurrentFragments: 8,
      useAria2: true,
      sponsorBlockRemove: true,
      sponsorBlockCategories: 'sponsor,intro',
      splitChapters: true,
      maxResolution: '1080'
    };

    const result = service.build(options);

    expect(result.args).toContain('--concurrent-fragments');
    expect(result.args).toContain('8');
    expect(result.args).toContain('--downloader');
    expect(result.args).toContain('aria2c');
    expect(result.args).toContain('--sponsorblock-remove');
    expect(result.args).toContain('sponsor,intro');
    expect(result.args).toContain('--split-chapters');
    expect(result.args).toContain('-f');
    expect(result.command).toContain('height<=1080');
  });
});
