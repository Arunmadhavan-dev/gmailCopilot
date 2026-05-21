/// <reference types="vitest/globals" />

import type { Mock } from "vitest";

declare const global: typeof globalThis;

declare global {
  // Extend globalThis for vitest mocks
  var fetch: Mock;
}

export {};
