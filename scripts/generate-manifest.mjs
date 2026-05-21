import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const idx = trimmed.indexOf("=");
    if (idx <= 0) {
      continue;
    }

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  }

  return result;
}

const root = process.cwd();
const templatePath = resolve(root, "manifest.template.json");
const outputPath = resolve(root, "manifest.json");
const envPath = resolve(root, ".env");

const fileEnv = readEnvFile(envPath);
const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || fileEnv.GOOGLE_OAUTH_CLIENT_ID;

if (!clientId) {
  throw new Error("Missing GOOGLE_OAUTH_CLIENT_ID. Set it in environment or .env file.");
}

const template = readFileSync(templatePath, "utf8");
const manifest = template.replace("__GOOGLE_OAUTH_CLIENT_ID__", clientId);

writeFileSync(outputPath, manifest, "utf8");
console.log("Generated manifest.json from manifest.template.json");
