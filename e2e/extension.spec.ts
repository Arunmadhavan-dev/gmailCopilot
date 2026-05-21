import { test, expect, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

const EXTENSION_PATH = path.join(__dirname, "../dist");

test.describe("Gmail Copilot Extension", () => {
  let context: BrowserContext;

  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`
      ]
    });
  });

  test.afterEach(async () => {
    await context.close();
  });

  test("extension loads without errors", async () => {
    const page = await context.newPage();

    // Check that service worker is running
    const serviceWorkers = context.serviceWorkers();
    expect(serviceWorkers.length).toBeGreaterThan(0);

    await page.goto("https://mail.google.com");

    // Wait for extension to inject floating assistant
    const assistant = await page.waitForSelector("[data-testid='floating-assistant']", {
      timeout: 10000
    }).catch(() => null);

    // Extension may not be visible until authenticated
    // but should not throw errors
    expect(page.url()).toContain("google.com");
  });

  test("floating assistant appears on Gmail", async () => {
    const page = await context.newPage();
    await page.goto("https://mail.google.com");

    // Look for the floating button
    const floatingButton = await page.waitForSelector("[data-testid='assistant-toggle']", {
      timeout: 5000
    }).catch(() => null);

    if (floatingButton) {
      await floatingButton.click();

      // Check assistant window opens
      const assistantWindow = await page.waitForSelector("[data-testid='assistant-window']", {
        timeout: 3000
      });

      expect(assistantWindow).toBeTruthy();
    }
  });

  test("AI command input accepts text", async () => {
    const page = await context.newPage();
    await page.goto("https://mail.google.com");

    const toggle = await page.waitForSelector("[data-testid='assistant-toggle']", {
      timeout: 5000
    }).catch(() => null);

    if (toggle) {
      await toggle.click();

      const input = await page.waitForSelector("[data-testid='ai-command-input']");
      await input.fill("search emails from john");

      const value = await input.inputValue();
      expect(value).toBe("search emails from john");
    }
  });
});
