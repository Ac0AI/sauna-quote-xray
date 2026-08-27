import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'BRAND_CLAIM_INVITE_SECRET=playwright-brand-claim-invitation-secret-2026 MCP_QUOTE_REQUEST_SECRET=playwright-mcp-quote-request-secret-2026 PORT=3002 pnpm run start',
    port: 3002,
    reuseExistingServer: true,
  },
})
