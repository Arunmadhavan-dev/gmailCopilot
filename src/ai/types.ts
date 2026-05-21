export type AIActionType = "search_emails" | "archive_emails" | "delete_emails" | "clarify";

export interface BaseAIAction {
  action: AIActionType;
  query: string;
  requiresConfirmation?: boolean;
  reason?: string;
}

export interface SearchEmailsAction extends BaseAIAction {
  action: "search_emails";
  query: string;
}

export interface ArchiveEmailsAction extends BaseAIAction {
  action: "archive_emails";
  query: string;
  requiresConfirmation: true;
}

export interface DeleteEmailsAction extends BaseAIAction {
  action: "delete_emails";
  query: string;
  requiresConfirmation: true;
}

export interface ClarifyAction extends BaseAIAction {
  action: "clarify";
  query: string;
  reason: string;
}

export type AIAction = SearchEmailsAction | ArchiveEmailsAction | DeleteEmailsAction | ClarifyAction;

import type { ClassifiedIntent } from "./classification";
import type { EnhancedQuery } from "./query";

export interface IntentParseResult {
  action: AIAction;
  confidence: number;
  originalText: string;
  classification?: ClassifiedIntent;  // Phase 2: Semantic understanding
  enhancedQuery?: EnhancedQuery;      // Phase 3: Query enhancement
}

export interface ActionExecutionResult {
  success: boolean;
  action: AIAction;
  data?: unknown;
  error?: string;
  affectedCount?: number;
}
