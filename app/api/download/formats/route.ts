import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

interface FormatRequest {
  url: string;
}

function isSocialMediaUrl(url: string): boolean {
  const socialMediaDomains = [
    'youtube.com', 'youtu.be',
    'tiktok.com', 'vm.tiktok.com',
    'instagram.com', 'instagr.am',
    'facebook.com', 'fb.com',
    'twitter.com', 'x.com',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'soundcloud.com',
    'spotify.com',
  ];

  try {
    const urlObj = new URL(url);
    return socialMediaDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FormatRequest = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Only for social media URLs
    if (!isSocialMediaUrl(url)) {
      return NextResponse.json(
        { 
          formats: [
            { 
              id: 'best', 
              quality: 'Default', 
              format: 'Best available format',
              resolution: 'Auto',
              displayLabel: 'Auto - (Best Available)'
            }
          ] 
        },
        { status: 200 }
      );
    }

    // Get formats from yt-dlp
    const pythonExe = process.env.PYTHON_PATH || (
      process.platform === 'win32' 
        ? 'python'
        : '/usr/bin/python3'
    );

    const result = await new Promise<string>((resolve, reject) => {
      const ytdlpArgs = [
        '-m',
        'yt_dlp',
        '--dump-json',
        '--js-runtimes', 'node',           // Use Node.js to solve YouTube JS challenges (CRITICAL for VPS)
      ];
      
      // Add cookies for authentication if available (helps with VPS/datacenter IPs)
      if (process.env.YTDLP_COOKIES_PATH) {
        ytdlpArgs.push('--cookies', process.env.YTDLP_COOKIES_PATH);
      }
      
      ytdlpArgs.push(url);
      
      const process_child = spawn(pythonExe, ytdlpArgs, {
        env: {
          ...process.env,
          PYTHONDONTWRITEBYTECODE: '1',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
      });

      let stdout = '';
      let stderr = '';
      let timeout: NodeJS.Timeout | null = null;

      process_child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process_child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process_child.on('close', (code) => {
        if (timeout) clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`yt-dlp failed: ${stderr || 'Unknown error'}`));
        } else {
          resolve(stdout);
        }
      });

      process_child.on('error', (error) => {
        if (timeout) clearTimeout(timeout);
        reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
      });

      // 15 second timeout
      timeout = setTimeout(() => {
        process_child.kill();
        reject(new Error('Format fetch timeout'));
      }, 15000);
    });

    // Parse JSON output
    const jsonOutput = JSON.parse(result);
    
    // Extract formats from the JSON output
    const formats = [];
    
    // Helper function to determine quality tier
    const getQualityTier = (height: number): string => {
      if (height >= 2160) return '4K';
      if (height >= 1440) return '2K';
      if (height >= 1080) return 'Full HD';
      if (height >= 720) return 'HD';
      if (height >= 480) return 'SD';
      return 'LQ';
    };
    
    if (jsonOutput.formats && Array.isArray(jsonOutput.formats)) {
      // Best format overall (auto-best)
      if (jsonOutput.format) {
        const bestHeight = jsonOutput.format.height || 0;
        const bestQuality = bestHeight > 0 ? getQualityTier(bestHeight) : 'Best';
        const bestDimensions = bestHeight > 0 ? `${bestHeight}p` : 'Auto';
        
        formats.push({
          id: 'best',
          quality: '⭐ Best Quality (Recommended)',
          format: `${jsonOutput.format.ext?.toUpperCase() || 'MP4'} - Video + Audio`,
          resolution: jsonOutput.format.resolution || 'Auto',
          filesize: jsonOutput.format.filesize_approx 
            ? `~${Math.round(jsonOutput.format.filesize_approx / 1024 / 1024)}MB`
            : 'Unknown',
          displayLabel: `${jsonOutput.format.ext?.toUpperCase() || 'MP4'} - (${bestDimensions} ${bestQuality})`,
        });
      }

      // Get ALL video resolutions - including video-only formats
      // Map to store best format for each resolution height
      const resolutionMap = new Map<number, any[]>();
      
      jsonOutput.formats.forEach((format: any) => {
        // Only video formats (can be video-only or video+audio)
        if (format.vcodec !== 'none' && format.height && format.height > 0) {
          const height = format.height;
          if (!resolutionMap.has(height)) {
            resolutionMap.set(height, []);
          }
          resolutionMap.get(height)!.push(format);
        }
      });

      // Sort by resolution descending and add to formats
      const sortedHeights = Array.from(resolutionMap.keys()).sort((a, b) => b - a);
      
      sortedHeights.forEach((height) => {
        const formatsForHeight = resolutionMap.get(height)!;
        
        // Prefer format with audio, but show video-only if that's all available
        let bestFormat = formatsForHeight.find((f: any) => f.acodec && f.acodec !== 'none');
        if (!bestFormat) {
          bestFormat = formatsForHeight[0]; // Fallback to video-only
        }
        
        // Pick the smallest file size for this resolution
        bestFormat = formatsForHeight.reduce((best: any, current: any) => {
          const bestSize = best.filesize_approx || Infinity;
          const currentSize = current.filesize_approx || Infinity;
          return currentSize < bestSize ? current : best;
        });

        const quality = getQualityTier(height);
        const ext = bestFormat.ext?.toUpperCase() || 'MP4';
        const hasAudio = bestFormat.acodec && bestFormat.acodec !== 'none';
        const fileSize = bestFormat.filesize_approx 
          ? `~${Math.round(bestFormat.filesize_approx / 1024 / 1024)}MB`
          : 'Unknown';
        const fps = bestFormat.fps ? ` ${bestFormat.fps}fps` : '';
        
        formats.push({
          id: bestFormat.format_id,
          quality: `📹 ${height}p${fps}`,
          format: `${ext} - ${hasAudio ? 'Video + Audio' : 'Video only'}`,
          resolution: `${height}p`,
          filesize: fileSize,
          displayLabel: `${ext} - (${height}p ${quality}) - ${fileSize}`,
        });
      });

      // Audio formats - show all available options
      const audioFormats = jsonOutput.formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
      if (audioFormats.length > 0) {
        // Group by bitrate to show multiple options
        const audioMap = new Map<string, any>();
        audioFormats.forEach((format: any) => {
          const bitrate = format.abr ? Math.round(format.abr) : 128;
          const bitrateKey = `${bitrate}K`;
          if (!audioMap.has(bitrateKey)) {
            audioMap.set(bitrateKey, []);
          }
          audioMap.get(bitrateKey)!.push(format);
        });
        
        // Sort by bitrate descending and add all audio options
        const sortedBitrates = Array.from(audioMap.keys())
          .sort((a, b) => parseInt(b) - parseInt(a));
        
        sortedBitrates.forEach((bitrate) => {
          const audioFormatsList = audioMap.get(bitrate)!;
          // Pick smallest file for this bitrate
          const audioFormat = audioFormatsList.reduce((best: any, current: any) => {
            const bestSize = best.filesize_approx || Infinity;
            const currentSize = current.filesize_approx || Infinity;
            return currentSize < bestSize ? current : best;
          });
          
          // Get extension - prefer MP3 if available, otherwise use actual extension
          const hasMp3 = audioFormatsList.some((f: any) => f.ext === 'mp3');
          const audioExt = hasMp3 ? 'MP3' : (audioFormat.ext?.toUpperCase() || 'M4A');
          const bestAudioForExt = hasMp3 
            ? audioFormatsList.find((f: any) => f.ext === 'mp3') || audioFormat
            : audioFormat;
          
          const fileSize = bestAudioForExt.filesize_approx 
            ? `~${Math.round(bestAudioForExt.filesize_approx / 1024 / 1024)}MB`
            : 'Unknown';
          
          formats.push({
            id: bestAudioForExt.format_id,
            quality: '🎵 Audio Only',
            format: `${audioExt} - Audio only`,
            resolution: 'N/A',
            filesize: fileSize,
            displayLabel: `${audioExt} - (${bitrate}) - ${fileSize}`,
          });
        });
        
        // Add MP3 option with best audio (if not already included)
        const bestAudio = audioFormats.reduce((best: any, current: any) => {
          return (current.abr || 0) > (best.abr || 0) ? current : best;
        });
        
        if (bestAudio && bestAudio.ext !== 'mp3') {
          const bestBitrate = bestAudio.abr ? Math.round(bestAudio.abr) : 192;
          const fileSize = bestAudio.filesize_approx 
            ? `~${Math.round(bestAudio.filesize_approx / 1024 / 1024)}MB`
            : 'Unknown';
          
          formats.push({
            id: `bestaudio[ext=m4a]/bestaudio`,
            quality: '🎵 Audio Only (MP3)',
            format: 'MP3 - Audio only',
            resolution: 'N/A',
            filesize: fileSize,
            displayLabel: `MP3 - (${bestBitrate}K) - ${fileSize}`,
          });
        }
      }
    }

    // If no formats found, return default
    if (formats.length === 0) {
      formats.push({
        id: 'best',
        quality: '⭐ Best Quality (Recommended)',
        format: 'Auto - Best available',
        resolution: 'Auto',
        displayLabel: 'MP4 - (Best Available)',
      });
    }

    return NextResponse.json({ formats }, { status: 200 });
  } catch (error) {
    console.error('[Download Formats API] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch formats',
        formats: [
          { 
            id: 'best', 
            quality: '⭐ Best Quality', 
            format: 'Default - Best available',
            resolution: 'Auto',
            displayLabel: 'MP4 - (Best Available)'
          }
        ]
      },
      { status: 200 } // Return 200 with default format as fallback
    );
  }
}
