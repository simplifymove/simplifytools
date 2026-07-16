/**
 * Error Email Reporting Service
 * Sends error notifications to info@simplifyconvert.com using existing SMTP
 * Supports both video and image tools
 * Includes debouncing to prevent spam
 */

import nodemailer from 'nodemailer';
import {
  EmailErrorReport,
  VideoToolErrorType,
  ImageToolErrorType,
  ERROR_REPORTING_CONFIG,
  IMAGE_ERROR_REPORTING_EXCLUSIONS,
} from '@/app/utils/types/errors';

// In-memory store for debouncing (in production, use Redis or database)
const errorLog = new Map<string, { count: number; lastTime: number }>();

const DEBOUNCE_KEY_PREFIX = 'tool-error-';

/**
 * Get nodemailer transporter instance
 * Reuses existing SMTP configuration from Contact form
 */
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Generate a debounce key for error deduplication
 */
function getDebounceKey(toolId: string, errorType: string): string {
  return `${DEBOUNCE_KEY_PREFIX}${toolId}-${errorType}`;
}

/**
 * Check if error should be debounced
 */
function shouldDebounceError(toolId: string, errorType: string): boolean {
  // Check if this is a video tool validation error
  const isVideoValidationError = Object.values(VideoToolErrorType).includes(
    errorType as VideoToolErrorType
  ) && ERROR_REPORTING_CONFIG.excludeFromReporting.includes(errorType as VideoToolErrorType);

  // Check if this is an image tool validation error
  const isImageValidationError = Object.values(ImageToolErrorType).includes(
    errorType as ImageToolErrorType
  ) && IMAGE_ERROR_REPORTING_EXCLUSIONS.includes(errorType as ImageToolErrorType);

  // Don't send email for validation errors
  if (isVideoValidationError || isImageValidationError) {
    return true;
  }

  const key = getDebounceKey(toolId, errorType);
  const now = Date.now();
  const lastError = errorLog.get(key);

  if (!lastError) {
    // First time seeing this error
    errorLog.set(key, { count: 1, lastTime: now });
    return false;
  }

  // Check if within debounce window
  const timeSinceLastError = now - lastError.lastTime;
  if (timeSinceLastError < ERROR_REPORTING_CONFIG.debounceMs) {
    lastError.count++;
    return true;
  }

  // Check if we've sent too many emails for this error in the last hour
  if (lastError.count > ERROR_REPORTING_CONFIG.maxDuplicatesPerHour) {
    return true;
  }

  // Reset counter and update timestamp
  errorLog.set(key, { count: 1, lastTime: now });
  return false;
}

/**
 * Format file metadata for email display
 */
function formatFileMetadata(fileMeta?: EmailErrorReport['fileMeta']): string {
  if (!fileMeta) return 'Not provided';

  const parts = [
    `Name: ${fileMeta.filename}`,
    `Size: ${fileMeta.size}`,
    `Type: ${fileMeta.mimeType}`,
  ];

  if (fileMeta.duration) {
    parts.push(`Duration: ${fileMeta.duration}`);
  }

  return parts.join('<br/>');
}

/**
 * Format system info for email display
 */
function formatSystemInfo(systemInfo?: EmailErrorReport['systemInfo']): string {
  if (!systemInfo) return 'Not provided';

  const parts = [
    `Platform: ${systemInfo.platform}`,
    `User Agent: ${systemInfo.userAgent?.substring(0, 100)}...`,
  ];

  if (systemInfo.isLoggedIn !== undefined) {
    parts.push(`Logged In: ${systemInfo.isLoggedIn ? 'Yes' : 'No'}`);
  }

  return parts.join('<br/>');
}

/**
 * Main function to send error email
 * Returns true if email was sent, false if debounced
 */
export async function sendErrorEmail(errorReport: EmailErrorReport): Promise<boolean> {
  try {
    // Check if error should be debounced
    if (shouldDebounceError(errorReport.toolId, errorReport.errorType)) {
      console.log(`[Error Reporting] Debounced error: ${errorReport.toolId} - ${errorReport.errorType}`);
      return false;
    }

    const transporter = getTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { 
              background: linear-gradient(to right, #ef4444, #dc2626);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
            }
            .content { background: #f9fafb; padding: 20px; }
            .section { background: white; padding: 16px; margin-bottom: 16px; border-radius: 6px; }
            .section-title { font-weight: bold; color: #1f2937; margin-bottom: 8px; border-bottom: 2px solid #ef4444; padding-bottom: 8px; }
            .field { margin-bottom: 12px; }
            .field-label { font-weight: bold; color: #374151; }
            .field-value { color: #6b7280; font-family: monospace; word-break: break-all; }
            .error-type { 
              display: inline-block;
              background: #fee2e2;
              color: #991b1b;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: bold;
            }
            .footer { 
              color: #9ca3af; 
              font-size: 12px; 
              border-top: 1px solid #e5e7eb;
              padding-top: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🚨 SimplifyConvert Error Report</h1>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">Error Details</div>
                <div class="field">
                  <div class="field-label">Tool:</div>
                  <div class="field-value">${escapeHtml(errorReport.toolName)} (${escapeHtml(errorReport.toolId)})</div>
                </div>
                <div class="field">
                  <div class="field-label">Error Type:</div>
                  <div class field-value><span class="error-type">${escapeHtml(errorReport.errorType)}</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Message:</div>
                  <div class="field-value">${escapeHtml(errorReport.errorMessage)}</div>
                </div>
                <div class="field">
                  <div class="field-label">User Message:</div>
                  <div class="field-value">${escapeHtml(errorReport.userMessage)}</div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">File Metadata</div>
                <div class="field-value">${formatFileMetadata(errorReport.fileMeta)}</div>
              </div>

              <div class="section">
                <div class="section-title">System Information</div>
                <div class="field-value">${formatSystemInfo(errorReport.systemInfo)}</div>
              </div>

              <div class="section">
                <div class="section-title">Request Details</div>
                <div class="field">
                  <div class="field-label">URL:</div>
                  <div class="field-value">${escapeHtml(errorReport.url)}</div>
                </div>
                <div class="field">
                  <div class="field-label">Timestamp:</div>
                  <div class="field-value">${escapeHtml(errorReport.timestamp)}</div>
                </div>
              </div>

              ${errorReport.diagnostics ? `
                <div class="section">
                  <div class="section-title">Backend Diagnostics</div>
                  <div class="field-value">Endpoint: ${escapeHtml(errorReport.diagnostics.endpoint || 'unknown')}</div>
                  <div class="field-value">HTTP Status: ${escapeHtml(String(errorReport.diagnostics.apiStatus || 'unknown'))}</div>
                  <div class="field-value">Backend Code: ${escapeHtml(errorReport.diagnostics.backendErrorCode || 'unknown')}</div>
                  <div class="field-value">stderr: ${escapeHtml(errorReport.diagnostics.stderrSummary || 'not provided')}</div>
                </div>
              ` : ''}

              ${errorReport.stackTrace ? `
                <div class="section">
                  <div class="section-title">Stack Trace</div>
                  <div class="field-value" style="font-size: 12px; max-height: 300px; overflow: auto; background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 4px;">
                    ${escapeHtml(errorReport.stackTrace)}
                  </div>
                </div>
              ` : ''}

              <div class="footer">
                <p>This is an automated error report from SimplifyConvert. Priority: HIGH</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: 'info@simplifyconvert.com',
      subject: `[SimplifyConvert Error] ${errorReport.toolName} - ${errorReport.errorType}`,
      html: htmlContent,
      replyTo: 'support@simplifyconvert.com',
    });

    console.log(`[Error Reporting] Email sent for: ${errorReport.toolId} - ${errorReport.errorType}`);
    return true;
  } catch (error) {
    // Log but don't throw - we don't want email failures to break the app
    console.error('[Error Reporting] Failed to send error email:', error);
    return false;
  }
}

/**
 * Escape HTML to prevent injection (server-safe, no DOM dependency)
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Clean up old error logs (call periodically to prevent memory leak)
 */
export function cleanupOldErrors(maxAgeMs: number = 3600000): void {
  const now = Date.now();
  const entries = Array.from(errorLog.entries());

  for (const [key, value] of entries) {
    if (now - value.lastTime > maxAgeMs) {
      errorLog.delete(key);
    }
  }

  console.log(`[Error Reporting] Cleaned up error logs. Remaining: ${errorLog.size}`);
}
