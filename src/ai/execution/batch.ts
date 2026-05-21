/**
 * Phase 4 - Batch Operations
 * Execute actions on multiple items efficiently with progress tracking
 */

export interface BatchItem<T> {
  id: string;
  data: T;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  retryCount: number;
}

export interface BatchResult<T> {
  total: number;
  completed: number;
  failed: number;
  items: BatchItem<T>[];
  errors: Array<{ id: string; error: string }>;
}

export interface BatchOptions {
  batchSize: number;
  concurrency: number;
  retryAttempts: number;
  retryDelay: number;
  onProgress?: (completed: number, total: number) => void;
  onItemComplete?: (id: string, success: boolean) => void;
}

const DEFAULT_OPTIONS: BatchOptions = {
  batchSize: 10,
  concurrency: 3,
  retryAttempts: 2,
  retryDelay: 1000
};

/**
 * Execute operations in batches with progress tracking
 */
export class BatchExecutor<T> {
  private options: BatchOptions;

  constructor(options: Partial<BatchOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Execute operation on all items
   */
  async execute(
    items: T[],
    getId: (item: T) => string,
    operation: (item: T) => Promise<void>
  ): Promise<BatchResult<T>> {
    // Initialize batch items
    const batchItems: BatchItem<T>[] = items.map(item => ({
      id: getId(item),
      data: item,
      status: "pending",
      retryCount: 0
    }));

    const result: BatchResult<T> = {
      total: items.length,
      completed: 0,
      failed: 0,
      items: batchItems,
      errors: []
    };

    // Process in batches
    for (let i = 0; i < batchItems.length; i += this.options.batchSize) {
      const batch = batchItems.slice(i, i + this.options.batchSize);
      await this.processBatch(batch, operation, result);
      
      // Report progress
      this.options.onProgress?.(result.completed, result.total);
    }

    return result;
  }

  /**
   * Process a single batch with concurrency control
   */
  private async processBatch(
    batch: BatchItem<T>[],
    operation: (item: T) => Promise<void>,
    result: BatchResult<T>
  ): Promise<void> {
    const executing = new Set<Promise<void>>();

    for (const item of batch) {
      // Wait if at concurrency limit
      while (executing.size >= this.options.concurrency) {
        await Promise.race(executing);
      }

      // Start processing
      const promise = this.processItem(item, operation, result);
      executing.add(promise);

      // Clean up when done
      promise.then(() => executing.delete(promise));
    }

    // Wait for remaining
    await Promise.all(executing);
  }

  /**
   * Process single item with retry logic
   */
  private async processItem(
    item: BatchItem<T>,
    operation: (item: T) => Promise<void>,
    result: BatchResult<T>
  ): Promise<void> {
    item.status = "processing";

    try {
      await operation(item.data);
      
      item.status = "completed";
      result.completed++;
      this.options.onItemComplete?.(item.id, true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Retry if possible
      if (item.retryCount < this.options.retryAttempts) {
        item.retryCount++;
        item.status = "pending";
        
        await this.delay(this.options.retryDelay * item.retryCount);
        return this.processItem(item, operation, result);
      }

      // Max retries reached
      item.status = "failed";
      item.error = errorMsg;
      result.failed++;
      result.errors.push({ id: item.id, error: errorMsg });
      this.options.onItemComplete?.(item.id, false);
    }
  }

  /**
   * Get items that can be retried
   */
  getRetryableItems(result: BatchResult<T>): BatchItem<T>[] {
    return result.items.filter(
      item => item.status === "failed" && item.retryCount < this.options.retryAttempts
    );
  }

  /**
   * Generate summary report
   */
  generateReport(result: BatchResult<T>): string {
    const success = result.failed === 0;
    const parts: string[] = [];

    if (success) {
      parts.push(`✅ All ${result.completed} items processed successfully`);
    } else {
      parts.push(`⚠️ ${result.completed} completed, ${result.failed} failed`);
      
      if (result.failed > 0) {
        const sampleErrors = result.errors.slice(0, 3);
        parts.push("Errors:");
        sampleErrors.forEach(e => parts.push(`  - ${e.id}: ${e.error.substring(0, 50)}`));
      }
    }

    const rate = result.total > 0 ? (result.completed / result.total) * 100 : 0;
    parts.push(`Success rate: ${rate.toFixed(1)}%`);

    return parts.join("\n");
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Smart batch size calculator based on operation type
 */
export function calculateOptimalBatchSize(
  operationType: "search" | "archive" | "delete",
  totalItems: number
): number {
  switch (operationType) {
    case "search":
      // Can handle larger batches for searches
      return Math.min(50, totalItems);
    
    case "archive":
      // Moderate batch size for archives
      return Math.min(20, totalItems);
    
    case "delete":
      // Smaller batches for destructive operations
      return Math.min(10, totalItems);
    
    default:
      return 10;
  }
}
