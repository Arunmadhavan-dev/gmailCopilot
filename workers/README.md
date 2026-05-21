# Cloudflare Worker Proxy Setup

This directory contains a Cloudflare Worker that acts as a secure proxy to the Groq API. This hides your API key from the extension bundle.

## Why Use a Proxy?

**Problem:** When you build the extension, the Groq API key is embedded in the JavaScript bundle. Anyone who installs the extension can extract it.

**Solution:** The extension calls your Cloudflare Worker (no secret needed). The worker holds the API key and forwards requests to Groq.

## Setup Instructions

### 1. Create Cloudflare Account
- Sign up at https://dash.cloudflare.com/sign-up (free tier works fine)

### 2. Create a Worker
1. Go to **Workers & Pages** in the sidebar
2. Click **Create application**
3. Click **Create Worker**
4. Give it a name (e.g., `gmail-copilot-groq-proxy`)
5. Click **Deploy**

### 3. Add Your API Key
1. Go to your worker's **Settings** tab
2. Click **Variables and Secrets**
3. Click **Add variable**
4. Name: `GROQ_API_KEY`
5. Value: Your actual Groq API key
6. Click **Encrypt** (makes it a secret)
7. Click **Save**

### 4. Deploy the Proxy Code
1. Go to your worker's **Edit code** tab
2. Delete the default code
3. Copy the contents of `groq-proxy.js` from this directory
4. Paste it into the editor
5. Click **Save and deploy**

### 5. Get Your Worker URL
- Your worker URL will be: `https://gmail-copilot-groq-proxy.YOUR_SUBDOMAIN.workers.dev`
- Copy this URL

### 6. Update Extension Configuration

Add to your `.env` file:
```
# For production (secure)
GROQ_WORKER_URL=https://gmail-copilot-groq-proxy.YOUR_SUBDOMAIN.workers.dev

# For development (direct API - optional)
GROQ_API_KEY=your_key_here
```

### 7. Update Extension to Use Worker

The extension needs to be modified to use the worker URL instead of direct API. See `src/ai/groqClient.ts` - it needs to support a `workerUrl` parameter.

## Security Features

The worker includes:
- ✅ API key hidden from extension
- ✅ CORS headers (extension can call it)
- ✅ Rate limiting (20 req/min per IP)
- ✅ Request validation
- ✅ Error sanitization

## Monitoring

In Cloudflare Dashboard:
1. Go to your worker
2. Click **Analytics** tab
3. See request counts, errors, CPU time
4. Set up alerts if needed

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests/day
- 10ms CPU time per request

For a personal Gmail Copilot extension, this is more than enough.

## Troubleshooting

### Worker returns 429 (Rate Limited)
- You or your IP hit the 20 req/min limit
- Wait 60 seconds and try again
- Check if you have a loop in your code

### Worker returns 500
- Check worker logs in Cloudflare Dashboard
- Verify GROQ_API_KEY is set correctly
- Check Groq API status

### Extension can't connect
- Check CORS errors in browser console
- Verify worker URL is correct in `.env`
- Ensure worker is deployed (not just saved)
