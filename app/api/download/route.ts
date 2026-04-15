import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Readable } from 'stream';

interface DownloadRequest {
  url: string;
}

// Helper to get file extension from content-type or URL
function getFileExtension(contentType: string, url: string): string {
  const contentTypeMap: { [key: string]: string } = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp4': 'm4a',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
  };

  if (contentType && contentTypeMap[contentType]) {
    return contentTypeMap[contentType];
  }

  // Try to extract from URL
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const ext = pathname.split('.').pop()?.toLowerCase();
  
  if (ext && ext.length < 6) {
    return ext;
  }

  return 'file';
}

// Helper to get file size in human readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Helper to get file name
function getFileName(url: string, contentType: string, contentDisposition?: string): string {
  // Try to get from Content-Disposition header
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=(?:(['"]).*?\1|[^;\n]*)/);
    if (match) {
      return match[0].split('=')[1].replace(/['"]/g, '');
    }
  }

  // Try to get from URL
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const name = pathname.split('/').pop();
  
  if (name && name.includes('.')) {
    return name;
  }

  // Generate name with extension
  const ext = getFileExtension(contentType, url);
  return `download.${ext}`;
}

// Detect if URL is from a social media platform
function isSocialMediaUrl(urlString: string): boolean {
  const socialPatterns = [
    /youtube\.com|youtu\.be/,
    /tiktok\.com/,
    /instagram\.com/,
    /facebook\.com|fb\.watch/,
    /twitter\.com|x\.com/,
    /dailymotion\.com/,
    /vimeo\.com/,
    /reddit\.com/,
  ];

  return socialPatterns.some((pattern) => pattern.test(urlString));
}

// Helper to get content type from file extension
function getContentTypeFromExt(ext: string): string {
  const extMap: { [key: string]: string } = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'mkv': 'video/x-matroska',
    'flv': 'video/x-flv',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'm4a': 'audio/mp4',
    'aac': 'audio/aac',
    'flac': 'audio/flac',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
  };

  return extMap[ext.toLowerCase()] || 'application/octet-stream';
}

export async function POST(request: NextRequest) {
  try {
    const body: DownloadRequest = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // For social media URLs, we would need external tools like yt-dlp
    // For now, return message that this requires special handling
    if (isSocialMediaUrl(url)) {
      console.log('[Download API] Social media URL detected:', urlObj.hostname);
      console.log('[Download API] Using yt-dlp for download...');

      try {
        // CRITICAL: Create temp directory in a location guaranteed to be ASCII-safe
        // Windows can have Unicode characters in temp paths - use a safer approach
        // Create temp dir using only numeric/ASCII filenames to avoid encoding issues
        const tempBaseName = 'dl_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        const tempDir = path.join(process.cwd(), '.downloads', tempBaseName);
        
        // Ensure .downloads directory exists
        const downloadsBaseDir = path.join(process.cwd(), '.downloads');
        if (!fs.existsSync(downloadsBaseDir)) {
          fs.mkdirSync(downloadsBaseDir, { recursive: true });
        }
        
        // Create download-specific temp directory
        fs.mkdirSync(tempDir, { recursive: true });

        try {
          // CRITICAL FIX: Use ASCII-only output filename to avoid ByteString encoding errors on Windows
          // yt-dlp tries to encode Unicode filenames through Windows cmd which requires single-byte characters
          // Solution: Use generic "output.ext" template and let yt-dlp handle the rename + metadata extraction
          // IMPORTANT: Convert backslashes to forward slashes for Windows path compatibility with yt-dlp
          // IMPORTANT: Do NOT use --batch-file as it can cause encoding issues. Pass URL directly as argument.
          // spawn() handles array arguments properly without encoding issues, even for Unicode URLs
          const outputTemplate = path.join(tempDir, 'output.%(ext)s').replace(/\\/g, '/');
          
          // CRITICAL: Use spawn() instead of execSync() with string commands
          // spawn() takes arguments as an array, avoiding ByteString encoding issues entirely
          // Pass URL directly as an argument - spawn handles Unicode properly in array args
          console.log('[Download API] Executing yt-dlp with output:', outputTemplate.substring(0, 50) + '...');
          
          // Use spawn with URL passed as a direct argument (no batch file)
          // This avoids file path encoding issues entirely
          // OPTIMIZATION: MAXIMUM SPEED - 32 parallel, minimal timeout, smallest format
          const ytdlpProcess = spawn('python', [
            '-m',
            'yt_dlp',
            // Format: Download smallest video file possible (even worse than worst)
            // Try: 144p video only → 240p → 360p, no audio
            '-f',
            'worst[ext=mp4]/bestvideo[height<=144][ext=mp4]/bestvideo[height<=240][ext=mp4]/worst',
            '-o',
            outputTemplate,
            // EXTREME SPEED: Maximum parallelization and minimum timeouts
            '--socket-timeout', '5',         // 5 sec socket timeout (ultra-aggressive)
            '--fragment-retries', '0',       // NO retries - fail instantly
            '--skip-unavailable-fragments',  // Skip any failed fragments
            '-N', '32',                      // 32 parallel connections (ULTRA MAX)
            '--buffer-size', '4096k',        // 4MB buffer for faster I/O
            '--http-chunk-size', '4096k',    // 4MB chunks for better throughput
            '--no-check-certificate',        // Skip SSL checks
            '--no-progress',                 // Don't show progress
            '--no-warnings',
            '--quiet',
            '--force-ipv4',                  // IPv4 only (faster on most networks)
            url,  // Pass URL directly - spawn handles it safely
          ]);

          // Promise wrapper for spawn
          await new Promise<void>((resolve, reject) => {
            let stderr = '';
            let lastProgressLog = Date.now();
            
            ytdlpProcess.stderr.on('data', (data) => {
              const output = data.toString();
              stderr += output;
              
              // Log progress every 5 seconds to show download is active
              const now = Date.now();
              if (now - lastProgressLog > 5000) {
                console.log('[Download API] Download in progress...');
                lastProgressLog = now;
              }
            });

            // Add timeout for massive files (30 minutes max for very large videos)
            let downloadTimeout: NodeJS.Timeout | null = null;

            ytdlpProcess.on('close', (code) => {
              if (downloadTimeout) clearTimeout(downloadTimeout);
              if (code !== 0) {
                reject(new Error(`yt-dlp failed: ${stderr || 'Unknown error'}`));
              } else {
                resolve();
              }
            });

            ytdlpProcess.on('error', (error) => {
              if (downloadTimeout) clearTimeout(downloadTimeout);
              reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
            });
            
            // Set timeout for very large downloads
            downloadTimeout = setTimeout(() => {
              ytdlpProcess.kill();
              reject(new Error('Download timeout: exceeded 30 minutes. File may be too large or network too slow.'));
            }, 30 * 60 * 1000); // 30 minutes
          });

          // Find the downloaded file (exclude info json files)
          const files = fs.readdirSync(tempDir).filter(f => 
            f.startsWith('output.') &&
            !f.endsWith('.info.json')
          );
          if (files.length === 0) {
            throw new Error('No file was downloaded by yt-dlp');
          }

          const downloadsFileName = files[0];
          const filePath = path.join(tempDir, downloadsFileName);

          // CRITICAL: Check file size WITHOUT loading entire file into memory
          // Use fs.statSync instead of fs.readFileSync for large files
          const fileStats = fs.statSync(filePath);
          const fileSize = fileStats.size;

          // Check file size (2GB limit for large videos)
          const maxSize = 2 * 1024 * 1024 * 1024; // 2GB limit
          if (fileSize > maxSize) {
            throw new Error(`File size ${formatFileSize(fileSize)} exceeds 2GB limit`);
          }

          const contentType = getContentTypeFromExt(path.extname(downloadsFileName).slice(1));
          
          // SPEED OPTIMIZATION: Skip metadata extraction (no --write-info-json)
          // Use downloaded filename directly without trying to extract video title
          // This saves time on file I/O and JSON parsing
          const displayFileName = downloadsFileName;

          console.log('[Download API] yt-dlp download successful');
          console.log('[Download API] File name:', displayFileName);
          console.log('[Download API] File size:', formatFileSize(fileSize));

          // Return file using streaming for large files
          try {
            // CRITICAL: Convert Unicode filename to RFC 5987 encoding for HTTP headers
            // HTTP headers must be ASCII, but we can use filename*= with UTF-8 encoding
            // This allows non-ASCII characters in the Content-Disposition header
            // Format: filename*=UTF-8''<percent-encoded-filename>
            const encodeFilename = (filename: string): string => {
              // Use encodeURIComponent for RFC 5987 encoding
              return encodeURIComponent(filename)
                .replace(/'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29');
            };
            
            // Create RFC 5987 encoded filename for the header
            const encodedFilename = encodeFilename(displayFileName);
            const contentDisposition = `attachment; filename*=UTF-8''${encodedFilename}`;
            
            // CRITICAL FIX: Use streaming for files to avoid loading entire file into memory
            // This allows fast downloads of large videos without memory issues
            const fileStream = fs.createReadStream(filePath);
            
            // Convert Node.js stream to Web Stream for Next.js Response API
            const webStream = Readable.toWeb(fileStream) as ReadableStream;
            
            // Schedule cleanup after streaming completes (after response is sent)
            // Use setImmediate to allow response to be sent first before cleanup
            fileStream.on('end', () => {
              setImmediate(() => {
                if (fs.existsSync(tempDir)) {
                  try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    console.log('[Download API] Temp directory cleaned up after stream:', tempDir);
                  } catch (e) {
                    console.warn('[Download API] Warning: Failed to cleanup after stream:', e instanceof Error ? e.message : String(e));
                  }
                }
              });
            });
            
            // Use standard Response for binary data instead of NextResponse
            const response = new Response(webStream, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': contentDisposition,
                'Content-Length': fileSize.toString(),
                // Speed optimizations
                'Accept-Ranges': 'bytes',                    // Allow browsers to resume downloads
                'Cache-Control': 'no-store, no-cache',       // Don't cache large files
                'X-Content-Type-Options': 'nosniff',         // Prevent MIME sniffing
              },
            });
            console.log('[Download API] Response created successfully, returning file stream');
            return response;
          } catch (responseError) {
            console.error('[Download API] Error creating response:', responseError);
            throw responseError;
          }
        } finally {
          // NOTE: Temp directory cleanup is now handled after streaming completes
          // (in the fileStream 'end' event handler) to avoid deleting files while downloading
          // Only cleanup here if an error occurred before streaming started
          if (fs.existsSync(tempDir)) {
            try {
              // Try to read the directory - if it still has the file, skip cleanup
              // (streaming is in progress and will cleanup after)
              const files = fs.readdirSync(tempDir);
              const videoFiles = files.filter(f => f.startsWith('output.') && !f.endsWith('.info.json'));
              
              // Only cleanup immediately if there are no video files (error case)
              if (videoFiles.length === 0) {
                fs.rmSync(tempDir, { recursive: true, force: true });
                console.log('[Download API] Temp directory cleaned up on error:', tempDir);
              }
            } catch (cleanupError) {
              // Silently ignore cleanup errors - streaming handler will cleanup
            }
          }
        }
      } catch (ytdlpError) {
        console.error('[Download API] yt-dlp error:', ytdlpError);
        const errorMessage = ytdlpError instanceof Error ? ytdlpError.message : 'Unknown error';
        return NextResponse.json(
          {
            error: `Failed to download from ${urlObj.hostname}. Make sure Python is in PATH and yt-dlp is installed. Error: ${errorMessage}`
          },
          { status: 400 }
        );
      }
    }

    // Attempt direct download
    console.log('[Download API] Attempting to download from:', url);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let downloadResponse;
    try {
      downloadResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!downloadResponse.ok) {
      console.error('[Download API] Download failed with status:', downloadResponse.status);
      return NextResponse.json(
        { error: `Unable to download file. Server returned ${downloadResponse.status}` },
        { status: 400 }
      );
    }

    const contentType = downloadResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = downloadResponse.headers.get('content-length');
    const contentDisposition = downloadResponse.headers.get('content-disposition');

    const fileSize = contentLength ? parseInt(contentLength) : 0;

    // Check file size limit (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // Get buffer from response
    const buffer = await downloadResponse.arrayBuffer();

    const fileName = getFileName(url, contentType, contentDisposition ?? undefined);
    const fileType = contentType;
    const fileSizeFormatted = formatFileSize(buffer.byteLength);

    console.log('[Download API] Successfully processed download');
    console.log('[Download API] File name:', fileName);
    console.log('[Download API] File size:', fileSizeFormatted);
    console.log('[Download API] File type:', fileType);

    // Return file directly as binary blob instead of embedding base64 in JSON
    // to avoid stack overflow errors with large files
    try {
      // Use standard Response for binary data instead of NextResponse
      const response = new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': fileType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': buffer.byteLength.toString(),
        },
      });
      console.log('[Download API] Direct download response created successfully');
      return response;
    } catch (responseError) {
      console.error('[Download API] Error creating direct download response:', responseError);
      throw responseError;
    }
  } catch (error) {
    console.error('[Download API] Error:', error);

    if (error instanceof Error) {
      // Check for timeout
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        return NextResponse.json(
          { error: 'Download took too long. Please try a different URL.' },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Failed to download file' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Helper function to cleanup old download directories (older than 1 hour)
async function cleanupOldDownloads() {
  try {
    const downloadsDir = path.join(process.cwd(), '.downloads');
    if (!fs.existsSync(downloadsDir)) {
      return;
    }

    const now = Date.now();
    const maxAge = 60 * 60 * 1000;  // 1 hour in milliseconds
    const dirs = fs.readdirSync(downloadsDir);

    for (const dir of dirs) {
      const dirPath = path.join(downloadsDir, dir);
      const stat = fs.statSync(dirPath);
      
      if (stat.isDirectory() && (now - stat.mtimeMs) > maxAge) {
        try {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log('[Download API] Cleaned up old directory:', dir);
        } catch (e) {
          console.warn('[Download API] Could not cleanup directory:', dir, e);
        }
      }
    }
  } catch (error) {
    console.warn('[Download API] Cleanup error:', error);
  }
}

// Run cleanup periodically (every 5 minutes)
setInterval(cleanupOldDownloads, 5 * 60 * 1000);
