import { DownloadOptions, CommandBuildResult } from '../../shared/types';
import path from 'path';

export class CommandBuilderService {
  private static instance: CommandBuilderService;

  private constructor() {}

  public static getInstance(): CommandBuilderService {
    if (!CommandBuilderService.instance) {
      CommandBuilderService.instance = new CommandBuilderService();
    }
    return CommandBuilderService.instance;
  }

  public build(options: DownloadOptions, defaultOutputDir?: string, ffmpegPath?: string): CommandBuildResult {
    const args: string[] = [];
    const explanations: { flag: string; value?: string; description: string }[] = [];

    // Explicit FFmpeg location if available and not purely 'ffmpeg'
    if (ffmpegPath && ffmpegPath.trim().length > 0 && ffmpegPath !== 'ffmpeg') {
      const loc = path.isAbsolute(ffmpegPath) ? path.dirname(ffmpegPath) : ffmpegPath;
      if (!options.customArgs?.some((a) => a.includes('--ffmpeg-location'))) {
        args.push('--ffmpeg-location', loc);
        explanations.push({
          flag: '--ffmpeg-location',
          value: loc,
          description: 'Location of FFmpeg & FFprobe multimedia binaries'
        });
      }
    }

    // Output template & directory
    const outputDir = options.outputDir || defaultOutputDir || '';
    const tmpl = options.filenameTemplate || '%(title)s [%(id)s].%(ext)s';
    const fullTemplate = outputDir ? path.join(outputDir, tmpl) : tmpl;

    args.push('-o', fullTemplate);
    explanations.push({
      flag: '-o',
      value: fullTemplate,
      description: 'Output filepath and filename template format'
    });

    // Playlist safety: protect against dumping entire Watch Later or user playlists
    if (options.isPlaylist === true) {
      args.push('--yes-playlist');
      explanations.push({
        flag: '--yes-playlist',
        description: 'Download the entire playlist if the URL contains a playlist'
      });
      if (options.playlistItems && options.playlistItems.trim().length > 0) {
        args.push('--playlist-items', options.playlistItems.trim());
        explanations.push({
          flag: '--playlist-items',
          value: options.playlistItems.trim(),
          description: `Specific playlist items to download: ${options.playlistItems.trim()}`
        });
      }
    } else {
      args.push('--no-playlist');
      explanations.push({
        flag: '--no-playlist',
        description: 'Download only the individual video, even if URL contains a playlist ID'
      });
    }

    // Download time sections / clip range
    if (options.downloadSections && options.downloadSections.trim().length > 0) {
      args.push('--download-sections', options.downloadSections.trim());
      explanations.push({
        flag: '--download-sections',
        value: options.downloadSections.trim(),
        description: `Download specific section of video: ${options.downloadSections.trim()}`
      });
    }

    // Audio extraction or Video stream format selection
    if (options.audioOnly) {
      args.push('-x');
      explanations.push({
        flag: '-x, --extract-audio',
        description: 'Convert video file to audio-only file'
      });

      if (options.audioFormat && options.audioFormat !== 'best') {
        args.push('--audio-format', options.audioFormat);
        explanations.push({
          flag: '--audio-format',
          value: options.audioFormat,
          description: `Specify audio extraction format: ${options.audioFormat}`
        });
      }

      if (options.audioQuality) {
        args.push('--audio-quality', options.audioQuality);
        explanations.push({
          flag: '--audio-quality',
          value: options.audioQuality,
          description: `Audio bitrate / quality: ${options.audioQuality}`
        });
      }
    } else {
      // Format selection
      if (options.formatSelection && options.formatSelection.trim().length > 0) {
        args.push('-f', options.formatSelection.trim());
        explanations.push({
          flag: '-f, --format',
          value: options.formatSelection.trim(),
          description: 'Custom video and audio format selector expression'
        });
      } else {
        // Build dynamic format selector from resolution and codec preferences
        let filterParts: string[] = [];
        if (options.maxResolution && options.maxResolution !== 'none') {
          filterParts.push(`height<=${options.maxResolution}`);
        }
        if (options.prefer60fps) {
          filterParts.push('fps<=60');
        }
        if (options.videoCodecPreference && options.videoCodecPreference !== 'any') {
          filterParts.push(`vcodec^=${options.videoCodecPreference}`);
        }

        let formatStr = 'bv*+ba/b';
        if (filterParts.length > 0) {
          const filter = `[${filterParts.join('][')}]`;
          formatStr = `bv*${filter}+ba/b${filter}`;
        }

        args.push('-f', formatStr);
        explanations.push({
          flag: '-f, --format',
          value: formatStr,
          description: 'Video and audio stream selector based on preferences'
        });
      }

      // Merge output format
      if (options.mergeOutputFormat) {
        args.push('--merge-output-format', options.mergeOutputFormat);
        explanations.push({
          flag: '--merge-output-format',
          value: options.mergeOutputFormat,
          description: `Container merge format: ${options.mergeOutputFormat}`
        });
      }
    }

    // Embeddings
    if (options.embedThumbnail) {
      args.push('--embed-thumbnail');
      explanations.push({
        flag: '--embed-thumbnail',
        description: 'Embed thumbnail directly into media container'
      });
    }

    if (options.embedMetadata) {
      args.push('--embed-metadata');
      explanations.push({
        flag: '--embed-metadata',
        description: 'Embed metadata (title, artist, date, chapters) into container'
      });
    }

    if (options.embedChapters) {
      args.push('--embed-chapters');
      explanations.push({
        flag: '--embed-chapters',
        description: 'Embed chapter markers into the media container'
      });
    }

    if (options.splitChapters) {
      args.push('--split-chapters');
      explanations.push({
        flag: '--split-chapters',
        description: 'Split video into separate files based on internal chapters'
      });
    }

    // SponsorBlock
    if (options.sponsorBlockRemove) {
      const cats = options.sponsorBlockCategories || 'sponsor,intro,outro,selfpromo';
      args.push('--sponsorblock-remove', cats);
      explanations.push({
        flag: '--sponsorblock-remove',
        value: cats,
        description: `Remove sponsor segments matching: ${cats}`
      });
    }

    if (options.sponsorBlockMark) {
      args.push('--sponsorblock-mark', 'all');
      explanations.push({
        flag: '--sponsorblock-mark',
        value: 'all',
        description: 'Create chapter markers for sponsor segments'
      });
    }

    // Subtitles
    if (options.embedSubtitles) {
      args.push('--embed-subs');
      explanations.push({
        flag: '--embed-subs',
        description: 'Embed downloaded subtitle tracks into the video file'
      });
    }

    if (options.writeSubtitles) {
      args.push('--write-subs');
      explanations.push({
        flag: '--write-subs',
        description: 'Write subtitle files to disk alongside media'
      });
    }

    if (options.writeAutoSubtitles) {
      args.push('--write-auto-subs');
      explanations.push({
        flag: '--write-auto-subs',
        description: 'Write automatically generated subtitle tracks'
      });
    }

    if (options.convertSubs && options.convertSubs !== 'none') {
      args.push('--convert-subs', options.convertSubs);
      explanations.push({
        flag: '--convert-subs',
        value: options.convertSubs,
        description: `Convert subtitle format to: ${options.convertSubs}`
      });
    }

    if (options.subLanguages && options.subLanguages.trim().length > 0) {
      args.push('--sub-langs', options.subLanguages.trim());
      explanations.push({
        flag: '--sub-langs',
        value: options.subLanguages.trim(),
        description: `Subtitle language filter: ${options.subLanguages.trim()}`
      });
    }

    // Artifacts
    if (options.writeThumbnail) {
      args.push('--write-thumbnail');
      explanations.push({
        flag: '--write-thumbnail',
        description: 'Write thumbnail image to file'
      });
    }

    if (options.writeDescription) {
      args.push('--write-description');
      explanations.push({
        flag: '--write-description',
        description: 'Write video description to a .description file'
      });
    }

    if (options.writeInfoJson) {
      args.push('--write-info-json');
      explanations.push({
        flag: '--write-info-json',
        description: 'Write video metadata to a .info.json file'
      });
    }

    // Network & Performance Acceleration
    if (options.concurrentFragments && options.concurrentFragments > 1) {
      args.push('--concurrent-fragments', String(options.concurrentFragments));
      explanations.push({
        flag: '--concurrent-fragments',
        value: String(options.concurrentFragments),
        description: `Multi-connection download threads: ${options.concurrentFragments}`
      });
    }

    if (options.useAria2) {
      args.push('--downloader', 'aria2c');
      args.push('--downloader-args', 'aria2c:-x 16 -s 16 -k 1M');
      explanations.push({
        flag: '--downloader aria2c',
        description: 'Accelerate download using external aria2c multi-connection engine'
      });
    }

    if (options.rateLimit && options.rateLimit.trim().length > 0) {
      args.push('--limit-rate', options.rateLimit.trim());
      explanations.push({
        flag: '--limit-rate',
        value: options.rateLimit.trim(),
        description: `Maximum download speed limit: ${options.rateLimit.trim()}`
      });
    }

    if (options.proxy && options.proxy.trim().length > 0) {
      args.push('--proxy', options.proxy.trim());
      explanations.push({
        flag: '--proxy',
        value: options.proxy.trim(),
        description: 'Route requests through HTTP/HTTPS/SOCKS proxy'
      });
    }

    // Authentication & Cookies
    if (options.cookiesBrowser && options.cookiesBrowser.trim().length > 0 && options.cookiesBrowser !== 'none') {
      args.push('--cookies-from-browser', options.cookiesBrowser.trim());
      explanations.push({
        flag: '--cookies-from-browser',
        value: options.cookiesBrowser.trim(),
        description: `Extract session cookies from browser: ${options.cookiesBrowser.trim()}`
      });
    }

    if (options.cookieFile && options.cookieFile.trim().length > 0) {
      args.push('--cookies', options.cookieFile.trim());
      explanations.push({
        flag: '--cookies',
        value: options.cookieFile.trim(),
        description: 'Load cookies from Netscape formatted text file'
      });
    }

    // Custom user arguments
    if (options.customArgs && Array.isArray(options.customArgs)) {
      for (const arg of options.customArgs) {
        if (arg && arg.trim().length > 0) {
          args.push(arg.trim());
          explanations.push({
            flag: arg.trim(),
            description: 'User-specified custom CLI argument'
          });
        }
      }
    }

    // URL is the final argument
    const url = options.url.trim();
    args.push(url);
    explanations.push({
      flag: 'URL',
      value: url,
      description: 'The target media, playlist, or webpage URL'
    });

    // Human-readable command display string
    const displayArgs = args.map((a) => {
      if (a.includes(' ') || a.includes('"') || a.includes('$') || a.includes('^')) {
        return `"${a.replace(/"/g, '\\"')}"`;
      }
      return a;
    });
    const command = `yt-dlp ${displayArgs.join(' ')}`;

    return {
      command,
      args,
      explanations
    };
  }
}
