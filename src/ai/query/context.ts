/**
 * Phase 3 - Context Awareness
 * Track conversation context and previous actions for smarter responses
 */

import type { IntentParseResult } from "../types";

export interface ConversationContext {
  previousQueries: string[];
  lastAction?: string;
  lastCategory?: string;
  sessionStart: Date;
  totalActions: number;
  userPreferences: Map<string, string>;
}

export interface ContextualSuggestion {
  type: "follow_up" | "related" | "refinement";
  description: string;
  suggestedQuery: string;
  confidence: number;
}

/**
 * Manages conversation context across multiple interactions
 */
export class ContextManager {
  private context: ConversationContext;
  private maxHistory = 5;

  constructor() {
    this.context = {
      previousQueries: [],
      sessionStart: new Date(),
      totalActions: 0,
      userPreferences: new Map()
    };
  }

  /**
   * Record a new interaction
   */
  recordInteraction(result: IntentParseResult): void {
    this.context.previousQueries.unshift(result.originalText);
    
    // Keep only recent history
    if (this.context.previousQueries.length > this.maxHistory) {
      this.context.previousQueries = this.context.previousQueries.slice(0, this.maxHistory);
    }
    
    this.context.lastAction = result.action.action;
    this.context.lastCategory = result.classification?.semanticCategory;
    this.context.totalActions++;
  }

  /**
   * Get contextual follow-up suggestions
   */
  getSuggestions(): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];
    
    if (!this.context.lastAction) return suggestions;
    
    // Suggest follow-ups based on last action
    switch (this.context.lastAction) {
      case "search_emails":
        suggestions.push({
          type: "follow_up",
          description: "Archive these results",
          suggestedQuery: "archive the emails we just found",
          confidence: 0.85
        });
        suggestions.push({
          type: "refinement",
          description: "Filter by sender",
          suggestedQuery: "only from the most recent sender",
          confidence: 0.75
        });
        break;
        
      case "archive_emails":
        suggestions.push({
          type: "related",
          description: "Find more like these",
          suggestedQuery: "find similar emails",
          confidence: 0.80
        });
        break;
        
      case "delete_emails":
        suggestions.push({
          type: "related",
          description: "Empty trash",
          suggestedQuery: "empty trash",
          confidence: 0.70
        });
        break;
    }
    
    // Category-specific suggestions
    if (this.context.lastCategory === "recruiting") {
      suggestions.push({
        type: "related",
        description: "Find offers received",
        suggestedQuery: "show job offers",
        confidence: 0.78
      });
    }
    
    return suggestions;
  }

  /**
   * Check if current query is a follow-up to previous
   */
  isFollowUp(query: string): boolean {
    const followUpPatterns = [
      "these", "those", "them", "it", "that",
      "more", "also", "too", "as well",
      "next", "then", "after that"
    ];
    
    const lowerQuery = query.toLowerCase();
    return followUpPatterns.some(pattern => lowerQuery.includes(pattern));
  }

  /**
   * Enhance query with context
   */
  enhanceWithContext(query: string): string {
    if (!this.isFollowUp(query) || !this.context.lastAction) {
      return query;
    }
    
    // Replace pronouns with context
    let enhanced = query;
    
    if (this.context.previousQueries.length > 0) {
      const lastQuery = this.context.previousQueries[0];
      
      // Replace "these" with actual context
      if (enhanced.includes("these") || enhanced.includes("those")) {
        enhanced = enhanced.replace(/\b(these|those)\b/gi, `similar to "${lastQuery}"`);
      }
    }
    
    return enhanced;
  }

  /**
   * Learn user preference
   */
  learnPreference(key: string, value: string): void {
    this.context.userPreferences.set(key, value);
  }

  /**
   * Get learned preference
   */
  getPreference(key: string): string | undefined {
    return this.context.userPreferences.get(key);
  }

  /**
   * Get session summary
   */
  getSessionSummary(): string {
    const duration = Math.round(
      (Date.now() - this.context.sessionStart.getTime()) / (1000 * 60)
    );
    
    return `Session: ${duration}min, ${this.context.totalActions} actions`;
  }

  /**
   * Clear context
   */
  clear(): void {
    this.context.previousQueries = [];
    this.context.lastAction = undefined;
    this.context.lastCategory = undefined;
    this.context.totalActions = 0;
  }
}
