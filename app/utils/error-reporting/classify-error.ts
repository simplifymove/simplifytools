import {
  ErrorReportDiagnostics,
  ErrorReportSource,
  IMAGE_ERROR_REPORTING_EXCLUSIONS,
  ImageToolErrorType,
  VideoToolErrorType,
} from '@/app/utils/types/errors';

const DEFAULT_ENDPOINTS: Record<string, string> = {
  'blur-background': '/api/blur-background',
  'image-to-text': '/api/pdf',
  'gif-to-mp4': '/api/media/convert',
};

function safeText(value: unknown, maxLength = 500): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value
    .replace(/(?:[A-Za-z]:[\\/]|\/(?:var\/www|tmp|home|root|opt|srv)\/)[^\s"']+/g, '[REDACTED_PATH]')
    .replace(/(authorization|api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .slice(0, maxLength);
}

function numericStatus(value: unknown): number | undefined {
  const status = Number(value);
  return Number.isInteger(status) && status >= 100 && status <= 599 ? status : undefined;
}

export interface ErrorClassificationInput {
  toolId: string;
  reportedType?: string;
  errorMessage?: string;
  details?: Record<string, unknown>;
  diagnostics?: Partial<ErrorReportDiagnostics>;
}

export function classifyErrorReport(input: ErrorClassificationInput): {
  source: ErrorReportSource;
  diagnostics: ErrorReportDiagnostics;
} {
  const details = input.details || {};
  const endpoint = safeText(input.diagnostics?.endpoint || details.endpoint || DEFAULT_ENDPOINTS[input.toolId], 200);
  const apiStatus = numericStatus(input.diagnostics?.apiStatus ?? details.apiStatus ?? details.status);
  const backendErrorCode = safeText(input.diagnostics?.backendErrorCode || details.backendErrorCode || details.errorCode || details.code, 100);
  const stderrSummary = safeText(input.diagnostics?.stderrSummary || details.stderr || details.error || details.errorMessage);
  const combined = [input.reportedType, input.errorMessage, backendErrorCode, stderrSummary, endpoint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const reportedImageType = input.reportedType as ImageToolErrorType;
  const validationType = IMAGE_ERROR_REPORTING_EXCLUSIONS.includes(reportedImageType);
  const routeFailure = /unknown tool|unknown route|route not found|endpoint not found|no route|\b404\b/.test(combined)
    || (input.toolId === 'image-to-text' && input.reportedType === ImageToolErrorType.SHARP_FAILED);

  let source: ErrorReportSource;
  if (routeFailure) {
    source = ErrorReportSource.API_ROUTE_ERROR;
  } else if (validationType || [400, 413, 415, 422].includes(apiStatus || 0)) {
    source = ErrorReportSource.VALIDATION_FAILED;
  } else if (input.reportedType === VideoToolErrorType.FFMPEG_FAILED || /ffmpeg|ffprobe|media\/convert|gif-to-mp4/.test(combined)) {
    source = ErrorReportSource.FFMPEG_FAILED;
  } else if (input.reportedType === ImageToolErrorType.OCR_FAILED || /\bocr\b|tesseract|text recognition/.test(combined)) {
    source = ErrorReportSource.OCR_FAILED;
  } else if (/\bsharp\b|vips/.test(combined)) {
    source = ErrorReportSource.SHARP_FAILED;
  } else if (/provider|upstream|quota|api key|openrouter|replicate|remove\.bg/.test(combined)) {
    source = ErrorReportSource.PROVIDER_FAILED;
  } else if (endpoint?.startsWith('/api/') && apiStatus && apiStatus >= 500 && /route|handler|api/.test(combined)) {
    source = ErrorReportSource.API_ROUTE_ERROR;
  } else {
    source = ErrorReportSource.CONVERSION_FAILED;
  }

  return {
    source,
    diagnostics: { apiStatus, endpoint, backendErrorCode, stderrSummary },
  };
}
