import { NextRequest, NextResponse } from 'next/server';
import { classifyErrorReport } from '@/app/utils/error-reporting/classify-error';
import { sendErrorEmail } from '@/app/utils/error-reporting/send-error-email';
import { EmailErrorReport } from '@/app/utils/types/errors';
import { isVerifiedAuditRequest } from '@/lib/security/audit-request';

export async function handleImageToolErrorReport(
  request: NextRequest,
  sendEmailFn: typeof sendErrorEmail = sendErrorEmail,
) {
  try {
    const auditRequest = isVerifiedAuditRequest(request.headers);
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      if (auditRequest) {
        console.warn('[Error Reporting] Truncated audit error report suppressed; primary failure remains in audit evidence');
        return NextResponse.json({ success: true, notificationSuppressed: true, source: 'AUDIT_EVIDENCE' }, { status: 202 });
      }
      throw error;
    }
    if (!body.toolId || !body.toolName || !body.errorType) {
      return NextResponse.json({ error: 'Missing required fields: toolId, toolName, errorType' }, { status: 400 });
    }

    const classification = classifyErrorReport({
      toolId: body.toolId,
      reportedType: body.errorType,
      errorMessage: body.errorMessage,
      details: body.details,
      diagnostics: body.diagnostics,
    });

    if (auditRequest) {
      console.warn('[Error Reporting] Audit failure recorded without user notification', {
        toolId: body.toolId,
        source: classification.source,
        ...classification.diagnostics,
      });
      return NextResponse.json({
        success: true,
        notificationSuppressed: true,
        source: classification.source,
        diagnostics: classification.diagnostics,
      }, { status: 202 });
    }

    const errorReport: EmailErrorReport = {
      toolId: body.toolId,
      toolName: body.toolName,
      errorType: classification.source,
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
      diagnostics: classification.diagnostics,
    };

    const emailSent = await sendEmailFn(errorReport);
    return NextResponse.json({
      success: true,
      message: emailSent ? 'Error reported successfully' : 'Error debounced (duplicate)',
      debounced: !emailSent,
    });
  } catch (error) {
    console.error('[Error Reporting API] Failed to process error report:', error);
    return NextResponse.json({ error: 'Failed to process error report' }, { status: 500 });
  }
}
