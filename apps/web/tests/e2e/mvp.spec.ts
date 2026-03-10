import { expect, test } from "@playwright/test";

test("home page shows parent auth entry points", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /create parent account/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /parent login/i })).toBeVisible();
});

test("admin activity sync rejects anonymous requests", async ({ request }) => {
  const timestamp = new Date().toISOString();
  const response = await request.post("/api/admin/activities", {
    data: {
      id: "test-activity",
      title: "Test Activity",
      slug: "test-activity",
      type: "shape-match",
      ageMin: 4,
      ageMax: 6,
      difficulty: 1,
      instructionsText: "Pick the matching shape.",
      settingsConfig: {},
      defaultThemeId: "animals",
      supportedThemeIds: ["animals"],
      visualThemes: [
        {
          themeId: "animals",
          cardTitle: "Test card",
          cardBlurb: "Test blurb",
          heroTitle: "Test hero",
          heroHint: "Test hint",
          imageUrl: "/images/themes/animals-hero.svg",
          mascotMood: "Test mood"
        }
      ],
      items: [
        {
          id: "test-activity-item-1",
          activityId: "test-activity",
          orderIndex: 0,
          promptText: "Find the circle.",
          config: {
            promptShape: "circle",
            promptColor: "#fb7185",
            options: [{ id: "option-1", shape: "circle", color: "#fb7185" }]
          },
          answer: {
            correctOptionId: "option-1"
          },
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ],
      isPublished: false,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  });
  const body = await response.json();

  expect([401, 503]).toContain(response.status());
  expect(body.ok).toBeFalsy();
  expect(body.persisted).toBeFalsy();
});
