import Image from "next/image";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { ActivityAccessState } from "@/features/progress/progression-rules";
import {
  formatDifficulty,
  getActivityTypeLabel,
  getActivityVisualTheme,
  getChildAge,
  getThemePack,
  isAgeMatch
} from "@/lib/utils/activity";
import { ActivityDefinition, ChildProfile } from "@/types/activity";

function getStatusLabel(accessState: ActivityAccessState) {
  switch (accessState.status) {
    case "locked-premium":
      return `Premium after level ${accessState.freeLevelLimit}`;
    case "locked-level":
      return `Reach level ${accessState.requiredLevel}`;
    case "playable":
      return "Play now";
  }
}

function getActionLabel(accessState: ActivityAccessState) {
  switch (accessState.status) {
    case "locked-premium":
      return "Subscription required";
    case "locked-level":
      return `Locked until level ${accessState.requiredLevel}`;
    case "playable":
      return "Start activity";
  }
}

export function ActivityCard({
  activity,
  child,
  accessState
}: {
  activity: ActivityDefinition;
  child: ChildProfile;
  accessState: ActivityAccessState;
}) {
  const readyForAge = isAgeMatch(activity, getChildAge(child));
  const visualTheme = getActivityVisualTheme(activity, child);
  const themePack = getThemePack(visualTheme.themeId);
  const content = (
    <Panel
      className={`group h-full overflow-hidden p-0 transition ${
        accessState.isPlayable ? "hover:-translate-y-1" : "opacity-80"
      }`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${themePack.gradient} p-5`}>
        <div className="absolute inset-0 bg-confetti opacity-40" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="max-w-[70%]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700/70">
              {themePack.sticker} {getActivityTypeLabel(activity.type)}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
              {visualTheme.cardTitle}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-white/70">
              {formatDifficulty(activity.difficulty)}
            </span>
            <span className="rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
              Level {activity.requiredLevel}
            </span>
          </div>
        </div>
        <p className="relative mt-3 max-w-[70%] text-sm leading-6 text-slate-700">
          {visualTheme.cardBlurb}
        </p>
        <div className="relative mt-4 h-32 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/50">
          <Image
            src={visualTheme.imageUrl}
            alt={visualTheme.cardTitle}
            fill
            className={`object-cover transition duration-300 ${
              accessState.isPlayable ? "group-hover:scale-[1.03]" : ""
            }`}
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
          {!accessState.isPlayable ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/35">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                {getStatusLabel(accessState)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm leading-6 text-slate-700">{activity.instructionsText}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em]">
          <span
            className="rounded-full px-3 py-2"
            style={{
              backgroundColor: themePack.accentSoft,
              color: themePack.accentStrong
            }}
          >
            {themePack.name} pack
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-2 text-orange-700">
            Age {activity.ageMin}-{activity.ageMax}
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-2 text-sky-700">
            {activity.items.length} rounds
          </span>
          <span
            className={`rounded-full px-3 py-2 ${
              readyForAge
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {readyForAge ? "Ready now" : "Stretch activity"}
          </span>
        </div>
        <div className="mt-5 rounded-[1.4rem] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          {getActionLabel(accessState)}
        </div>
      </div>
    </Panel>
  );

  if (!accessState.isPlayable) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={`/child/activities/${activity.slug}?childId=${child.id}`}>
      {content}
    </Link>
  );
}
