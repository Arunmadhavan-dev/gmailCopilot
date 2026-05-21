/**
 * JSON Repair Utility
 * Attempts to fix common JSON formatting issues from LLM responses
 */

/**
 * Common JSON issues and their fixes
 */
const JSON_REPAIRS: Array<{ pattern: RegExp; replacement: string }> = [
  // Remove markdown code blocks
  { pattern: /^```json\s*/i, replacement: "" },
  { pattern: /```\s*$/i, replacement: "" },
  
  // Fix single quotes to double quotes (basic)
  { pattern: /'([^']*)':/g, replacement: '"$1":' },
  { pattern: /: '([^']*)'/g, replacement: ': "$1"' },
  
  // Fix unquoted property names (simple cases)
  { pattern: /(\s*{\s*|,\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, replacement: '$1"$2":' },
  
  // Fix trailing commas
  { pattern: /,(\s*[}\]])/g, replacement: '$1' },
  
  // Fix Python-style True/False/None
  { pattern: /: True/g, replacement: ': true' },
  { pattern: /: False/g, replacement: ': false' },
  { pattern: /: None/g, replacement: ': null' },
  
  // Remove trailing content after JSON
  { pattern: /^(\{.*?\})\s*.*/s, replacement: '$1' }
];

/**
 * Attempt to repair malformed JSON
 */
export function repairJSON(jsonString: string): string {
  let repaired = jsonString.trim();
  
  for (const { pattern, replacement } of JSON_REPAIRS) {
    repaired = repaired.replace(pattern, replacement);
  }
  
  return repaired;
}

/**
 * Try to parse JSON, with repair attempts
 */
export function parseJSON<T>(jsonString: string): T | null {
  // First try direct parse
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    // Try repairs
    const repaired = repairJSON(jsonString);
    try {
      return JSON.parse(repaired) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Extract JSON object from text that might have surrounding content
 */
export function extractJSON(text: string): string | null {
  // Try to find JSON object between braces
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}
