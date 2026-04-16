import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface DownloadRequest {
  url: string;
}

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
    'application/zip': 'zip',
    'audio/mpeg': 'mp3',
  };

  if (contentType && contentTypeMap[contentType]) {
    return contentTypeMap[contentType];
  }

  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const ext = pathname.split('.').pop()?.toLowerCase();

  if (ext && ext.length < 6) {
    return ext;
  }

  return 'file';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileName(url: string, contentType: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const name = pathname.split('/').pop();

  if (name && name.includes('.')) {
    return name;
  }

  const ext = getFileExtension(contentType, url);
  const timestamp = Date.now();
  return `download_${timestamp}.${ext}`;
}

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

function downloadWithYtDlp(url: string): Promise<{ filePath: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    // Create dedicated temp directory for this download (not system temp)
    let downloadDir: string;
    try {
      downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-download-'));
    } catch (err) {
      reject(new Error(`Failed to create temp directory: ${err instanceof Error ? err.message : String(err)}`));
      return;
    }

    try {
      const outputTemplate = path.join(downloadDir, `%(title)s.%(ext)s`);
      
      // CRITICAL FIX: Write URL to a UTF-8 text file instead of passing directly to spawn
      // This avoids Windows ByteString encoding errors with Unicode characters in URLs
      const urlFilePath = path.join(downloadDir, 'urls.txt');
      fs.writeFileSync(urlFilePath, url, 'utf-8');

      // CRITICAL: Convert Windows paths to use forward slashes
      // This prevents Windows from interpreting backslashes as escape sequences
      const outputTemplateFormatted = outputTemplate.replace(/\\/g, '/');
      const urlFilePathFormatted = urlFilePath.replace(/\\/g, '/');

      // Use --batch-file to read URLs from file (avoids encoding issues)
      const pythonExe = process.platform === 'win32' ? 'python' : '/usr/bin/python3';
      
      // Prepare environment with Python-specific variables
      const spawnEnv = {
        ...process.env,
        PYTHONDONTWRITEBYTECODE: '1',
        PYTHONHOME: '/usr',  // System Python home for VPS
      };
      
      const ytDlpProcess = spawn(pythonExe, [
        '-m',
        'yt_dlp',
        '-f',
        'best[ext=mp4]/best',
        '-o',
        outputTemplateFormatted,
        '--no-warnings',
        '--quiet',
        '--batch-file',
        urlFilePathFormatted,
      ], {
        env: spawnEnv,
      });

      let stdout = '';
      let stderr = '';

      ytDlpProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ytDlpProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ytDlpProcess.on('close', (code) => {
        if (code !== 0) {
          // Clean up on error
          try {
            fs.rmSync(downloadDir, { recursive: true, force: true });
          } catch (e) {
            // Ignore cleanup errors
          }
          reject(new Error(`yt-dlp failed with code ${code}: ${stderr || 'Unknown error'}`));
          return;
        }

        // Find the downloaded file (exclude urls.txt)
        try {
          const files = fs.readdirSync(downloadDir).filter(f => f !== 'urls.txt');
          
          if (files.length === 0) {
            fs.rmSync(downloadDir, { recursive: true, force: true });
            reject(new Error('No file was downloaded by yt-dlp'));
            return;
          }

          // Get the first downloaded file (usually the only one)
          const downloadedFileName = files[0];
          const filePath = path.join(downloadDir, downloadedFileName);

          resolve({
            filePath,
            fileName: downloadedFileName,
          });
        } catch (err) {
          try {
            fs.rmSync(downloadDir, { recursive: true, force: true });
          } catch (e) {
            // Ignore cleanup errors
          }
          reject(new Error(`Failed to find downloaded file: ${err instanceof Error ? err.message : String(err)}`));
        }
      });

      ytDlpProcess.on('error', (error) => {
        try {
          fs.rmSync(downloadDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
        reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
      });
    } catch (err) {
      try {
        fs.rmSync(downloadDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
      reject(new Error(`Setup error: ${err instanceof Error ? err.message : String(err)}`));
    }
  });
}

async function downloadDirectFile(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Unable to download file`);
  }

  const contentLength = response.headers.get('content-length');
  const fileSize = contentLength ? parseInt(contentLength) : 0;

  // 100MB limit
  if (fileSize > 100 * 1024 * 1024) {
    throw new Error('File size exceeds 100MB limit');
  }

  return await response.arrayBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const body: DownloadRequest = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // Validate URL
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log('[Download API] Processing URL:', urlObj.hostname);

    let buffer: ArrayBuffer;
    let fileName: string;
    let fileType: string = 'video/mp4';

    // Handle social media URLs with yt-dlp
    if (isSocialMediaUrl(url)) {
      console.log('[Download API] Detected social media URL, using yt-dlp');

      try {
        // Check if yt-dlp is available
        const pythonExe = process.platform === 'win32' ? 'python' : '/usr/bin/python3';
        
        // Prepare environment with Python-specific variables
        const spawnEnv = {
          ...process.env,
          PYTHONDONTWRITEBYTECODE: '1',
          PYTHONHOME: '/usr',  // System Python home for VPS
        };
        
        const ytDlpCheck = spawn(pythonExe, ['-m', 'yt_dlp', '--version'], {
          env: spawnEnv,
        });
        await new Promise<void>((resolve, reject) => {
          let checkComplete = false;
          ytDlpCheck.on('close', (code) => {
            checkComplete = true;
            if (code !== 0) reject(new Error('yt-dlp not installed'));
            else resolve();
          });
          ytDlpCheck.on('error', () => {
            if (!checkComplete) reject(new Error('yt-dlp not available'));
          });
          // Timeout after 5 seconds
          setTimeout(() => {
            if (!checkComplete) {
              ytDlpCheck.kill();
              reject(new Error('yt-dlp check timeout'));
            }
          }, 5000);
        });

        const { filePath, fileName: dlFileName } = await downloadWithYtDlp(url);
        fileName = dlFileName;
        const downloadDir = path.dirname(filePath);

        // Read the downloaded file
        buffer = await new Promise((resolve, reject) => {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              // Clean up temp directory on error
              try {
                fs.rmSync(downloadDir, { recursive: true, force: true });
              } catch (e) {
                // Ignore cleanup errors
              }
              reject(err);
            } else {
              // Clean up entire temp directory after reading
              try {
                fs.rmSync(downloadDir, { recursive: true, force: true });
              } catch (e) {
                // Ignore cleanup errors
              }
              resolve(data.buffer);
            }
          });
        });
      } catch (error) {
        console.log('[Download API] yt-dlp not available, falling back to direct download');
        // Fallback to direct download
        try {
          buffer = await downloadDirectFile(url);
          fileName = getFileName(url, fileType);
        } catch (directError) {
          throw new Error(
            'Unable to download from this URL. Social media downloads require yt-dlp, or try a direct file URL.'
          );
        }
      }
    } else {
      // Direct file download
      console.log('[Download API] Downloading file directly from URL');
      buffer = await downloadDirectFile(url);

      const response = await fetch(url, { method: 'HEAD' });
      fileType = response.headers.get('content-type') || 'application/octet-stream';
      fileName = getFileName(url, fileType);
    }

    const fileSizeFormatted = formatFileSize(buffer.byteLength);

    console.log('[Download API] Download successful');
    console.log('[Download API] File:', fileName);
    console.log('[Download API] Size:', fileSizeFormatted);

    console.log('[Download API] Successfully processed download');
    console.log('[Download API] File name:', fileName);
    console.log('[Download API] File size:', fileSizeFormatted);
    console.log('[Download API] File type:', fileType);

    // Return file directly as binary blob instead of embedding base64 in JSON
    // to avoid stack overflow errors with large files
    const response = new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('[Download API] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Download took too long. Please try again.' },
          { status: 408 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
