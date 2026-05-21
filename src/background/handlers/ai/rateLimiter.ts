// Rate limiting: 10 requests per minute per tab
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestTimestamps: number[] = [];

/**
 * Check if request is within rate limit
 * Allows 10 requests per minute
 */
export function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Remove timestamps outside the window
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }
  
  // Check if under limit
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  requestTimestamps.push(now);
  return true;
}
