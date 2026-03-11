import { NextResponse } from "next/server";

import { getServerAuthContext } from "@/features/auth/server-auth";
import { validateActivityAttempt } from "@/lib/validation/activity";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = validateActivityAttempt(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: parsed.error.issues[0]?.message ?? "Attempt payload is invalid."
      },
      { status: 400 }
    );
  }

  const { supabase, user } = await getServerAuthContext();

  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  if (!user) {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  let taskInstanceId = parsed.data.taskInstanceId ?? null;

  if (parsed.data.taskInstance) {
    const { data: generatedTask, error: taskError } = await supabase
      .from("generated_task_instances")
      .upsert(
        {
          id: parsed.data.taskInstance.id,
          session_id: parsed.data.taskInstance.sessionId,
          activity_id: parsed.data.taskInstance.activityId,
          child_id: parsed.data.taskInstance.childId ?? null,
          activity_type: parsed.data.taskInstance.activityType,
          skill_area: parsed.data.taskInstance.skillArea,
          skill_areas: parsed.data.taskInstance.skillAreas,
          level: parsed.data.taskInstance.level,
          generator_seed: parsed.data.taskInstance.generatorSeed,
          generator_version: parsed.data.taskInstance.generatorVersion,
          generated_config_json: parsed.data.taskInstance.generatedConfig,
          expected_answer_json: parsed.data.taskInstance.expectedAnswerSnapshot,
          generated_at: parsed.data.taskInstance.generatedAt
        },
        { onConflict: "session_id" }
      )
      .select("id")
      .single();

    if (taskError) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "Could not store the generated task instance."
        },
        { status: 500 }
      );
    }

    taskInstanceId = generatedTask?.id ?? parsed.data.taskInstance.id;
  }

  const { error } = await supabase.from("activity_attempts").insert({
    child_id: parsed.data.childId,
    activity_id: parsed.data.activityId,
    activity_type: parsed.data.activityType,
    interaction_type: parsed.data.interactionType,
    learning_areas: parsed.data.learningAreas,
    skill_areas: parsed.data.skillAreas ?? [],
    primary_skill_area: parsed.data.primarySkillArea ?? null,
    session_id: parsed.data.sessionId ?? null,
    task_instance_id: taskInstanceId,
    generator_seed: parsed.data.generatorSeed ?? null,
    level_played: parsed.data.levelPlayed,
    difficulty_snapshot: parsed.data.difficultySnapshot,
    score: parsed.data.score,
    success_rate: parsed.data.successRate,
    correct_answers_count: parsed.data.correctAnswersCount,
    total_questions: parsed.data.totalQuestions,
    stars_earned: parsed.data.starsEarned,
    completed: parsed.data.completed,
    hints_used: parsed.data.hintsUsed,
    mistakes_count: parsed.data.mistakesCount,
    duration_seconds: parsed.data.durationSeconds,
    explanation_text: parsed.data.explanationText ?? null,
    fun_fact: parsed.data.funFact ?? null,
    learning_area_scores_json: parsed.data.learningAreaScores,
    skill_area_scores_json: parsed.data.skillAreaScores ?? {},
    mastery_level_before: parsed.data.masteryLevelBefore ?? null,
    mastery_level_after: parsed.data.masteryLevelAfter ?? null,
    mastery_score_before: parsed.data.masteryScoreBefore ?? null,
    mastery_score_after: parsed.data.masteryScoreAfter ?? null,
    level_advanced: parsed.data.levelAdvanced ?? false,
    needs_more_practice: parsed.data.needsMorePractice ?? [],
    started_at: parsed.data.startedAt,
    finished_at: parsed.data.finishedAt
  });

  if (error) {
    const status = error.code === "42501" ? 403 : 500;
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error:
          status === 403
            ? "Not authorized to save this activity attempt."
            : "Could not save activity attempt."
      },
      { status }
    );
  }

  if (
    parsed.data.primarySkillArea &&
    parsed.data.masteryLevelAfter &&
    parsed.data.masteryScoreAfter !== undefined
  ) {
    await supabase.from("child_skill_progress").upsert(
      {
        child_id: parsed.data.childId,
        skill_area: parsed.data.primarySkillArea,
        current_level: parsed.data.masteryLevelAfter,
        mastery_score: parsed.data.masteryScoreAfter,
        attempts_at_current_level: 0,
        successful_attempts_at_current_level: parsed.data.completed ? 1 : 0,
        average_success_rate: parsed.data.successRate,
        average_mistakes: parsed.data.mistakesCount,
        average_duration_seconds: parsed.data.durationSeconds,
        weakness_score: Math.max(0, 100 - parsed.data.masteryScoreAfter),
        status:
          parsed.data.needsMorePractice && parsed.data.needsMorePractice.length > 0
            ? "practicing"
            : parsed.data.levelAdvanced
              ? "mastered"
              : "ready-to-advance",
        level_label: `Level ${parsed.data.masteryLevelAfter}`,
        positive_summary: "Adaptive mastery is updating after each fresh task set.",
        next_goal:
          parsed.data.levelAdvanced
            ? `Start practicing Level ${parsed.data.masteryLevelAfter}.`
            : `Keep practicing Level ${parsed.data.masteryLevelAfter} for stronger mastery.`,
        last_practiced_at: parsed.data.finishedAt
      },
      { onConflict: "child_id,skill_area" }
    );
  }

  return NextResponse.json({ ok: true, persisted: true });
}
