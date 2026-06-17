// vitest.d.ts - global type declarations for test environment
declare global {
  interface Window {
    // Allow any shape for localStorage mock functions in tests
    localStorage: any;
  }
}
export {};
