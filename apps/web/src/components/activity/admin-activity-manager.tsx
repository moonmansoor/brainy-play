"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { listActivities, mergeActivities } from "@/features/activities/repository";
import { sampleActivities, themePacks } from "@/lib/constants/sample-data";
import { loadStoredActivities, saveActivityLocally } from "@/lib/utils/storage";
import {
  getDefaultItemsForType,
  getDefaultSettingsForType,
  validateActivityForm
} from "@/lib/validation/activity";
import { ActivityDefinition, ActivityItem, ActivityType } from "@/types/activity";

const typeOptions: ActivityType[] = [
  "shape-match",
  "count-objects",
  "pattern-complete",
  "odd-one-out",
  "sequence-order",
  "sort-game"
];

function buildFallbackVisuals(type: ActivityType): ActivityDefinition["visualThemes"] {
  const theme = themePacks[0];

  return [
    {
      themeId: theme.id,
      cardTitle: `${theme.name} ${type}`,
      cardBlurb: "Starter visual variant ready for future theme packs.",
      heroTitle: `${theme.name} learning scene`,
      heroHint: "Swap in a richer theme variant from the content studio later.",
      imageUrl: theme.imageUrl,
      mascotMood: `${theme.mascotName} is ready to help.`
    }
  ];
}

function serializeItemsForForm(activity?: ActivityDefinition) {
  return JSON.stringify(
    activity?.items.map((item) => ({
      id: item.id,
      orderIndex: item.orderIndex,
      promptText: item.promptText,
      config: item.config,
      answer: item.answer,
      assetRefs: item.assetRefs,
      difficultyOverride: item.difficultyOverride
    })) ?? JSON.parse(getDefaultItemsForType("shape-match")),
    null,
    2
  );
}

function toFormState(activity?: ActivityDefinition) {
  return {
    title: activity?.title ?? "",
    slug: activity?.slug ?? "",
    type: activity?.type ?? ("shape-match" as ActivityType),
    ageMin: activity?.ageMin ?? 4,
    ageMax: activity?.ageMax ?? 6,
    difficulty: activity?.difficulty ?? 1,
    instructionsText: activity?.instructionsText ?? "",
    isPublished: activity?.isPublished ?? true,
    settingsConfig: JSON.stringify(activity?.settingsConfig ?? {}, null, 2),
    itemsConfig: serializeItemsForForm(activity)
  };
}

export function AdminActivityManager() {
  const initialSelectedSlug = useRef<string | null>(sampleActivities[0]?.slug ?? null);
  const [activities, setActivities] = useState<ActivityDefinition[]>(sampleActivities);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialSelectedSlug.current
  );
  const [formState, setFormState] = useState(() => toFormState(sampleActivities[0]));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function hydrate() {
      const remoteActivities = await listActivities();
      const merged = mergeActivities(remoteActivities, loadStoredActivities());
      const initialSlug = initialSelectedSlug.current ?? merged[0]?.slug ?? null;
      const initialActivity = merged.find((activity) => activity.slug === initialSlug);

      setActivities(merged);
      setSelectedSlug(initialSlug);

      if (initialActivity) {
        setFormState(toFormState(initialActivity));
      }
    }

    void hydrate();
  }, []);

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.slug === selectedSlug) ?? null,
    [activities, selectedSlug]
  );

  async function syncActivity(activity: ActivityDefinition) {
    const response = await fetch("/api/admin/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(activity)
    });

    return response.json();
  }

  function handleSave() {
    const parsed = validateActivityForm(formState);

    if (!parsed.success) {
      setMessage("Check the form fields and JSON before saving.");
      return;
    }

    let settingsConfig: ActivityDefinition["settingsConfig"];
    let rawItems: Array<{
      id?: string;
      orderIndex?: number;
      promptText?: string;
      config: ActivityItem["config"];
      answer: ActivityItem["answer"];
      assetRefs?: ActivityItem["assetRefs"];
      difficultyOverride?: ActivityItem["difficultyOverride"];
    }>;

    try {
      settingsConfig = JSON.parse(parsed.data.settingsConfig) as ActivityDefinition["settingsConfig"];
      rawItems = JSON.parse(parsed.data.itemsConfig) as typeof rawItems;
    } catch {
      setMessage("Settings JSON or items JSON is not valid.");
      return;
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      setMessage("Add at least one activity item.");
      return;
    }

    const activityId = selectedActivity?.id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const items: ActivityItem[] = rawItems.map((item, index) => ({
      id: item.id ?? `${activityId}-item-${index + 1}`,
      activityId,
      orderIndex: item.orderIndex ?? index,
      promptText: item.promptText,
      config: item.config,
      answer: item.answer,
      assetRefs: item.assetRefs,
      difficultyOverride: item.difficultyOverride,
      createdAt: selectedActivity?.items[index]?.createdAt ?? now,
      updatedAt: now
    }));

    const nextActivity: ActivityDefinition = {
      id: activityId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type,
      ageMin: parsed.data.ageMin,
      ageMax: parsed.data.ageMax,
      difficulty: parsed.data.difficulty as ActivityDefinition["difficulty"],
      instructionsText: parsed.data.instructionsText,
      isPublished: parsed.data.isPublished,
      thumbnailUrl: selectedActivity?.thumbnailUrl,
      settingsConfig,
      items,
      defaultThemeId: selectedActivity?.defaultThemeId ?? "animals",
      supportedThemeIds: selectedActivity?.supportedThemeIds ?? ["animals"],
      visualThemes:
        selectedActivity?.visualThemes ?? buildFallbackVisuals(parsed.data.type),
      createdAt: selectedActivity?.createdAt ?? now,
      updatedAt: now
    };

    saveActivityLocally(nextActivity);
    const merged = mergeActivities(sampleActivities, loadStoredActivities());
    setActivities(merged);
    setSelectedSlug(nextActivity.slug);
    setMessage("Saved locally.");

    startTransition(async () => {
      try {
        const result = await syncActivity(nextActivity);
        setMessage(
          result.persisted
            ? "Saved locally and synced to Supabase."
            : result.error || "Saved locally. Add Supabase env vars to sync."
        );
      } catch {
        setMessage("Saved locally. Add Supabase env vars to sync.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold">Activities</h2>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedSlug(null);
              setFormState({
                ...toFormState(),
                settingsConfig: getDefaultSettingsForType("shape-match"),
                itemsConfig: getDefaultItemsForType("shape-match")
              });
              setMessage("");
            }}
          >
            New activity
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          {activities.map((activity) => (
            <button
              key={activity.slug}
              type="button"
              onClick={() => {
                setSelectedSlug(activity.slug);
                setFormState(toFormState(activity));
              }}
              className={`rounded-[1.5rem] p-4 text-left ${
                selectedSlug === activity.slug ? "bg-orange-100" : "bg-slate-50"
              }`}
            >
              <p className="font-semibold">{activity.title}</p>
              <p className="text-sm text-slate-600">
                {activity.type} • {activity.items.length} items
              </p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="font-display text-3xl font-semibold">
          {selectedSlug ? "Edit activity" : "Create activity"}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Title
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Slug
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.slug}
              onChange={(event) =>
                setFormState((current) => ({ ...current, slug: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Type
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.type}
              onChange={(event) => {
                const type = event.target.value as ActivityType;
                setFormState((current) => ({
                  ...current,
                  type,
                  settingsConfig: getDefaultSettingsForType(type),
                  itemsConfig: getDefaultItemsForType(type)
                }));
              }}
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Difficulty
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.difficulty}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  difficulty: Number(event.target.value) as ActivityDefinition["difficulty"]
                }))
              }
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Age min
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              type="number"
              min={4}
              max={12}
              value={formState.ageMin}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  ageMin: Number(event.target.value)
                }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Age max
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              type="number"
              min={4}
              max={12}
              value={formState.ageMax}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  ageMax: Number(event.target.value)
                }))
              }
            />
          </label>
          <label className="md:col-span-2 grid gap-2 text-sm font-semibold">
            Instructions
            <textarea
              className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.instructionsText}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  instructionsText: event.target.value
                }))
              }
            />
          </label>
          <label className="md:col-span-2 grid gap-2 text-sm font-semibold">
            Activity settings JSON
            <textarea
              className="min-h-32 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-50"
              value={formState.settingsConfig}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  settingsConfig: event.target.value
                }))
              }
            />
          </label>
          <label className="md:col-span-2 grid gap-2 text-sm font-semibold">
            Activity items JSON
            <textarea
              className="min-h-72 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-50"
              value={formState.itemsConfig}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  itemsConfig: event.target.value
                }))
              }
            />
          </label>
          <div className="md:col-span-2 rounded-[1.5rem] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Activity logic stays in code, but each activity now stores a set of
            ordered question items. That keeps the MVP simple while making future
            content creation much easier to scale.
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={formState.isPublished}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  isPublished: event.target.checked
                }))
              }
            />
            Published
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save activity"}
          </Button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
