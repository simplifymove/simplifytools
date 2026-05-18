/**
 * Simple In-Memory Concurrency Queue for Ollama Requests
 * Prevents overloading the Ollama backend with too many concurrent requests
 */

interface QueuedRequest {
  id: string;
  userId: string;
  createdAt: number;
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class ConcurrencyQueue {
  private maxConcurrent: number;
  private activeRequests: Map<string, QueuedRequest> = new Map();
  private queue: QueuedRequest[] = [];
  private requestIdCounter = 0;

  constructor(maxConcurrent: number = 2) {
    this.maxConcurrent = Math.max(1, maxConcurrent);
  }

  /**
   * Add a request to the queue and execute when slot is available
   */
  async enqueue<T>(
    userId: string,
    fn: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    // Check if queue is full
    if (
      this.activeRequests.size >= this.maxConcurrent &&
      this.queue.length >= 5
    ) {
      // Queue is full, return busy response
      return {
        success: false,
        error: "Server is currently busy. Please try again in a moment.",
      };
    }

    const requestId = `req_${++this.requestIdCounter}_${Date.now()}`;

    return new Promise((resolve) => {
      const request: QueuedRequest = {
        id: requestId,
        userId,
        createdAt: Date.now(),
        promise: Promise.resolve(),
        resolve: (value: T) => {
          this.activeRequests.delete(requestId);
          this.processQueue();
          resolve({ success: true, data: value });
        },
        reject: (error: any) => {
          this.activeRequests.delete(requestId);
          this.processQueue();
          resolve({
            success: false,
            error: error?.message || "Request processing failed",
          });
        },
      };

      // If we have available slots, execute immediately
      if (this.activeRequests.size < this.maxConcurrent) {
        this.executeRequest(request, fn);
      } else {
        // Otherwise, queue it
        this.queue.push(request);
      }
    });
  }

  /**
   * Execute a single request
   */
  private executeRequest<T>(
    request: QueuedRequest,
    fn: () => Promise<T>
  ): void {
    this.activeRequests.set(request.id, request);

    fn()
      .then((result) => request.resolve(result))
      .catch((error) => request.reject(error));
  }

  /**
   * Process queued requests when slots become available
   */
  private processQueue(): void {
    while (
      this.queue.length > 0 &&
      this.activeRequests.size < this.maxConcurrent
    ) {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        // Re-execute from stored function
        const fn = nextRequest.promise as any;
        this.executeRequest(nextRequest, () => fn);
      }
    }
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    activeCount: number;
    queuedCount: number;
    maxConcurrent: number;
  } {
    return {
      activeCount: this.activeRequests.size,
      queuedCount: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Check if queue is at capacity
   */
  isFull(): boolean {
    return (
      this.activeRequests.size >= this.maxConcurrent &&
      this.queue.length >= 5
    );
  }

  /**
   * Get active request count
   */
  getActiveCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Check if a user can make a request now
   */
  canProcessNow(): boolean {
    return this.activeRequests.size < this.maxConcurrent;
  }
}

// Global instance
let globalQueue: ConcurrencyQueue | null = null;

/**
 * Initialize the global concurrency queue
 */
export function initConcurrencyQueue(maxConcurrent: number = 2): void {
  globalQueue = new ConcurrencyQueue(maxConcurrent);
}

/**
 * Get the global concurrency queue instance
 */
export function getConcurrencyQueue(): ConcurrencyQueue {
  if (!globalQueue) {
    const maxConcurrent = parseInt(
      process.env.AI_MAX_CONCURRENT_GENERATIONS || "2",
      10
    );
    globalQueue = new ConcurrencyQueue(maxConcurrent);
  }
  return globalQueue;
}

/**
 * Execute a function with concurrency control
 */
export async function withConcurrencyControl<T>(
  userId: string,
  fn: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  const queue = getConcurrencyQueue();
  return queue.enqueue(userId, fn);
}

/**
 * Check if queue is at capacity
 */
export function isQueueFull(): boolean {
  return getConcurrencyQueue().isFull();
}

/**
 * Get queue status
 */
export function getQueueStatus(): {
  activeCount: number;
  queuedCount: number;
  maxConcurrent: number;
} {
  return getConcurrencyQueue().getStatus();
}
