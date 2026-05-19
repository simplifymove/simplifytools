/**
 * Download API route with multi-provider support
 * POST /api/download
 * 
 * Request body:
 * {
 *   "url": "https://...",
 *   "formatId": "18" (optional)
 * }
 * 
 * Response:
 * - Success: Binary file with X-Download-Provider header
 * - Error: JSON with provider attempts
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProviderOrchestrator } from '@/app/lib/download/orchestrator';
import { DownloadConfig } from '@/app/lib/download/providers/types';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * Get download configuration from environment
 */
function getDownloadConfig(): DownloadConfig {
  const maxMB = parseInt(process.env.DOWNLOAD_MAX_MB || '500');
  const timeoutSeconds = parseInt(process.env.DOWNLOAD_TIMEOUT_SECONDS || '120');

  return {
    maxFileSizeMB: maxMB,
    timeoutSeconds: timeoutSeconds,
    enableCobalt: process.env.COBALT_ENABLED === 'true',
    cobaltUrl: process.env.COBALT_API_URL,
    cobaltKey: process.env.COBALT_API_KEY,
    enableYtDlp: process.env.YTDLP_ENABLED === 'true',
    enableGalleryDl: process.env.GALLERY_DL_ENABLED === 'true',
    enableExternalApi: process.env.DOWNLOADER_API_ENABLED === 'true',
    externalApiKey: process.env.DOWNLOADER_API_KEY,
    devMode: process.env.NODE_ENV === 'development',
  };
}

/**
 * Clean up temporary file
 */
function cleanupFile(filePath: string | undefined): void {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('[download] Cleanup error:', error);
  }
}

/**
 * POST /api/download
 */
export async function POST(request: NextRequest) {
  let tempFilePath: string | undefined;

  try {
    const body = await request.json();
    const { url, formatId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Get download config
    const config = getDownloadConfig();

    // Create orchestrator
    const orchestrator = new ProviderOrchestrator(config);

    // Attempt download
    console.log('[download] Starting download for:', new URL(url).hostname);
    const result = await orchestrator.download({
      url,
      formatId,
      maxFileSizeMB: config.maxFileSizeMB,
      timeoutSeconds: config.timeoutSeconds,
    });

    // Log attempts
    const attempts = orchestrator.getAttempts();
    if (config.devMode) {
      console.log('[download] Provider attempts:', JSON.stringify(attempts, null, 2));
    }

    // Handle failure
    if (!result.ok) {
      const statusCode = result.statusCode || 502;
      const errorResponse: any = {
        error: result.error || 'Download failed',
        message: result.message || 'Unable to download from any provider',
      };

      // Only include attempts in dev mode
      if (config.devMode) {
        errorResponse.attempts = attempts;
      } else {
        // In production, show user-friendly message
        errorResponse.message = 'This platform is temporarily blocking server downloads. Try another link or format.';
      }

      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // Success: return file
    tempFilePath = result.filePath;

    let fileBuffer: Buffer;
    if (result.buffer) {
      fileBuffer = result.buffer;
    } else if (result.filePath) {
      fileBuffer = fs.readFileSync(result.filePath);
    } else {
      return NextResponse.json(
        { error: 'No file data' },
        { status: 500 }
      );
    }

    // Create response with proper body type
    const response = new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.filename)}"`,
        'X-Download-Provider': result.provider,
        // Security headers
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'no-referrer',
      },
    });

    // Clean up if temp file
    if (tempFilePath) {
      cleanupFile(tempFilePath);
    }

    console.log(`[download] Success from ${result.provider}: ${result.filename} (${(result.fileSize / 1024 / 1024).toFixed(2)}MB)`);

    return response;
  } catch (error: any) {
    const message = error?.message || String(error);
    console.error('[download] Error:', message);

    cleanupFile(tempFilePath);

    return NextResponse.json(
      {
        error: 'Server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
