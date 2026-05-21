/**
 * Phase 4 - Execution Feedback System
 * Collect and learn from user feedback on action results
 */

import type { ExecutionResult } from "./pipeline";

export interface UserFeedback {
  executionId: string;
  satisfied: boolean;
  rating?: number; // 1-5
  comments?: string;
  correctedQuery?: string;
  timestamp: Date;
}

export interface FeedbackStats {
  totalExecutions: number;
  satisfactionRate: number;
  averageRating: number;
  commonCorrections: Map<string, number>;
  improvedQueries: string[];
}

/**
 * Manages user feedback for continuous improvement
 */
export class FeedbackSystem {
  private feedbackHistory: UserFeedback[] = [];
  private maxHistorySize = 100;

  /**
   * Record user feedback
   */
  recordFeedback(feedback: Omit<UserFeedback, "timestamp">): void {
    const entry: UserFeedback = {
      ...feedback,
      timestamp: new Date()
    };
    
    this.feedbackHistory.unshift(entry);
    
    // Keep history manageable
    if (this.feedbackHistory.length > this.maxHistorySize) {
      this.feedbackHistory = this.feedbackHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get statistics from feedback
   */
  getStats(): FeedbackStats {
    const total = this.feedbackHistory.length;
    if (total === 0) {
      return {
        totalExecutions: 0,
        satisfactionRate: 0,
        averageRating: 0,
        commonCorrections: new Map(),
        improvedQueries: []
      };
    }

    const satisfied = this.feedbackHistory.filter(f => f.satisfied).length;
    const ratings = this.feedbackHistory.filter(f => f.rating !== undefined);
    
    // Track common corrections
    const corrections = new Map<string, number>();
    this.feedbackHistory.forEach(f => {
      if (f.correctedQuery) {
        const count = corrections.get(f.correctedQuery) || 0;
        corrections.set(f.correctedQuery, count + 1);
      }
    });

    // Get most improved queries
    const improvedQueries = Array.from(corrections.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query]) => query);

    return {
      totalExecutions: total,
      satisfactionRate: satisfied / total,
      averageRating: ratings.length > 0
        ? ratings.reduce((sum, f) => sum + (f.rating || 0), 0) / ratings.length
        : 0,
      commonCorrections: corrections,
      improvedQueries
    };
  }

  /**
   * Learn from corrections to suggest better queries
   */
  suggestImprovement(originalQuery: string): string | undefined {
    // Find similar queries that were corrected
    const similarCorrections = this.feedbackHistory.filter(f => 
      f.correctedQuery && 
      this.similarity(originalQuery, f.correctedQuery) > 0.6
    );

    if (similarCorrections.length === 0) return undefined;

    // Return most common correction
    const corrections = similarCorrections.map(f => f.correctedQuery!);
    return this.mostCommon(corrections);
  }

  /**
   * Check if recent executions have low satisfaction
   */
  hasRecentIssues(minSatisfaction = 0.7, window = 5): boolean {
    const recent = this.feedbackHistory.slice(0, window);
    if (recent.length < 3) return false;

    const satisfied = recent.filter(f => f.satisfied).length;
    return satisfied / recent.length < minSatisfaction;
  }

  /**
   * Get feedback for specific execution
   */
  getFeedback(executionId: string): UserFeedback | undefined {
    return this.feedbackHistory.find(f => f.executionId === executionId);
  }

  /**
   * Calculate string similarity (simple)
   */
  private similarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...aWords].filter(x => bWords.has(x)));
    const union = new Set([...aWords, ...bWords]);
    
    return intersection.size / union.size;
  }

  /**
   * Get most common item in array
   */
  private mostCommon<T>(arr: T[]): T | undefined {
    const counts = new Map<T, number>();
    arr.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  /**
   * Clear all feedback
   */
  clear(): void {
    this.feedbackHistory = [];
  }
}

/**
 * Generate feedback prompt for user
 */
export function generateFeedbackPrompt(result: ExecutionResult): string {
  const parts: string[] = [];
  
  if (result.success) {
    parts.push("Did this help you find what you were looking for?");
    
    if (result.affectedCount === 0) {
      parts.push("No results found. Try a different search?");
    } else if (result.affectedCount && result.affectedCount > 50) {
      parts.push("Many results found. Try narrowing your search?");
    }
  } else {
    parts.push("Something went wrong. Would you like to try again?");
  }
  
  return parts.join(" ");
}
