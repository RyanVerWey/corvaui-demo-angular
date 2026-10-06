import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  retries: 0,
  reporter: "line",
  use: { baseURL: "http://127.0.0.1:4189", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 320, height: 720 } } },
  ],
  webServer: { command: "npm run preview -- --port 4189 --strictPort", url: "http://127.0.0.1:4189", reuseExistingServer: false },
});
