/**
 * Phase 4 - Smart Action Execution Pipeline
 * Execute actions with progress tracking, partial results, and feedback
 */

import type { AIAction, ActionExecutionResult } from "../types";
import type { ClassifiedIntent } from "../classification";
import type { EnhancedQuery } from "../query";

export interface ExecutionStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number; // 0-100
  message?: string;
}

export interface ExecutionContext {
  action: AIAction;
  classification?: ClassifiedIntent;
  enhancedQuery?: EnhancedQuery;
  steps: ExecutionStep[];
  startTime: Date;
  estimatedDuration: number; // milliseconds
}

export interface ExecutionResult extends ActionExecutionResult {
  executionTime: number;
  stepsCompleted: number;
  partialResults?: unknown[];
  canRetry: boolean;
  retryCount: number;
}

/**
 * Pipeline for executing AI actions with feedback
 */
export class ExecutionPipeline {
  private maxRetries = 3;
  private stepDurations: Map<string, number> = new Map();

  /**
   * Create execution context with steps
   */
  createContext(
    action: AIAction,
    classification?: ClassifiedIntent,
    enhancedQuery?: EnhancedQuery
  ): ExecutionContext {
    const steps = this.defineSteps(action);
    
    return {
      action,
      classification,
      enhancedQuery,
      steps,
      startTime: new Date(),
      estimatedDuration: this.estimateDuration(action, steps)
    };
  }

  /**
   * Define execution steps based on action type
   */
  private defineSteps(action: AIAction): ExecutionStep[] {
    const baseSteps: ExecutionStep[] = [
      { name: "validate", status: "pending", progress: 0 },
      { name: "prepare", status: "pending", progress: 0 }
    ];

    switch (action.action) {
      case "search_emails":
        return [
          ...baseSteps,
          { name: "query_gmail", status: "pending", progress: 0 },
          { name: "fetch_threads", status: "pending", progress: 0 },
          { name: "process_results", status: "pending", progress: 0 }
        ];

      case "archive_emails":
        return [
          ...baseSteps,
          { name: "search_targets", status: "pending", progress: 0 },
          { name: "confirm_targets", status: "pending", progress: 0 },
          { name: "batch_archive", status: "pending", progress: 0 },
          { name: "verify_archive", status: "pending", progress: 0 }
        ];

      case "delete_emails":
        return [
          ...baseSteps,
          { name: "search_targets", status: "pending", progress: 0 },
          { name: "safety_check", status: "pending", progress: 0 },
          { name: "confirm_deletion", status: "pending", progress: 0 },
          { name: "batch_delete", status: "pending", progress: 0 },
          { name: "verify_deletion", status: "pending", progress: 0 }
        ];

      default:
        return baseSteps;
    }
  }

  /**
   * Estimate execution duration
   */
  private estimateDuration(action: AIAction, steps: ExecutionStep[]): number {
    const baseTime = 500; // 500ms overhead
    const perStepTime = 300; // 300ms per step
    
    // Add category-specific adjustments
    let adjustment = 0;
    if (action.query.includes("older_than")) {
      adjustment = 1000; // Historical searches take longer
    }
    
    return baseTime + (steps.length * perStepTime) + adjustment;
  }

  /**
   * Update step status
   */
  updateStep(context: ExecutionContext, stepName: string, status: ExecutionStep["status"], message?: string): void {
    const step = context.steps.find(s => s.name === stepName);
    if (step) {
      step.status = status;
      step.message = message;
      
      // Calculate progress
      const completedSteps = context.steps.filter(s => s.status === "completed").length;
      const runningStep = context.steps.find(s => s.status === "running");
      
      context.steps.forEach((s, index) => {
        if (s.status === "completed") {
          s.progress = 100;
        } else if (s.status === "running") {
          s.progress = 50;
        } else if (s.status === "pending") {
          s.progress = 0;
        }
      });
    }
  }

  /**
   * Get current progress percentage
   */
  getProgress(context: ExecutionContext): number {
    const totalSteps = context.steps.length;
    const completedProgress = context.steps.reduce((sum, step) => sum + step.progress, 0);
    return Math.round(completedProgress / totalSteps);
  }

  /**
   * Check if execution can be retried
   */
  canRetry(result: ExecutionResult): boolean {
    return result.canRetry && result.retryCount < this.maxRetries;
  }

  /**
   * Create retry strategy
   */
  createRetryContext(context: ExecutionContext): ExecutionContext {
    // Mark failed steps as pending for retry
    context.steps.forEach(step => {
      if (step.status === "failed") {
        step.status = "pending";
        step.progress = 0;
        step.message = undefined;
      }
    });
    
    context.startTime = new Date();
    return context;
  }

  /**
   * Build execution report
   */
  buildReport(context: ExecutionContext, result: ExecutionResult): string {
    const duration = Date.now() - context.startTime.getTime();
    const completedSteps = context.steps.filter(s => s.status === "completed").length;
    const failedSteps = context.steps.filter(s => s.status === "failed").length;
    
    const parts: string[] = [];
    parts.push(`✅ ${context.action.action} completed`);
    parts.push(`⏱️ ${duration}ms`);
    parts.push(`📊 ${completedSteps}/${context.steps.length} steps`);
    
    if (result.affectedCount !== undefined) {
      parts.push(`📧 ${result.affectedCount} items`);
    }
    
    if (failedSteps > 0) {
      parts.push(`⚠️ ${failedSteps} steps had issues`);
    }
    
    return parts.join(" | ");
  }
}
