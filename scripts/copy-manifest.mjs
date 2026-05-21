import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

const source = resolve(root, "manifest.json");
const distDir = resolve(root, "dist");
const dest = resolve(distDir, "manifest.json");

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
if (existsSync(source)) {
  copyFileSync(source, dest);
  console.log("✓ Copied manifest.json to dist/");
} else {
  console.error("✗ manifest.json not found in project root");
  process.exit(1);
}
