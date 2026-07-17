import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// RTL's auto-cleanup only self-registers when vitest's `globals: true` is set;
// this project keeps globals off, so register it explicitly here instead of
// repeating `afterEach(() => cleanup())` in every test file.
afterEach(() => {
  cleanup();
});
