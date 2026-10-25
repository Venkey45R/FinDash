import { test, expect } from "@playwright/test";
import fs from "fs";

const BASE_URL = "https://fin-dash-beta-weld.vercel.app";

const routes = [
    { route: "/", name: "dashboard" },
];

const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
];

// Ensure the output directory exists before any screenshot is saved
const SCREENSHOT_DIR = "screenshot";
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.setTimeout(120_000); // 2 min — networkidle + 3 viewports × 5 screenshots each

test("take screen shots", async ({ page }) => {
    const results = [];

    for (const route of routes) {
        const screenShots = {};

        for (const vp of viewports) {
            // Set viewport BEFORE navigating so the page renders at the right size
            await page.setViewportSize({ width: vp.width, height: vp.height });

            await page.goto(`${BASE_URL}${route.route}`, {
                waitUntil: "networkidle",
            });

            // Confirm the dashboard has loaded before taking any screenshot
            await expect(
                page.getByRole("heading", { name: "Dashboard Overview" })
            ).toBeVisible({ timeout: 15_000 });

            // ── 1. Base dashboard ─────────────────────────────────────────────
            let filePath = `${SCREENSHOT_DIR}/${route.name}-${vp.name}.png`;
            await page.screenshot({ path: filePath, fullPage: true });
            screenShots[vp.name] = filePath;

            // ── 2. AI Portfolio Analysis sidebar ─────────────────────────────
            // The Sparkles floater button (white/frosted glass style)
            const analysisBtn = page
                .locator("button.group.relative:has(.lucide-sparkles):not(.hidden)")
                .first();
            await analysisBtn.click();
            await expect(
                page.getByRole("heading", { name: "FinDash Analysis" })
            ).toBeVisible({ timeout: 8_000 });

            filePath = `${SCREENSHOT_DIR}/${route.name}-${vp.name}-analysis.png`;
            await page.screenshot({ path: filePath, fullPage: true });

            // Close sidebar — sidebar uses CSS translate-x-full (stays in DOM),
            // so toBeHidden() never works. Wait for the 500ms slide-out animation instead.
            await page.locator("button:has(.lucide-x)").first().click();
            await page.waitForTimeout(600);

            // ── 3. AI Chat sidebar ────────────────────────────────────────────
            // The green gradient chat floater (MessageSquare icon)
            const chatBtn = page
                .locator("button.group.relative:has(.lucide-message-square):not(.hidden)")
                .first();
            await chatBtn.click();
            await page.waitForTimeout(600);

            filePath = `${SCREENSHOT_DIR}/${route.name}-${vp.name}-aichat.png`;
            await page.screenshot({ path: filePath, fullPage: true });

            // Close chat sidebar
            await page.locator("button:has(.lucide-x)").first().click();
            await page.waitForTimeout(400);

            // ── 4. Budgeting sidebar ──────────────────────────────────────────
            await page.getByText("FinDash Budgeting").click();
            await page.waitForTimeout(600);

            filePath = `${SCREENSHOT_DIR}/${route.name}-${vp.name}-budget.png`;
            await page.screenshot({ path: filePath, fullPage: true });

            // Close budget sidebar
            await page.locator("button:has(.lucide-x)").first().click();
            await page.waitForTimeout(400);

            // ── 5. Tracking sidebar ───────────────────────────────────────────
            await page.getByText("FinDash Tracking").click();
            await page.waitForTimeout(600);

            filePath = `${SCREENSHOT_DIR}/${route.name}-${vp.name}-tracking.png`;
            await page.screenshot({ path: filePath, fullPage: true });

            // Close tracking sidebar before moving to the next viewport
            await page.locator("button:has(.lucide-x)").first().click();
            await page.waitForTimeout(400);
        }

        results.push({ route: route.name, screenShots });
    }

    console.log(JSON.stringify(results, null, 2));
});