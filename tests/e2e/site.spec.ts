import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

const routes = [
  ["home", "/", "Infrastructure decisions", 1],
  ["analytics", "/#/analytics", "Critical operations command center", 1],
  ["work-orders", "/#/work-orders", "Create a service visit", 0],
  ["customers", "/#/customers", "Account pipeline", 0],
  ["data", "/#/data-table", "Service records data table", 0],
  ["settings", "/#/settings", "Workspace controls", 0],
  ["about", "/#/about", "Angular plus CorvaUI", 0],
] as const;

for (const [name, path, content, imageCount] of routes) {
  test(`${name} is responsive and WCAG AA clean`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText(content, { exact: false }).first()).toBeVisible();
    const disclosure = page.getByRole("note", { name: "Fictional demo disclosure" });
    await expect(disclosure).toBeVisible();
    await expect(disclosure).toContainText("Fictional product demonstration");
    await expect(disclosure).toContainText("Nothing shown is a customer endorsement or live service.");
    if (name === "home") {
      await expect(page.getByText("Synthetic data", { exact: true })).toBeVisible();
      if (testInfo.project.name === "mobile") {
        const mobileLinks = page.locator(".mobile-nav a");
        await expect(mobileLinks).toHaveCount(7);
        await expect(mobileLinks.getByText("Work orders", { exact: true })).toBeVisible();
      }
    }
    await expect(page.locator(".route-panel img")).toHaveCount(imageCount);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    if (["data", "customers"].includes(name) && testInfo.project.name === "mobile") {
      const gridScroll = page.locator(".data-grid-scroll");
      await expect(gridScroll).toBeVisible();
      const dimensions = await gridScroll.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
      expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
    }
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => (await (window as typeof window & { axe: { run: Function } }).axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations);
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
    if (name === "home" && testInfo.project.name === "mobile") {
      await page.locator(".mobile-nav a").getByText("Work orders", { exact: true }).click();
      await expect(page).toHaveURL(/\/work-orders$/);
    }
  });
}

test("Concept dark mode stays accessible", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("corva-switch").click();
  await expect(page.locator(".site-shell")).toHaveAttribute("data-corva-theme", "concept-dark");
});

test("analytics chart renders three distinct theme series", async ({ page }) => {
  await page.goto("/#/analytics", { waitUntil: "networkidle" });
  const legend = page.getByRole("group", { name: "Weekly dispatch completion series" });
  await expect(legend).toBeVisible();
  await expect(page.locator(".corva-chart-legend-item")).toHaveCount(3);
  const colors = await page.locator(".corva-chart-swatch").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).backgroundColor),
  );
  expect(new Set(colors).size).toBe(3);
});
