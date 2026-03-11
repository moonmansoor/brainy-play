import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { Panel } from "@/components/ui/panel";
import { getActivityInteractionLabel } from "@/features/activities/template-registry";
import {
  formatDifficulty,
  getActivityTypeLabel,
  getActivityVisualTheme,
  getChildAge,
  getThemePack,
  isAgeMatch
} from "@/lib/utils/activity";
import { ActivityDefinition, ChildProfile } from "@/types/activity";

function ActivityMetaPill({
  children,
  className
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${className}`}
    >
      {children}
    </span>
  );
}

export function ActivityCard({
  activity,
  child,
  levelLabel,
  skillLabel,
  statusLabel
}: {
  activity: ActivityDefinition;
  child: ChildProfile;
  levelLabel?: string;
  skillLabel?: string;
  statusLabel?: string;
}) {
  const readyForAge = isAgeMatch(activity, getChildAge(child));
  const visualTheme = getActivityVisualTheme(activity, child);
  const themePack = getThemePack(visualTheme.themeId);
  const focusPills = [
    {
      label: levelLabel ?? `Level ${activity.recommendedLevel}`,
      className: "bg-amber-100 text-amber-800"
    },
    skillLabel
      ? {
          label: skillLabel,
          className: "bg-lime-100 text-lime-800"
        }
      : null,
    {
      label: statusLabel ?? (readyForAge ? "Ready now" : "Stretch activity"),
      className: readyForAge
        ? "bg-emerald-100 text-emerald-800"
        : "bg-slate-100 text-slate-600"
    }
  ].filter(Boolean) as { label: string; className: string }[];
  const detailPills = [
    `Age ${activity.ageMin}-${activity.ageMax}`,
    `${activity.items.length} rounds`,
    getActivityInteractionLabel(activity.interactionType),
    themePack.name
  ];

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
          <div className="mt-5 space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {focusPills.map((pill) => (
                <ActivityMetaPill key={pill.label} className={pill.className}>
                  {pill.label}
                </ActivityMetaPill>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
              {detailPills.map((pill) => (
                <ActivityMetaPill
                  key={pill}
                  className="bg-slate-100/90 text-slate-600"
                >
                  {pill}
                </ActivityMetaPill>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </Link>
  );
}
