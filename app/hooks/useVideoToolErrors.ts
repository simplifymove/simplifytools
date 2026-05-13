/**
 * React Hook for Video Tool Error Handling
 * Manages error state, user messages, and integrates with error reporting
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToolError, VideoToolErrorType, EmailErrorReport } from '@/app/utils/types/errors';
import { createToolError, handleToolError } from '@/app/utils/error-handling/error-handler';

export interface UseVideoToolErrorsOptions {
  toolId: string;
  toolName: string;
  onError?: (error: ToolError) => void;
  onClear?: () => void;
}

export interface UseVideoToolErrorsReturn {
  error: ToolError | null;
  errorMessage: string;
  isError: boolean;
  setError: (error: ToolError | null) => void;
  createAndHandleError: (
    type: VideoToolErrorType,
    details?: Record<string, any>,
    fileMeta?: ToolError['fileMeta'],
    customUserMessage?: string
  ) => void;
  clearError: () => void;
  reportError: (error: ToolError) => Promise<void>;
}

/**
 * Hook for managing video tool errors
 */
export function useVideoToolErrors(options: UseVideoToolErrorsOptions): UseVideoToolErrorsReturn {
  const [error, setError] = useState<ToolError | null>(null);
  const [isSending, setIsSending] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-clear error after 8 seconds if no interaction
  useEffect(() => {
    if (error) {
      errorTimeoutRef.current = setTimeout(() => {
        // Only auto-clear if it's not critical
        if (error.type !== VideoToolErrorType.PROCESSING_TIMEOUT &&
            error.type !== VideoToolErrorType.MEMORY_ERROR) {
          clearError();
        }
      }, 8000);
    }

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [error]);

  const clearError = useCallback(() => {
    setError(null);
    options.onClear?.();
  }, [options]);

  const createAndHandleError = useCallback(
    (
      type: VideoToolErrorType,
      details?: Record<string, any>,
      fileMeta?: ToolError['fileMeta'],
      customUserMessage?: string
    ) => {
      const newError = createToolError(type, options.toolId, options.toolName, details, fileMeta, customUserMessage);
      setError(newError);
      options.onError?.(newError);

      // Don't wait for reporting, just fire and forget
      handleToolError(newError, {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }).catch((err) => {
        console.error('Error during error handling:', err);
      });
    },
    [options]
  );

  const reportError = useCallback(async (toolError: ToolError) => {
    setIsSending(true);
    try {
      await handleToolError(toolError, {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    error,
    errorMessage: error?.userFriendlyMessage || '',
    isError: !!error,
    setError,
    createAndHandleError,
    clearError,
    reportError,
  };
}

/**
 * Hook for managing multiple file validation errors
 */
export interface FileValidationError {
  fileIndex?: number;
  filename?: string;
  message: string;
}

export interface UseFileValidationReturn {
  validationErrors: FileValidationError[];
  addError: (error: FileValidationError) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

export function useFileValidation(): UseFileValidationReturn {
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);

  const addError = useCallback((error: FileValidationError) => {
    setValidationErrors((prev) => [...prev, error]);
  }, []);

  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    validationErrors,
    addError,
    clearErrors,
    hasErrors: validationErrors.length > 0,
  };
}

/**
 * Hook for managing processing state
 */
export interface UseProcessingStateReturn {
  isLoading: boolean;
  progress: number;
  status: string;
  startProcessing: (statusMessage: string) => void;
  updateProgress: (progress: number, statusMessage?: string) => void;
  stopProcessing: () => void;
}

export function useProcessingState(): UseProcessingStateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const startProcessing = useCallback((statusMessage: string) => {
    setIsLoading(true);
    setProgress(0);
    setStatus(statusMessage);
  }, []);

  const updateProgress = useCallback((newProgress: number, statusMessage?: string) => {
    setProgress(Math.min(newProgress, 100));
    if (statusMessage) setStatus(statusMessage);
  }, []);

  const stopProcessing = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setStatus('');
  }, []);

  return {
    isLoading,
    progress,
    status,
    startProcessing,
    updateProgress,
    stopProcessing,
  };
}

/**
 * Hook for managing drag-and-drop state
 */
export interface UseDragDropReturn {
  isDragging: boolean;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => FileList | null;
}

export function useDragDrop(): UseDragDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragCountRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);
    return e.dataTransfer.files || null;
  }, []);

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
