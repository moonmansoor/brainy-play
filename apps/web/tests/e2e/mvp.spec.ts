import { expect, test } from "@playwright/test";

test("home page shows parent auth entry points", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /create parent account/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /parent login/i })).toBeVisible();
});
