"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeChip } from "@/components/activity/theme-chip";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { themePacks } from "@/lib/constants/sample-data";
import {
  getChildAge,
  getChildThemePreferences,
  getThemePack
} from "@/lib/utils/activity";
import {
  AvatarStyle,
  ChildProfile,
  ChildThemePreferences,
  RewardStyle,
  ThemeId
} from "@/types/activity";

const rewardStyles: RewardStyle[] = ["sparkles", "badges", "stickers"];
const avatarStyles: AvatarStyle[] = ["dreamer", "adventurer", "explorer"];
const colorChoices = ["#ef8b47", "#5b7cfa", "#3db27f", "#d36d92", "#1f9fd7"];

export function ChildProfilePicker({
  childProfiles,
  onSavePreferences,
  onOpenChild
}: {
  childProfiles: ChildProfile[];
  onSavePreferences?: (
    childId: string,
    preferences: ChildThemePreferences
  ) => Promise<void> | void;
  onOpenChild?: (
    childId: string,
    destination: "activities" | "progress"
  ) => Promise<void> | void;
}) {
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState(
    childProfiles[0]?.id ?? ""
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedChildId((current) => current || childProfiles[0]?.id || "");
  }, [childProfiles]);

  const selectedChild = useMemo(
    () => childProfiles.find((child) => child.id === selectedChildId) ?? childProfiles[0],
    [childProfiles, selectedChildId]
  );

  const [draftPreferences, setDraftPreferences] = useState<ChildThemePreferences>(
    () => getChildThemePreferences(childProfiles[0])
  );

  useEffect(() => {
    if (!selectedChild) return;
    setDraftPreferences(getChildThemePreferences(selectedChild));
    setMessage("");
  }, [selectedChild]);

  function toggleTheme(themeId: ThemeId) {
    setDraftPreferences((current) => {
      const alreadySelected = current.favoriteThemes.includes(themeId);
      const favoriteThemes = alreadySelected
        ? current.favoriteThemes.filter((item) => item !== themeId)
        : [...current.favoriteThemes, themeId].slice(-3);

      return {
        ...current,
        favoriteThemes: favoriteThemes.length ? favoriteThemes : [themeId]
      };
    });
  }

  async function handleSavePreferences() {
    if (!selectedChild || !onSavePreferences) return;

    setSaving(true);
    setMessage("");

    try {
      await onSavePreferences(selectedChild.id, draftPreferences);
      setMessage("Preferences saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  async function openChild(destination: "activities" | "progress") {
    if (!selectedChild) return;

    try {
      await onOpenChild?.(selectedChild.id, destination);
      router.push(
        destination === "activities"
          ? `/child/activities?childId=${selectedChild.id}`
          : `/parent?childId=${selectedChild.id}`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open child session.");
    }
  }

  if (!childProfiles.length) {
    return (
      <Panel>
        <h2 className="font-display text-2xl font-semibold">No child profiles yet</h2>
        <p className="mt-2 text-sm text-slate-700">
          Create the first child profile to begin personalized learning.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {childProfiles.map((child) => {
          const active = child.id === selectedChild?.id;
          const favoriteTheme = getThemePack(
            getChildThemePreferences(child).favoriteThemes[0]
          );
          const childAge = getChildAge(child);

          return (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelectedChildId(child.id)}
              className={`text-left ${active ? "scale-[1.01]" : ""}`}
            >
              <Panel
                className={`h-full overflow-hidden border-2 p-0 ${
                  active ? "border-orange-300" : "border-transparent"
                }`}
              >
                <div className={`bg-gradient-to-br ${favoriteTheme.gradient} p-5`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/70 font-display text-2xl font-bold">
                      {child.displayName[0]}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-semibold">
                        {child.displayName}
                      </h2>
                      <p className="text-sm text-slate-700">Age {childAge}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-slate-700">
                    {child.progressSummary ??
                      `${child.displayName} is ready for a personalized logic-learning path.`}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getChildThemePreferences(child).favoriteThemes.slice(0, 2).map((themeId) => (
                      <span
                        key={themeId}
                        className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600"
                      >
                        {getThemePack(themeId).name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {child.schoolStandard ?? "Learning at home"}
                  </p>
                </div>
              </Panel>
            </button>
          );
        })}
      </div>

      {selectedChild ? (
        <Panel className="overflow-hidden p-0">
          <div
            className={`bg-gradient-to-br ${
              getThemePack(draftPreferences.favoriteThemes[0] ?? "animals").gradient
            } p-6`}
          >
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">
              Personalized child setup
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              {selectedChild.displayName}&apos;s learning profile
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              Favorite themes and reward style are saved to the child profile and
              used to personalize visuals across activities and progress views.
            </p>
          </div>
          <div className="grid gap-6 p-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold">
                  Favorite themes
                </h3>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Choose up to 3
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {themePacks.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => toggleTheme(theme.id)}
                    className="text-left"
                  >
                    <ThemeChip
                      theme={theme}
                      active={draftPreferences.favoriteThemes.includes(theme.id)}
                    />
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-2xl font-semibold">Reward look</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {rewardStyles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        setDraftPreferences((current) => ({
                          ...current,
                          preferredRewardStyle: style
                        }))
                      }
                      className={`rounded-full px-4 py-3 text-sm font-bold capitalize ${
                        draftPreferences.preferredRewardStyle === style
                          ? "bg-ink text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-2xl font-semibold">Avatar mood</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {avatarStyles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        setDraftPreferences((current) => ({
                          ...current,
                          preferredAvatarStyle: style
                        }))
                      }
                      className={`rounded-full px-4 py-3 text-sm font-bold capitalize ${
                        draftPreferences.preferredAvatarStyle === style
                          ? "bg-ink text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-display text-2xl font-semibold">Favorite color</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {colorChoices.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setDraftPreferences((current) => ({
                        ...current,
                        favoriteColor: color
                      }))
                    }
                    className={`h-12 w-12 rounded-full border-4 ${
                      draftPreferences.favoriteColor === color
                        ? "border-slate-900"
                        : "border-white"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Choose color ${color}`}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                Preview
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">
                {selectedChild.displayName}&apos;s next adventure will highlight{" "}
                {draftPreferences.favoriteThemes
                  .map((themeId) => getThemePack(themeId).name)
                  .join(", ")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Activity cards will prioritize matching theme packs and use{" "}
                {draftPreferences.preferredRewardStyle} celebration visuals.
              </p>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              {onSavePreferences ? (
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-bold text-white shadow-playful disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save visual preferences"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => openChild("activities")}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8b5f] to-[#ff6e70] px-5 py-3 text-sm font-bold text-white shadow-playful"
              >
                Start activities
              </button>
              <button
                type="button"
                onClick={() => openChild("progress")}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-ink ring-1 ring-slate-200"
              >
                View progress
              </button>
              <LinkButton href="/auth/login" variant="ghost">
                Switch parent
              </LinkButton>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
