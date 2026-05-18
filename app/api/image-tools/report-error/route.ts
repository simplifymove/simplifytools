/**
 * API Route: Report Image Tool Errors
 * Server-side endpoint for error reporting with SMTP integration
 * Mirrors video tools error reporting pattern
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendErrorEmail } from '@/app/utils/error-reporting/send-error-email';
import { EmailErrorReport } from '@/app/utils/types/errors';

/**
 * POST /api/image-tools/report-error
 * Handle error reporting from image tools
 * Client sends structured error, server reports via SMTP with debouncing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.toolId || !body.toolName || !body.errorType) {
      return NextResponse.json(
        { error: 'Missing required fields: toolId, toolName, errorType' },
        { status: 400 }
      );
    }

    // Construct error report for email
    const errorReport: EmailErrorReport = {
      toolId: body.toolId,
      toolName: body.toolName,
      errorType: body.errorType,
      errorMessage: body.errorMessage || 'Unknown error',
      userMessage: body.userMessage || body.errorMessage || 'An error occurred',
      url: body.url || 'Unknown URL',
      timestamp: body.timestamp || new Date().toISOString(),
      fileMeta: body.fileMeta ? {
        filename: body.fileMeta.filename || 'unknown',
        size: body.fileMeta.size || 'unknown',
        mimeType: body.fileMeta.mimeType || 'unknown',
        width: body.fileMeta.width,
        height: body.fileMeta.height,
      } : undefined,
      systemInfo: body.systemInfo || {
        userAgent: request.headers.get('user-agent') || 'unknown',
        platform: 'web',
      },
      stackTrace: body.stackTrace,
    };

    // Send error email with debouncing (returns false if debounced)
    const emailSent = await sendErrorEmail(errorReport);

    return NextResponse.json(
      {
        success: true,
        message: emailSent ? 'Error reported successfully' : 'Error debounced (duplicate)',
        debounced: !emailSent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Error Reporting API] Failed to process error report:', error);

    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}
