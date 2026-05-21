/**
 * Phase 3 - Smart Query Enhancement
 * Transform user intent into optimized Gmail search queries
 */

import type { ClassifiedIntent, SemanticCategory } from "../classification";
import type { AIAction } from "../types";

export interface EnhancedQuery {
  originalQuery: string;
  enhancedQuery: string;
  gmailOperators: string[];
  timeRange?: { start: Date; end: Date };
  senderFilters?: string[];
  explanation: string;
}

/**
 * Time range patterns in natural language
 */
const TIME_PATTERNS: Record<string, (now: Date) => { start: Date; end: Date }> = {
  "today": (now) => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  },
  "yesterday": (now) => {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  "this week": (now) => {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  },
  "last week": (now) => {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() - 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  "this month": (now) => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  },
  "last month": (now) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }
};

/**
 * Gmail operators by category
 */
const CATEGORY_OPERATORS: Record<SemanticCategory, string[]> = {
  recruiting: ["in:anywhere", "has:attachment", "filename:pdf"],
  finance: ["has:attachment", "filename:pdf OR filename:invoice"],
  support: ["in:support"],
  marketing: ["category:promotions"],
  social: ["from:me OR to:me"],
  notifications: ["is:important"],
  updates: ["label:updates"],
  spam: ["in:spam"],
  urgent: ["is:starred OR is:important"],
  generic: []
};

export class QueryEnhancer {
  /**
   * Detect time range from user input
   */
  detectTimeRange(input: string): { start: Date; end: Date } | undefined {
    const lower = input.toLowerCase();
    
    for (const [pattern, calculator] of Object.entries(TIME_PATTERNS)) {
      if (lower.includes(pattern)) {
        return calculator(new Date());
      }
    }
    
    // Check for "last N days"
    const daysMatch = lower.match(/last\s+(\d+)\s+days?/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      return { start, end };
    }
    
    return undefined;
  }

  /**
   * Extract sender patterns from input
   */
  extractSenders(input: string): string[] {
    const senders: string[] = [];
    
    // Match "from:email@domain.com" or just email patterns
    const emailMatches = input.match(/[\w.-]+@[\w.-]+\.\w+/g);
    if (emailMatches) {
      emailMatches.forEach(email => senders.push(`from:${email}`));
    }
    
    // Match "from john" or "from recruiter"
    const fromMatches = input.match(/from\s+([\w]+)/gi);
    if (fromMatches) {
      fromMatches.forEach(match => {
        const name = match.replace(/from\s+/i, "");
        senders.push(`from:${name}`);
      });
    }
    
    return senders;
  }

  /**
   * Build enhanced Gmail query
   */
  enhance(
    userInput: string,
    action: AIAction,
    classification: ClassifiedIntent
  ): EnhancedQuery {
    const baseQuery = action.query;
    const operators: string[] = [];
    
    // Add category-specific operators
    const categoryOps = CATEGORY_OPERATORS[classification.semanticCategory];
    operators.push(...categoryOps);
    
    // Detect time range
    const timeRange = this.detectTimeRange(userInput);
    if (timeRange) {
      const daysOld = Math.ceil(
        (Date.now() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      operators.push(`newer_than:${daysOld}d`);
    }
    
    // Extract sender filters
    const senderFilters = this.extractSenders(userInput);
    
    // Build final query
    const enhancedParts = [
      baseQuery,
      ...operators.filter(op => !baseQuery.includes(op)),
      ...senderFilters.filter(sf => !baseQuery.includes(sf.replace("from:", "")))
    ];
    
    const enhancedQuery = enhancedParts.join(" ").trim();
    
    return {
      originalQuery: baseQuery,
      enhancedQuery,
      gmailOperators: [...operators, ...senderFilters],
      timeRange,
      senderFilters,
      explanation: this.buildExplanation(classification, operators, timeRange)
    };
  }

  /**
   * Build human-readable explanation of enhancements
   */
  private buildExplanation(
    classification: ClassifiedIntent,
    operators: string[],
    timeRange?: { start: Date; end: Date }
  ): string {
    const parts: string[] = [];
    
    parts.push(`Searching for "${classification.userIntent}"`);
    
    if (operators.length > 0) {
      parts.push(`with operators: ${operators.join(", ")}`);
    }
    
    if (timeRange) {
      const days = Math.ceil(
        (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      parts.push(`within last ${days} days`);
    }
    
    return parts.join(" ") + ".";
  }
}
