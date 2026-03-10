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
    score: parsed.data.score,
    stars_earned: parsed.data.starsEarned,
    completed: parsed.data.completed,
    hints_used: parsed.data.hintsUsed,
    mistakes_count: parsed.data.mistakesCount,
    duration_seconds: parsed.data.durationSeconds,
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
