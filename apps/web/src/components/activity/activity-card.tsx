import Image from "next/image";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import {
  formatDifficulty,
  getActivityTypeLabel,
  getActivityVisualTheme,
  getChildAge,
  getThemePack,
  isAgeMatch
} from "@/lib/utils/activity";
import { ActivityDefinition, ChildProfile } from "@/types/activity";

export function ActivityCard({
  activity,
  child
}: {
  activity: ActivityDefinition;
  child: ChildProfile;
}) {
  const readyForAge = isAgeMatch(activity, getChildAge(child));
  const visualTheme = getActivityVisualTheme(activity, child);
  const themePack = getThemePack(visualTheme.themeId);

  return (
    <Link href={`/child/activities/${activity.slug}?childId=${child.id}`}>
      <Panel className="group h-full overflow-hidden p-0 transition hover:-translate-y-1">
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
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-white/70">
              {formatDifficulty(activity.difficulty)}
            </span>
          </div>
          <p className="relative mt-3 max-w-[70%] text-sm leading-6 text-slate-700">
            {visualTheme.cardBlurb}
          </p>
          <div className="relative mt-4 h-32 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/50">
            <Image
              src={visualTheme.imageUrl}
              alt={visualTheme.cardTitle}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
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
        </div>
      </Panel>
    </Link>
  );
}
