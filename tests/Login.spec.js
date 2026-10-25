import { test } from "@playwright/test";

// Override the global storageState so this spec runs as a fresh,
// unauthenticated browser — otherwise Playwright injects the saved
// auth session before the test starts and the login flow is skipped.
test.use({ storageState: { cookies: [], origins: [] } });

test("Creating storage state", async ({ page }) => {
    await page.goto("https://fin-dash-beta-weld.vercel.app/");
    await page.getByRole('link', { name: 'Log in' }).click();
    await page.getByRole('textbox', { name: 'you@example.com' }).fill('venkateshamulraj@gmail.com');
    await page.getByRole('textbox', { name: 'you@example.com' }).press('Tab');
    await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
    await page.getByText("Sign in", { exact: true }).click();
    await page.waitForURL("**/dashboard");
    await page.context().storageState({
        path: "test_data/authentication.json",
    });
});