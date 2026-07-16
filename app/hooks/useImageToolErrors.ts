/**
 * useImageToolErrors Hook
 * Provides error handling state and utilities for image tools
 * Mirrors the video tools error hook pattern
 * Client-side only
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolError, ImageToolErrorType } from '@/app/utils/types/errors';
import { createImageToolError, handleImageToolError, parseImageApiError } from '@/app/utils/error-handling/image-error-handler';

export interface UseImageToolErrorsReturn {
  error: ToolError | null;
  isProcessing: boolean;
  clearError: () => void;
  setError: (error: ToolError) => void;
  createError: (
    type: ImageToolErrorType,
    toolId: string,
    toolName: string,
    details?: Record<string, any>,
    fileMeta?: ToolError['fileMeta'],
    customUserMessage?: string
  ) => ToolError;
  handleApiError: (response: any) => ToolError;
  handleFileUploadError: (file: File, errorType: ImageToolErrorType, toolId: string, toolName: string) => ToolError;
}

export function useImageToolErrors(): UseImageToolErrorsReturn {
  const [error, setErrorState] = useState<ToolError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const errorReportedRef = useRef<boolean>(false);

  const clearError = useCallback(() => {
    setErrorState(null);
    errorReportedRef.current = false;
  }, []);

  const setError = useCallback((err: ToolError) => {
    setErrorState(err);
    
    // Handle error logging and reporting
    handleImageToolError(err, {
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      isLoggedIn: false, // Update based on your auth state
    }).catch(e => {
      console.error('Failed to handle error:', e);
    });

    // Report error to server if it should be reported and hasn't been yet
    if (!errorReportedRef.current) {
      reportErrorToServer(err).catch(e => {
        console.error('Failed to report error:', e);
      });
      errorReportedRef.current = true;
    }
  }, []);

  const createError = useCallback(
    (
      type: ImageToolErrorType,
      toolId: string,
      toolName: string,
      details?: Record<string, any>,
      fileMeta?: ToolError['fileMeta'],
      customUserMessage?: string
    ): ToolError => {
      const newError = createImageToolError(type, toolId, toolName, details, fileMeta, customUserMessage);
      setError(newError);
      return newError;
    },
    [setError]
  );

  const handleApiError = useCallback(
    (response: any): ToolError => {
      const { type, message } = parseImageApiError(response);
      
      // Create error without toolId - should be passed separately
      const error: ToolError = {
        type,
        message,
        userFriendlyMessage: message,
        timestamp: new Date(),
        toolId: 'unknown',
        toolName: 'Image Tool',
        details: response,
      };

      setError(error);
      return error;
    },
    [setError]
  );

  const handleFileUploadError = useCallback(
    (file: File, errorType: ImageToolErrorType, toolId: string, toolName: string): ToolError => {
      const fileMeta = {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      };

      return createError(errorType, toolId, toolName, { file }, fileMeta);
    },
    [createError]
  );

  return {
    error,
    isProcessing,
    clearError,
    setError,
    createError,
    handleApiError,
    handleFileUploadError,
  };
}

/**
 * Report error to server for email notifications and monitoring
 * Server-side email reporting with debouncing
 */
async function reportErrorToServer(error: ToolError): Promise<void> {
  try {
    const details = error.details || {};
    const latestApiResource = typeof performance !== 'undefined'
      ? (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
          .slice()
          .reverse()
          .find((entry) => entry.name.includes('/api/') && !entry.name.includes('/api/image-tools/report-error'))
      : undefined;
    const observedStatus = Number((latestApiResource as PerformanceResourceTiming & { responseStatus?: number } | undefined)?.responseStatus);
    const observedEndpoint = latestApiResource
      ? (() => { try { return new URL(latestApiResource.name).pathname; } catch { return undefined; } })()
      : undefined;
    const response = await fetch('/api/image-tools/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId: error.toolId,
        toolName: error.toolName,
        errorType: error.type,
        errorMessage: error.message,
        userMessage: error.userFriendlyMessage,
        details: {
          endpoint: typeof details.endpoint === 'string' ? details.endpoint : observedEndpoint,
          apiStatus: typeof details.apiStatus === 'number' ? details.apiStatus : typeof details.status === 'number' ? details.status : Number.isInteger(observedStatus) && observedStatus > 0 ? observedStatus : undefined,
          backendErrorCode: typeof details.backendErrorCode === 'string' ? details.backendErrorCode : typeof details.code === 'string' ? details.code : undefined,
          stderr: typeof details.stderr === 'string' ? details.stderr : typeof details.error === 'string' ? details.error : undefined,
        },
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: error.timestamp.toISOString(),
        fileMeta: error.fileMeta ? {
          filename: error.fileMeta.filename,
          size: `${(error.fileMeta.size / 1024 / 1024).toFixed(2)}MB`,
          mimeType: error.fileMeta.mimeType,
          width: error.fileMeta.width?.toString(),
          height: error.fileMeta.height?.toString(),
        } : undefined,
        systemInfo: {
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
          platform: typeof window !== 'undefined' ? navigator.platform : 'unknown',
          isLoggedIn: false,
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to report error to server:', response.statusText);
    }
  } catch (err) {
    // Silently fail - don't break the app if error reporting fails
    console.error('Error reporting failed:', err);
  }
}
