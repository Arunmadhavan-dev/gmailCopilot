import { z } from "zod";

export const AIActionTypeSchema = z.enum([
  "search_emails",
  "archive_emails",
  "delete_emails",
  "clarify"
]);

export const BaseAIActionSchema = z.object({
  action: AIActionTypeSchema,
  query: z.string().min(1, "Query cannot be empty"),
  requiresConfirmation: z.boolean().optional(),
  reason: z.string().optional()
});

export const SearchEmailsActionSchema = BaseAIActionSchema.extend({
  action: z.literal("search_emails"),
  requiresConfirmation: z.literal(false).optional()
});

export const ArchiveEmailsActionSchema = BaseAIActionSchema.extend({
  action: z.literal("archive_emails"),
  requiresConfirmation: z.literal(true)
});

export const DeleteEmailsActionSchema = BaseAIActionSchema.extend({
  action: z.literal("delete_emails"),
  requiresConfirmation: z.literal(true)
});

export const ClarifyActionSchema = BaseAIActionSchema.extend({
  action: z.literal("clarify"),
  reason: z.string().min(1, "Reason is required for clarification")
});

export const AIActionSchema = z.discriminatedUnion("action", [
  SearchEmailsActionSchema,
  ArchiveEmailsActionSchema,
  DeleteEmailsActionSchema,
  ClarifyActionSchema
]);

export const IntentParseResultSchema = z.object({
  action: AIActionSchema,
  confidence: z.number().min(0).max(1),
  originalText: z.string()
});

export function validateAIAction(data: unknown) {
  const result = AIActionSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ")
    };
  }
  return { success: true, data: result.data };
}

export function validateIntentParseResult(data: unknown) {
  const result = IntentParseResultSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ")
    };
  }
  return { success: true, data: result.data };
}
