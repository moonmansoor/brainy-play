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

  const { error } = await supabase.from("activity_attempts").insert({
    child_id: parsed.data.childId,
    activity_id: parsed.data.activityId,
    activity_type: parsed.data.activityType,
    interaction_type: parsed.data.interactionType,
    learning_areas: parsed.data.learningAreas,
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

  return NextResponse.json({ ok: true, persisted: true });
}
