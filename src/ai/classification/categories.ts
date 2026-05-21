/**
 * Phase 2 - Intent Classification
 * Semantic categories for understanding WHAT user wants
 */

export type SemanticCategory =
  | "recruiting"      // Job offers, hiring, interviews
  | "support"         // Customer support, help requests
  | "finance"         // Invoices, payments, receipts
  | "marketing"       // Promotions, newsletters, campaigns
  | "social"          // Personal emails, invites, meetups
  | "notifications"   // Alerts, system notifications
  | "updates"         // Newsletters, digests, summaries
  | "spam"            // Unwanted, promotional
  | "urgent"          // Time-sensitive, action required
  | "generic";        // Uncategorized

/**
 * Keywords that indicate each category
 */
export const CATEGORY_KEYWORDS: Record<SemanticCategory, string[]> = {
  recruiting: [
    "recruiter", "hiring", "job", "position", "interview", "offer",
    "opportunity", "career", "talent", "resume", "cv", "application"
  ],
  support: [
    "support", "help", "ticket", "issue", "problem", "bug",
    "question", "request", "assistance", "service", "customer"
  ],
  finance: [
    "invoice", "payment", "receipt", "bill", "subscription", "charge",
    "refund", "price", "cost", "expense", "purchase", "order"
  ],
  marketing: [
    "promotion", "sale", "discount", "deal", "offer", "campaign",
    "newsletter", "subscribe", "unsubscribe", "marketing"
  ],
  social: [
    "friend", "family", "party", "event", "invite", "birthday",
    "wedding", "meetup", "social", "personal", "catch up"
  ],
  notifications: [
    "alert", "notification", "reminder", "due", "deadline",
    "expired", "security", "login", "password", "verification"
  ],
  updates: [
    "update", "digest", "summary", "weekly", "monthly", "news",
    "changelog", "release", "version", "what's new"
  ],
  spam: [
    "unsubscribe", "promotional", "advertisement", "marketing",
    "opt-out", "no-reply", "noreply", "bulk"
  ],
  urgent: [
    "urgent", "asap", "immediately", "emergency", "important",
    "priority", "critical", "action required", "deadline"
  ],
  generic: []
};

/**
 * Priority levels for different categories
 */
export const CATEGORY_PRIORITY: Record<SemanticCategory, number> = {
  urgent: 10,
  finance: 8,
  recruiting: 7,
  support: 6,
  social: 5,
  notifications: 4,
  updates: 3,
  marketing: 2,
  spam: 1,
  generic: 0
};
