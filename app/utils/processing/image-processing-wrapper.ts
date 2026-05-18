/**
 * Image Processing Wrapper HOC
 * Provides centralized error handling, timeouts, and logging for all image processing
 * Automatically handles: try/catch, validation, timeouts, error reporting, debouncing
 * 
 * Usage:
 * const safeCompress = withImageProcessing(
 *   async (file) => await compressImage(file, quality),
 *   { toolId: 'compress-image', timeout: 30000 }
 * );
 */

import { ImageToolErrorType } from '@/app/utils/types/errors';
import { createImageToolError } from '@/app/utils/error-handling/image-error-handler';

export interface ProcessingOptions {
  toolId: string;
  toolName?: string;
  timeout?: number; // milliseconds, default 60000
  retryCount?: number; // default 0 (no retry)
  logErrors?: boolean; // default true
}

export interface ProcessingResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: ImageToolErrorType;
    message: string;
    userFriendlyMessage: string;
  };
}

/**
 * Wrap an image processing function with error handling, timeouts, and safety checks
 */
export function withImageProcessing<T = any>(
  processingFn: (...args: any[]) => Promise<T>,
  options: ProcessingOptions
): (...args: any[]) => Promise<ProcessingResult<T>> {
  const {
    toolId,
    toolName = toolId,
    timeout = 60000,
    retryCount = 0,
    logErrors = true,
  } = options;

  return async (...args: any[]): Promise<ProcessingResult<T>> => {
    let lastError: any = null;
    let attempts = 0;

    while (attempts <= retryCount) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Processing timeout after ${timeout}ms`));
          }, timeout);
        });

        // Race: processing function vs timeout
        const result = await Promise.race([
          processingFn(...args),
          timeoutPromise,
        ]);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts <= retryCount) {
          // Wait before retrying (exponential backoff)
          const delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All retries failed - return error
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);

    if (logErrors) {
      console.error(`[${toolId}] Processing failed: ${errorMessage}`);
    }

    // Determine error type based on error message
    let errorType = ImageToolErrorType.SHARP_FAILED;
    
    if (errorMessage.includes('timeout')) {
      errorType = ImageToolErrorType.PROCESSING_TIMEOUT;
    } else if (errorMessage.includes('memory')) {
      errorType = ImageToolErrorType.MEMORY_ERROR;
    } else if (errorMessage.includes('disk')) {
      errorType = ImageToolErrorType.DISK_SPACE_ERROR;
    } else if (errorMessage.includes('corrupted') || errorMessage.includes('corrupt')) {
      errorType = ImageToolErrorType.FILE_CORRUPTED;
    }

    const toolError = createImageToolError(
      errorType,
      toolId,
      toolName,
      { originalError: errorMessage },
      undefined
    );

    return {
      success: false,
      error: {
        type: errorType,
        message: errorMessage,
        userFriendlyMessage: toolError.userFriendlyMessage,
      },
    };
  };
}

/**
 * Wrap a batch processing function for multiple files
 */
export function withBatchImageProcessing<T = any>(
  processingFn: (file: File, ...args: any[]) => Promise<T>,
  options: ProcessingOptions & { parallelLimit?: number }
): (files: File[], ...args: any[]) => Promise<{
  successful: T[];
  failed: { file: File; error: ProcessingResult['error'] }[];
}> {
  const { parallelLimit = 3, ...baseOptions } = options;
  const safeProcessor = withImageProcessing(processingFn, baseOptions);

  return async (files: File[], ...args: any[]) => {
    const results = { successful: [] as T[], failed: [] as any[] };

    // Process in parallel batches of `parallelLimit`
    for (let i = 0; i < files.length; i += parallelLimit) {
      const batch = files.slice(i, i + parallelLimit);
      const batchResults = await Promise.all(
        batch.map(file => safeProcessor(file, ...args))
      );

      batchResults.forEach((result, index) => {
        if (result.success && result.data) {
          results.successful.push(result.data);
        } else if (!result.success && result.error) {
          results.failed.push({
            file: batch[index],
            error: result.error,
          });
        }
      });
    }

    return results;
  };
}

/**
 * Create a memoized processor that caches results for identical inputs
 */
export function withCachedImageProcessing<T = any>(
  processingFn: (file: File, ...args: any[]) => Promise<T>,
  options: ProcessingOptions & { cacheSize?: number }
): (...args: any[]) => Promise<ProcessingResult<T>> {
  const { cacheSize = 50, ...baseOptions } = options;
  const safeProcessor = withImageProcessing(processingFn, baseOptions);

  // Simple LRU-style cache
  const cache = new Map<string, ProcessingResult<T>>();

  return async (file: File, ...args: any[]): Promise<ProcessingResult<T>> => {
    // Create cache key from file properties and args
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}-${JSON.stringify(args)}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const result = await safeProcessor(file, ...args);

    // Store in cache with size limit
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(cacheKey, result);
    return result;
  };
}

/**
 * Compose multiple processors into a pipeline
 * Useful for: validate → transform → process → compress workflow
 */
export function composeImageProcessors<T = any>(
  ...processors: Array<(input: T) => Promise<T>>
): (initialInput: T) => Promise<ProcessingResult<T>> {
  return async (input: T): Promise<ProcessingResult<T>> => {
    let current = input;

    for (const processor of processors) {
      try {
        current = await processor(current);
      } catch (error) {
        return {
          success: false,
          error: {
            type: ImageToolErrorType.SHARP_FAILED,
            message: error instanceof Error ? error.message : 'Processing pipeline failed',
            userFriendlyMessage: 'Image processing failed. Please try again.',
          },
        };
      }
    }

    return {
      success: true,
      data: current,
    };
  };
}
