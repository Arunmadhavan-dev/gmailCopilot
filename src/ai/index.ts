// AI Module - Intent Parsing & Action Engine
// Organized by responsibility for maintainability

// Core Types
export * from "./types";

// Schemas & Validation
export * from "./schemas";

// Phase 2: Intent Classification (Semantic Understanding)
export * from "./classification";

// Phase 3: Smart Query Enhancement & Context Awareness
export * from "./query";

// Phase 4: Smart Action Execution & Feedback Loop
export * from "./execution";

// LLM Client (modular)
export * from "./groqClient";

// Prompts
export { INTENT_SYSTEM_PROMPT } from "./prompts/intentSystemPrompt";

// Confidence Calculation
export { calculateConfidence } from "./confidence/calculator";

// Intent Parsing
export { IntentParser } from "./parsers/intentParser";
export { handleParseError, handleLowConfidence, createClarifyResult } from "./parsers/errorHandler";

// Action Engine
export * from "./engine/types";
export * from "./engine/factory";
export * from "./engine/registry";
export * from "./engine/executor";

// Action Handlers
export { handleSearchEmails, SEARCH_MAX_RESULTS } from "./handlers/searchEmails";
export { handleArchiveEmails, ARCHIVE_MAX_PREVIEW } from "./handlers/archiveEmails";
export { handleDeleteEmails, DELETE_MAX_PREVIEW } from "./handlers/deleteEmails";
export { handleClarify } from "./handlers/clarify";
