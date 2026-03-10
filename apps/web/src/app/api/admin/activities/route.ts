import { NextResponse } from "next/server";

import { getServerAuthContext } from "@/features/auth/server-auth";
import { validateActivityDefinition } from "@/lib/validation/activity";

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

  const parsed = validateActivityDefinition(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: parsed.error.issues[0]?.message ?? "Activity payload is invalid."
      },
      { status: 400 }
    );
  }

  const { supabase, user, profile } = await getServerAuthContext();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Admin sync requires Supabase authentication."
      },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Admin access required." },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("activities").upsert(
    {
      id: parsed.data.id,
      template_id: parsed.data.templateId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type,
      interaction_type: parsed.data.interactionType,
      age_min: parsed.data.ageMin,
      age_max: parsed.data.ageMax,
      difficulty: parsed.data.difficulty,
      recommended_level: parsed.data.recommendedLevel,
      learning_areas: parsed.data.learningAreas,
      instructions_text: parsed.data.instructionsText,
      explanation_text: parsed.data.explanationText,
      fun_fact: parsed.data.funFact,
      instructions_audio_url: parsed.data.instructionsAudioUrl ?? null,
      thumbnail_url: parsed.data.thumbnailUrl ?? null,
      config_json: {
        ...(parsed.data.settingsConfig ?? {}),
        templateKey: parsed.data.templateKey
      },
      default_theme_id: parsed.data.defaultThemeId,
      theme_ids: parsed.data.supportedThemeIds,
      visual_config_json: parsed.data.visualThemes,
      is_published: parsed.data.isPublished
    },
    { onConflict: "slug" }
  );

  if (error) {
    const status = error.code === "42501" ? 403 : 500;
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error:
          status === 403
            ? "Not authorized to save this activity."
            : "Could not save activity."
      },
      { status }
    );
  }

  const { error: deleteError } = await supabase
    .from("activity_items")
    .delete()
    .eq("activity_id", parsed.data.id);

  if (deleteError) {
    const status = deleteError.code === "42501" ? 403 : 500;
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error:
          status === 403
            ? "Not authorized to replace activity items."
            : "Could not replace activity items."
      },
      { status }
    );
  }

  const { error: itemsError } = await supabase.from("activity_items").insert(
    parsed.data.items.map((item) => ({
      id: item.id,
      activity_id: parsed.data.id,
      order_index: item.orderIndex,
      prompt_text: item.promptText ?? null,
      config_json: item.config,
      answer_json: item.answer,
      asset_references_json: item.assetRefs ?? [],
      difficulty_override: item.difficultyOverride ?? null
    }))
  );

  if (itemsError) {
    const status = itemsError.code === "42501" ? 403 : 500;
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error:
          status === 403
            ? "Not authorized to save activity items."
            : "Could not save activity items."
      },
      { status }
    );
  }

  return NextResponse.json({ ok: true, persisted: true });
}
