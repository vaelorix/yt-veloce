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

  public build(options: DownloadOptions, defaultOutputDir?: string): CommandBuildResult {
    const args: string[] = [];
    const explanations: { flag: string; value?: string; description: string }[] = [];

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

    // Audio extraction
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
          description: `Specify audio format: ${options.audioFormat}`
        });
      }

      if (options.audioQuality) {
        args.push('--audio-quality', options.audioQuality);
        explanations.push({
          flag: '--audio-quality',
          value: options.audioQuality,
          description: `FFmpeg audio quality specification: ${options.audioQuality}`
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
        // Default to best video and audio
        args.push('-f', 'bv*+ba/b');
        explanations.push({
          flag: '-f, --format',
          value: 'bv*+ba/b',
          description: 'Download best video and best audio, falling back to best pre-merged format'
        });
      }

      // Merge output format
      if (options.mergeOutputFormat) {
        args.push('--merge-output-format', options.mergeOutputFormat);
        explanations.push({
          flag: '--merge-output-format',
          value: options.mergeOutputFormat,
          description: `If a merge is required, output to container format: ${options.mergeOutputFormat}`
        });
      }
    }

    // Embeddings
    if (options.embedThumbnail) {
      args.push('--embed-thumbnail');
      explanations.push({
        flag: '--embed-thumbnail',
        description: 'Embed thumbnail directly in the audio/video container'
      });
    }

    if (options.embedMetadata) {
      args.push('--embed-metadata');
      explanations.push({
        flag: '--embed-metadata',
        description: 'Embed metadata (title, artist, date, chapters) into video/audio container'
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
        description: 'Write automatically generated subtitle files if available'
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

    // Network & Authentication
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

    if (options.cookiesBrowser && options.cookiesBrowser.trim().length > 0) {
      args.push('--cookies-from-browser', options.cookiesBrowser.trim());
      explanations.push({
        flag: '--cookies-from-browser',
        value: options.cookiesBrowser.trim(),
        description: `Load session cookies from browser: ${options.cookiesBrowser.trim()}`
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
