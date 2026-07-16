/**
 * API Route: Report Image Tool Errors
 * Server-side endpoint for error reporting with SMTP integration
 * Mirrors video tools error reporting pattern
 */

import { NextRequest } from 'next/server';
import { handleImageToolErrorReport } from '@/app/utils/error-reporting/handle-image-error-report';

/**
 * POST /api/image-tools/report-error
 * Handle error reporting from image tools
 * Client sends structured error, server reports via SMTP with debouncing
 */
export async function POST(request: NextRequest) {
  return handleImageToolErrorReport(request);
}
