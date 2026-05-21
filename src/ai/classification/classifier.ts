import type { AIAction } from "../types";
import {
  type SemanticCategory,
  CATEGORY_KEYWORDS,
  CATEGORY_PRIORITY
} from "./categories";

/**
 * Phase 2 - Intent Classification Result
 * Enhanced with semantic understanding
 */
export interface ClassifiedIntent {
  intent: string;           // Original action type
  confidence: number;       // 0-1 confidence score
  semanticCategory: SemanticCategory;  // WHAT user wants
  priority: number;         // Importance score
  suggestedGmailQuery?: string;  // Optimal Gmail search query
  userIntent: string;       // Human-readable description
}

/**
 * Classifies user intent with semantic categories
 */
export class IntentClassifier {
  /**
   * Detect semantic category from user input
   */
  classifyCategory(input: string): SemanticCategory {
    const lowerInput = input.toLowerCase();
    
    let bestMatch: SemanticCategory = "generic";
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const score = keywords.filter(kw => lowerInput.includes(kw)).length;
      
      // Prefer specific categories over generic
      if (score > maxScore && category !== "generic") {
        maxScore = score;
        bestMatch = category as SemanticCategory;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate priority based on category and keywords
   */
  calculatePriority(
    category: SemanticCategory,
    action: AIAction,
    confidence: number
  ): number {
    let priority = CATEGORY_PRIORITY[category];
    
    // Boost for high-confidence matches
    priority += confidence * 2;
    
    // Boost for actions requiring confirmation (destructive)
    if (action.requiresConfirmation) {
      priority += 1;
    }

    return Math.min(priority, 10);
  }

  /**
   * Generate human-readable description of user intent
   */
  describeUserIntent(action: AIAction, category: SemanticCategory): string {
    const descriptions: Record<string, Record<SemanticCategory, string>> = {
      search_emails: {
        recruiting: "Find job-related emails from recruiters",
        finance: "Find financial emails like invoices or receipts",
        support: "Find support tickets or help requests",
        marketing: "Find promotional or marketing emails",
        social: "Find personal emails from friends/family",
        notifications: "Find important notifications and alerts",
        updates: "Find newsletters or update digests",
        spam: "Find unwanted promotional emails",
        urgent: "Find time-sensitive urgent emails",
        generic: `Search for emails matching "${action.query}"`
      },
      archive_emails: {
        recruiting: "Archive old job application emails",
        finance: "Archive processed financial documents",
        marketing: "Archive read promotional emails",
        support: "Archive resolved support tickets",
        social: "Archive old social invitations",
        notifications: "Archive read notifications",
        updates: "Archive old newsletters",
        spam: "Archive junk emails",
        urgent: "Archive handled urgent items",
        generic: "Archive emails matching the query"
      },
      delete_emails: {
        recruiting: "Delete unwanted job emails",
        finance: "Delete old financial notifications",
        marketing: "Delete spam promotions",
        support: "Delete old support confirmations",
        social: "Delete expired invitations",
        notifications: "Delete old alerts",
        updates: "Delete read newsletters",
        spam: "Delete spam emails",
        urgent: "Delete handled urgent items (⚠️ Careful!)",
        generic: "Delete emails matching the query (⚠️ Destructive)"
      },
      clarify: {
        recruiting: "Need more details about job search",
        finance: "Need clarification on financial query",
        support: "Need more context about support issue",
        marketing: "Need clarification on promotional query",
        social: "Need more details about personal query",
        notifications: "Need clarification on notification query",
        updates: "Need more details about newsletter query",
        spam: "Need clarification about spam filtering",
        urgent: "Need urgent clarification",
        generic: "Need more details to understand request"
      }
    };

    const actionType = action.action;
    const categoryMap = descriptions[actionType] || descriptions.clarify;
    
    return categoryMap[category] || categoryMap.generic;
  }

  /**
   * Suggest optimized Gmail query based on category
   */
  suggestGmailQuery(action: AIAction, category: SemanticCategory): string {
    if (action.action !== "search_emails") {
      return action.query;
    }

    const baseQuery = action.query;
    
    const categoryBoosts: Record<SemanticCategory, string> = {
      recruiting: "in:anywhere",
      finance: "has:attachment OR invoice OR receipt",
      support: "in:support OR subject:ticket",
      marketing: "category:promotions",
      social: "in:sent OR from:me",
      notifications: "is:important OR in:updates",
      updates: "label:updates OR newsletter",
      spam: "in:spam",
      urgent: "is:starred OR is:important",
      generic: ""
    };

    const boost = categoryBoosts[category];
    if (boost && !baseQuery.includes(boost)) {
      return `${baseQuery} ${boost}`.trim();
    }

    return baseQuery;
  }

  /**
   * Main classification method
   */
  classify(
    userInput: string,
    action: AIAction,
    baseConfidence: number
  ): ClassifiedIntent {
    const category = this.classifyCategory(userInput);
    const priority = this.calculatePriority(category, action, baseConfidence);
    
    return {
      intent: action.action,
      confidence: baseConfidence,
      semanticCategory: category,
      priority,
      suggestedGmailQuery: this.suggestGmailQuery(action, category),
      userIntent: this.describeUserIntent(action, category)
    };
  }
}
