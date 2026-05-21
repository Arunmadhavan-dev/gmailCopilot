/**
 * Gmail Module
 * 
 * Provides authentication and API integration with Gmail.
 * Organized into submodules for clarity.
 */

// Errors
export { GmailApiError } from "./errors";

// Authentication
export { getAuthToken, clearAuthToken } from "./auth";

// API Methods
export { fetchGmailThreads, fetchProfileEmail } from "./api";
