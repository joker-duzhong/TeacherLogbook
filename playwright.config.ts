import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/web',
  timeout: 120000,
  workers: 1,
  use: {
    baseURL: process.env.WEB_TEST_URL || 'http://127.0.0.1:5174',
    channel: 'msedge',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
