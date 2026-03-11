import { expect, test, type Page } from "@playwright/test";

const parentId = "parent-e2e";
const childId = "child-e2e";

const parentAccount = {
  id: parentId,
  role: "parent",
  email: "parent-e2e@example.com",
  fullName: "E2E Parent"
};

const childProfile = {
  id: childId,
  parentId,
  displayName: "Mika",
  birthDate: "2020-04-10",
  schoolStandard: "Kindergarten",
  progressSummary: "Enjoys fresh logic challenges.",
  themePreferences: {
    favoriteThemes: ["animals", "nature"],
    favoriteColor: "#ef8b47",
    preferredRewardStyle: "sparkles",
    preferredAvatarStyle: "dreamer"
  }
};

const seededAttempts = [
  {
    id: "attempt-shape-1",
    childId,
    activityId: "activity-shape-match",
    activityType: "shape-match",
    interactionType: "object-match",
    learningAreas: ["pattern-recognition", "spatial-thinking"],
    skillAreas: ["shape-recognition", "pattern-recognition", "spatial-reasoning"],
    primarySkillArea: "shape-recognition",
    sessionId: "session-shape-1",
    taskInstanceId: "task-shape-1",
    generatorSeed: "seed-shape-1",
    levelPlayed: 1,
    difficultySnapshot: 1,
    score: 95,
    successRate: 100,
    correctAnswersCount: 3,
    totalQuestions: 3,
    starsEarned: 3,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 0,
    durationSeconds: 20,
    explanationText: "Matching shapes helps your brain notice visual clues.",
    funFact: "Did you know? Bees can spot visual patterns.",
    learningAreaScores: {
      "pattern-recognition": 100,
      "spatial-thinking": 100
    },
    skillAreaScores: {
      "shape-recognition": 100,
      "pattern-recognition": 100,
      "spatial-reasoning": 100
    },
    masteryLevelBefore: 1,
    masteryLevelAfter: 1,
    masteryScoreBefore: 0,
    masteryScoreAfter: 74,
    levelAdvanced: false,
    needsMorePractice: ["shape-recognition"],
    startedAt: "2026-03-09T08:10:00.000Z",
    finishedAt: "2026-03-09T08:10:20.000Z"
  },
  {
    id: "attempt-sequence-1",
    childId,
    activityId: "activity-sequence-order",
    activityType: "sequence-order",
    interactionType: "sequence",
    learningAreas: ["sequencing", "logic-reasoning", "problem-solving"],
    skillAreas: ["sequencing", "logic-reasoning", "problem-solving"],
    primarySkillArea: "sequencing",
    sessionId: "session-sequence-1",
    taskInstanceId: "task-sequence-1",
    generatorSeed: "seed-sequence-1",
    levelPlayed: 1,
    difficultySnapshot: 1,
    score: 45,
    successRate: 34,
    correctAnswersCount: 1,
    totalQuestions: 3,
    starsEarned: 0,
    completed: false,
    hintsUsed: 0,
    mistakesCount: 3,
    durationSeconds: 85,
    explanationText: "Putting steps in order trains sequencing.",
    funFact: "Did you know? Rockets use countdown sequences.",
    learningAreaScores: {
      sequencing: 34,
      "logic-reasoning": 34,
      "problem-solving": 34
    },
    skillAreaScores: {
      sequencing: 34,
      "logic-reasoning": 34,
      "problem-solving": 34
    },
    masteryLevelBefore: 1,
    masteryLevelAfter: 1,
    masteryScoreBefore: 0,
    masteryScoreAfter: 40,
    levelAdvanced: false,
    needsMorePractice: ["sequencing"],
    startedAt: "2026-03-09T08:20:00.000Z",
    finishedAt: "2026-03-09T08:21:25.000Z"
  }
];

async function seedLocalSession(page: Page) {
  await page.addInitScript(
    ({ parent, child, attempts }) => {
      window.localStorage.setItem("cfb.local-parents", JSON.stringify([parent]));
      window.localStorage.setItem("cfb.current-parent-id", parent.id);
      window.localStorage.setItem("cfb.local-children", JSON.stringify([child]));
      window.localStorage.setItem("cfb.attempts", JSON.stringify(attempts));
    },
    {
      parent: parentAccount,
      child: childProfile,
      attempts: seededAttempts
    }
  );
}

test("home page shows parent auth entry points", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /create parent account/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /parent login/i })).toBeVisible();
});

test("admin activity sync rejects anonymous requests with current activity payload", async ({
  request
}) => {
  const timestamp = new Date().toISOString();
  const response = await request.post("/api/admin/activities", {
    data: {
      id: "test-activity",
      templateId: "template-shape-match",
      templateKey: "shape-match",
      title: "Test Activity",
      slug: "test-activity",
      type: "shape-match",
      interactionType: "object-match",
      ageMin: 4,
      ageMax: 6,
      difficulty: 1,
      recommendedLevel: 1,
      learningAreas: ["pattern-recognition", "spatial-thinking"],
      skillAreas: ["shape-recognition", "pattern-recognition", "spatial-reasoning"],
      primarySkillArea: "shape-recognition",
      instructionsText: "Pick the matching shape.",
      explanationText: "Matching shapes builds pattern noticing.",
      funFact: "Did you know? Bees can spot patterns.",
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
            options: [
              { id: "option-1", shape: "circle", color: "#fb7185" },
              { id: "option-2", shape: "square", color: "#60a5fa" }
            ]
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

test("adaptive activity library shows current level and practice focus", async ({
  page
}) => {
  await seedLocalSession(page);
  await page.goto(`/child/activities?childId=${childId}`);

  await expect(page.getByText(/themed activity library/i)).toBeVisible();
  await expect(page.getByText(/level 1 logic learner/i).first()).toBeVisible();
  await expect(page.getByText(/practicing logic reasoning/i)).toBeVisible();
  await expect(page.getByText(/needs more practice/i).first()).toBeVisible();
});

test("adaptive player renders generated level-aware rounds", async ({ page }) => {
  await seedLocalSession(page);
  await page.goto(`/child/activities/shape-match-adventure?childId=${childId}`);

  await expect(page.getByText(/question 1 of 3/i)).toBeVisible();
  await expect(page.getByText(/object matching/i).first()).toBeVisible();
});

test("parent dashboard shows strengths and needs more practice", async ({ page }) => {
  await seedLocalSession(page);
  await page.goto(`/parent?childId=${childId}`);

  await expect(page.getByRole("heading", { name: /practicing now/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /needs more practice/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /strengths/i })).toBeVisible();
  await expect(page.getByText(/keep practicing sequencing/i)).toBeVisible();
});
