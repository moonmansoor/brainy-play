import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ActivityDefinition } from "@/types/activity";

export async function POST(request: Request) {
  const body = (await request.json()) as ActivityDefinition;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("activities").upsert(
    {
      id: body.id,
      title: body.title,
      slug: body.slug,
      type: body.type,
      age_min: body.ageMin,
      age_max: body.ageMax,
      difficulty: body.difficulty,
      instructions_text: body.instructionsText,
      instructions_audio_url: body.instructionsAudioUrl ?? null,
      thumbnail_url: body.thumbnailUrl ?? null,
      config_json: body.settingsConfig ?? {},
      default_theme_id: body.defaultThemeId,
      theme_ids: body.supportedThemeIds,
      visual_config_json: body.visualThemes,
      is_published: body.isPublished
    },
    { onConflict: "slug" }
  );

  if (error) {
    return NextResponse.json(
      { ok: false, persisted: false, error: error.message },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabase
    .from("activity_items")
    .delete()
    .eq("activity_id", body.id);

  if (deleteError) {
    return NextResponse.json(
      { ok: false, persisted: false, error: deleteError.message },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("activity_items").insert(
    body.items.map((item) => ({
      id: item.id,
      activity_id: body.id,
      order_index: item.orderIndex,
      prompt_text: item.promptText ?? null,
      config_json: item.config,
      answer_json: item.answer,
      asset_references_json: item.assetRefs ?? [],
      difficulty_override: item.difficultyOverride ?? null
    }))
  );

  if (itemsError) {
    return NextResponse.json(
      { ok: false, persisted: false, error: itemsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, persisted: true });
}
