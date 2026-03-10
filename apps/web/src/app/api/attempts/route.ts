import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ActivityCompletionPayload } from "@/types/activity";

export async function POST(request: Request) {
  const body = (await request.json()) as ActivityCompletionPayload;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("activity_attempts").insert({
    child_id: body.childId,
    activity_id: body.activityId,
    score: body.score,
    stars_earned: body.starsEarned,
    completed: body.completed,
    hints_used: body.hintsUsed,
    mistakes_count: body.mistakesCount,
    duration_seconds: body.durationSeconds,
    started_at: body.startedAt,
    finished_at: body.finishedAt
  });

  if (error) {
    return NextResponse.json(
      { ok: false, persisted: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, persisted: true });
}
