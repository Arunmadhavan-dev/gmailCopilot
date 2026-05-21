#!/usr/bin/env node
/**
 * Groq API Diagnostic Script
 * Tests if Groq API key and/or worker are configured correctly
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

console.log("🔍 Groq API Diagnostic Tool\n");

// Check .env file
console.log("1️⃣  Checking .env configuration...");
let envContent = "";
try {
  envContent = readFileSync(resolve(__dirname, "../.env"), "utf-8");
  console.log("   ✅ .env file found");
} catch {
  console.log("   ❌ .env file not found! Create one from .env.example");
  process.exit(1);
}

// Parse env vars
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    env[key] = value;
  }
});

// Debug: Show what was parsed
if (process.env.DEBUG) {
  console.log("   Parsed env vars:", Object.keys(env));
}

// Check GROQ_API_KEY
const hasApiKey = env.GROQ_API_KEY && env.GROQ_API_KEY.startsWith("gsk_");
const hasWorkerUrl = env.GROQ_WORKER_URL && env.GROQ_WORKER_URL.includes("workers.dev");

console.log("\n2️⃣  Checking Groq configuration...");
if (hasApiKey) {
  const maskedKey = env.GROQ_API_KEY.substring(0, 10) + "..." + env.GROQ_API_KEY.slice(-4);
  console.log(`   ✅ GROQ_API_KEY set: ${maskedKey}`);
} else if (env.GROQ_API_KEY) {
  console.log(`   ⚠️  GROQ_API_KEY set but doesn't look like a Groq key (should start with 'gsk_')`);
} else {
  console.log(`   ℹ️  GROQ_API_KEY not set`);
}

if (hasWorkerUrl) {
  console.log(`   ✅ GROQ_WORKER_URL set: ${env.GROQ_WORKER_URL}`);
} else if (env.GROQ_WORKER_URL) {
  console.log(`   ⚠️  GROQ_WORKER_URL set but doesn't contain 'workers.dev'`);
} else {
  console.log(`   ℹ️  GROQ_WORKER_URL not set`);
}

// Determine mode
console.log("\n3️⃣  Configuration mode...");
if (hasWorkerUrl) {
  console.log("   🌐 PRODUCTION MODE: Using Cloudflare Worker proxy (API key hidden)");
  console.log("   💡 Extension will call worker → Worker calls Groq with secret key");
} else if (hasApiKey) {
  console.log("   🛠️  DEVELOPMENT MODE: Using direct Groq API");
  console.log("   ⚠️  API key will be in the extension bundle!");
} else {
  console.log("   ❌ NO CONFIGURATION: AI features will NOT work");
  console.log("   📝 Set GROQ_API_KEY or GROQ_WORKER_URL in .env");
}

// Test API connectivity (if key provided)
if (hasApiKey && !hasWorkerUrl) {
  console.log("\n4️⃣  Testing direct API connection...");
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("   ✅ API key is valid!");
      console.log(`   📊 Available models: ${data.data?.length || 0}`);
      const model = env.GROQ_MODEL || "qwen/qwen3-32b";
      const hasModel = data.data?.some(m => m.id === model);
      if (hasModel) {
        console.log(`   ✅ Configured model '${model}' is available`);
      } else {
        console.log(`   ⚠️  Configured model '${model}' not found in available models`);
      }
    } else if (response.status === 401) {
      console.log("   ❌ API key is invalid (401 Unauthorized)");
      console.log("   📝 Check your key at https://console.groq.com/keys");
    } else {
      console.log(`   ⚠️  API returned status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }
}

if (hasWorkerUrl) {
  console.log("\n4️⃣  Testing Worker proxy...");
  try {
    const testPayload = {
      model: env.GROQ_MODEL || "qwen/qwen3-32b",
      messages: [{ role: "user", content: "Say 'Worker is working!'" }],
      max_tokens: 50
    };
    
    const response = await fetch(env.GROQ_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        console.log("   ✅ Worker proxy is responding!");
        console.log(`   📝 Response: "${data.choices[0].message.content.substring(0, 50)}..."`);
      } else if (data.error) {
        console.log(`   ⚠️  Worker returned error: ${data.error.message || data.error}`);
      }
    } else if (response.status === 429) {
      console.log("   ⏱️  Worker rate limit hit (429)");
    } else {
      console.log(`   ⚠️  Worker returned status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Worker connection failed: ${error.message}`);
    console.log("   📝 Check the worker URL and ensure it's deployed");
  }
}

console.log("\n✨ Diagnostic complete!");
console.log("\nNext steps:");
if (!hasApiKey && !hasWorkerUrl) {
  console.log("   1. Get API key from https://console.groq.com/keys");
  console.log("   2. Add GROQ_API_KEY=gsk_... to .env");
  console.log("   3. Or deploy worker and add GROQ_WORKER_URL");
} else if (hasApiKey && !hasWorkerUrl) {
  console.log("   1. Run 'npm run build' to generate config");
  console.log("   2. Load extension in Chrome");
  console.log("   3. For production, consider using worker proxy");
}
