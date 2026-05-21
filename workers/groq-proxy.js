/**
 * Cloudflare Worker - Groq API Proxy
 * 
 * This worker acts as a secure proxy between the Gmail Copilot extension
 * and the Groq API. The API key is stored securely in Cloudflare,
 * never exposed to users or in the extension bundle.
 * 
 * Setup:
 * 1. Create worker in Cloudflare Dashboard
 * 2. Add GROQ_API_KEY as an environment variable
 * 3. Deploy and get your worker URL
 * 4. Update extension to use worker URL instead of direct API
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting (optional - uses Cloudflare Cache API)
    const clientIP = request.headers.get("CF-Connecting-IP");
    const rateLimitKey = `rate_limit:${clientIP}`;
    
    // Simple rate limit: 20 requests per minute per IP
    const rateLimitResult = await checkRateLimit(rateLimitKey, env);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60"
          } 
        }
      );
    }

    try {
      // Parse incoming request
      const body = await request.json();
      
      // Validate request
      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(
          JSON.stringify({ error: "Invalid request: messages array required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Forward to Groq API
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model || "qwen/qwen3-32b",
          messages: body.messages,
          temperature: body.temperature ?? 0.3,
          max_tokens: body.max_tokens ?? 1024,
          response_format: body.response_format,
        }),
      });

      // Get response body
      const responseData = await groqResponse.json();

      // Return response to extension
      return new Response(JSON.stringify(responseData), {
        status: groqResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });

    } catch (error) {
      console.error("Proxy error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};

// Simple rate limiting using Cloudflare Cache API
async function checkRateLimit(key, env) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / 60) * 60; // Current minute window
  const cacheKey = `${key}:${windowStart}`;
  
  // Try to get current count from cache
  const cache = caches.default;
  const cacheUrl = new URL(`https://dummy.com/ratelimit/${cacheKey}`);
  let count = 0;
  
  const cached = await cache.match(cacheUrl);
  if (cached) {
    count = parseInt(await cached.text(), 10) || 0;
  }
  
  const limit = 20; // 20 requests per minute
  const allowed = count < limit;
  
  if (allowed) {
    // Increment count
    const newCount = count + 1;
    const response = new Response(newCount.toString(), {
      headers: {
        "Cache-Control": "max-age=60",
      },
    });
    await cache.put(cacheUrl, response);
  }
  
  return { allowed, remaining: Math.max(0, limit - count - 1) };
}
