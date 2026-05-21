# Testing Guide

This document describes the testing infrastructure for the Gmail Copilot extension.

## First Principles: What Are Tests? (ELI5)

Think of building software like building a LEGO castle. You want to make sure every piece works before you show it to your friends.

### Unit Tests = Checking Each LEGO Brick

**Analogy:** Before building the castle, you check every single LEGO brick:
- Does this red brick have the right size?
- Do these two pieces click together?
- If I press this button, does the door open?

**In code:** We test small, isolated pieces:
- Does the confidence calculator return 0.9 when input has clear keywords?
- Does the delete handler reject invalid actions?
- Does `2 + 2` actually equal `4`?

**Why:** If one brick is broken, the whole castle falls. Catching it early is cheap.

### E2E Tests = Checking the Whole Castle

**Analogy:** After building the castle, you walk around it:
- Does the drawbridge open when you turn the wheel?
- Do the lights turn on?
- Can a minifigure walk through the door?

**In code:** We test the entire extension in a real browser:
- Does the floating button appear on Gmail?
- When you click it, does the window open?
- Can you type in the AI command box?

**Why:** Sometimes individual bricks work, but together they don't fit. E2E catches those.

### Integration Tests = Checking Groups of Bricks

**Analogy:** Test the tower before adding it to the castle:
- Does the wall connect to the floor?
- Does the flag stay on top?

**In code:** Testing how modules work together (less common in our codebase).

### Mocks = Fake LEGO Bricks

**Analogy:** Instead of using real gold LEGO for testing, you use painted plastic that looks like gold.

**In code:** We fake the Chrome API and Gmail API:
- Pretend Chrome gives us a fake login token
- Pretend Gmail returns fake emails

**Why:** Tests must run fast and not require real Gmail accounts.

### Coverage = How Much Did You Check?

**Analogy:** After building, you count:
- "I checked 80% of all bricks" → Good
- "I only checked 20% of bricks" → Risky

**In code:** Our report shows:
- `handlers/` = 100% covered (every line tested)
- `gmail/` = 25% covered (needs more tests)

---

## Test Infrastructure

### Frameworks
- **Vitest** - Unit testing framework (replacement for Jest)
- **Playwright** - End-to-end browser automation
- **@testing-library/react** - React component testing utilities

### Configuration Files
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `src/test/vitest.d.ts` - Type declarations for test globals
- `src/test/setup.ts` - Test environment setup with Chrome API mocks

## Running Tests

### Unit Tests

```bash
# Run all unit tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**What these actually do (ELI5):**

| Command | What Happens | Analogy |
|---------|--------------|---------|
| `npm test` | Runs all 21 tests one time, prints pass/fail | Like checking all bricks once and writing down results |
| `npm run test:watch` | Keeps tests running, re-runs when you change code | Like having a helper who re-checks bricks every time you touch the castle |
| `npm run test:coverage` | Runs tests + counts which lines were tested | Like checking bricks AND marking each one with a checkmark |

### E2E Tests

```bash
# Run Playwright E2E tests
npm run test:e2e

# Run E2E tests with UI mode (for debugging)
npm run test:e2e:ui
```

**What these actually do (ELI5):**

| Command | What Happens | Analogy |
|---------|--------------|---------|
| `npm run test:e2e` | Opens Chrome, loads Gmail, clicks buttons, checks if they work | Like having a robot walk around your castle and try every door |
| `npm run test:e2e:ui` | Same thing BUT you can watch the browser and pause | Like watching that robot through a window so you can see where it gets stuck |

## Test Structure

### Unit Tests (`src/test/`)

| Test File | Description | Test Count |
|-----------|-------------|------------|
| `ai/confidence.test.ts` | Confidence calculation logic | 3 |
| `ai/schemas.test.ts` | Zod schema validation | 7 |
| `ai/handlers.test.ts` | Action handler execution | 5 |
| `ai/engine.test.ts` | Registry, executor, factory | 6 |

**Total: 21 unit tests**

---

### Detailed Test Breakdown

#### 1. confidence.test.ts (3 tests)
Tests the AI confidence scoring algorithm:

| # | Test Name | What It Checks | Input → Expected |
|---|-----------|----------------|------------------|
| 1 | High-confidence search | Clear command like "search emails from john" returns high confidence | Clear input → confidence ≥ 0.8 |
| 2 | Low-confidence unclear | Vague command like "do something" returns low confidence | Unclear input → confidence < 0.8 |
| 3 | Destructive action adjustment | Delete action confidence stays between 0-1 | Delete action → valid confidence |

#### 2. schemas.test.ts (7 tests)
Tests data validation (Zod schemas):

| # | Test Name | What It Checks | Example |
|---|-----------|----------------|---------|
| 4 | Valid search action | Search with proper fields passes | `{action: "search_emails", query: "..."}` → ✓ |
| 5 | Invalid search action | Missing `query` field fails | Missing query → ✗ |
| 6 | Valid archive action | Archive with all fields passes | Archive fields → ✓ |
| 7 | Valid delete action | Delete with all fields passes | Delete fields → ✓ |
| 8 | Valid clarify action | Clarify with reason passes | Clarify fields → ✓ |
| 9 | All action types valid | All 4 types work in union schema | 4 valid actions → all ✓ |
| 10 | Reject unknown types | Random action gets rejected | `unknown_action` → ✗ |

#### 3. handlers.test.ts (5 tests)
Tests actual action execution functions:

| # | Test Name | What It Checks | Scenario |
|---|-----------|----------------|----------|
| 11 | Search returns results | `handleSearchEmails` calls Gmail API | Fake Gmail → returns threads |
| 12 | Archive preview | `handleArchiveEmails` fetches preview | Fake Gmail → shows preview |
| 13 | Delete preview | `handleDeleteEmails` shows "Ready to delete X" | Fake Gmail → delete preview |
| 14 | Empty delete results | No threads match → "No threads found" | Empty → error message |
| 15 | Clarify request | `handleClarify` returns reason as error | Reason → returned as error |

#### 4. engine.test.ts (6 tests)
Tests action engine system:

| # | Test Name | What It Checks | How |
|---|-----------|----------------|-----|
| 16 | Empty registry | New registry has no handlers | `new HandlerRegistry()` → empty |
| 17 | Register and retrieve | Can add handler and get it back | Register → same function |
| 18 | Execute registered | Executor runs handler when matched | Mock → mock result |
| 19 | Error unregistered | No handler → error message | Empty registry → "No handler" |
| 20 | Default handlers | Factory pre-registers all 4 handlers | `getActionEngine()` → can execute |
| 21 | Execute search | Full integration works | Engine + mock → success |

#### Summary by Category

| Category | Count | Protects Against |
|----------|-------|------------------|
| **Confidence Scoring** | 3 | AI over-confident on vague commands |
| **Data Validation** | 7 | Bad data crashing extension |
| **Action Execution** | 5 | Gmail API errors, empty results |
| **Engine System** | 6 | Broken handlers, missing registrations |

---

### E2E Tests (`e2e/`)

| Test File | Description |
|-----------|-------------|
| `extension.spec.ts` | Extension loading and UI interaction |

#### E2E Test Coverage
- Extension loads without errors on Gmail
- Floating assistant appears on page
- AI command input accepts text
- Service worker initialization

## Test Environment

### Mocks

The `src/test/setup.ts` file provides mocks for:
- Chrome Runtime API (`sendMessage`, `onMessage`)
- Chrome Identity API (`getAuthToken`)
- Chrome Storage API
- `fetch` global

### TypeScript Types

Test files have access to:
- Vitest globals (`describe`, `it`, `expect`, `vi`)
- Node.js globals (`global`)
- Chrome extension types

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from "vitest";
import { myFunction } from "../../path/to/module";

describe("My Module", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });

  it("should handle mock fetch", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "test" })
    });

    const result = await myAsyncFunction();
    expect(result).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("extension UI interaction", async ({ page }) => {
  await page.goto("https://mail.google.com");

  const toggle = await page.waitForSelector("[data-testid='assistant-toggle']");
  await toggle.click();

  const window = await page.waitForSelector("[data-testid='assistant-window']");
  expect(window).toBeTruthy();
});
```

## CI/CD Integration

Run tests in CI:

```bash
# Install dependencies
npm ci

# Run unit tests
npm test

# Build extension
npm run build

# Run E2E tests (requires built extension)
npm run test:e2e
```

## Troubleshooting

### TypeScript Errors in Tests

If you see `Cannot find name 'global'` errors in the IDE:
1. Restart TypeScript server (`Ctrl+Shift+P` → "TypeScript: Restart TS Server")
2. Or reload the VS Code window

The types are correctly configured in `tsconfig.json` but the IDE may need a refresh.

### E2E Test Failures

- Ensure extension is built before running E2E tests: `npm run build`
- Check that the extension loads in Chrome manually
- Use `npm run test:e2e:ui` to see the browser during tests

## Coverage

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- Terminal (text output)
- `coverage/` directory (HTML report)

Open `coverage/index.html` in browser for detailed coverage view.
