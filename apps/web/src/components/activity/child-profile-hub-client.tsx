"use client";

import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChildProfilePicker } from "@/components/activity/child-profile-picker";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  fetchParentProfile,
  getCurrentParentSession,
  signOutParent
} from "@/features/auth/auth-client";
import {
  createChildProfile,
  listChildProfiles,
  markChildLastLogin,
  updateChildProfilePreferences
} from "@/features/child-profiles/child-profiles-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveActiveChildId } from "@/lib/utils/storage";
import { ChildThemePreferences, ParentProfile } from "@/types/activity";

const schoolStandards = [
  "Kindergarten",
  "Standard 1",
  "Standard 2",
  "Standard 3",
  "Standard 4",
  "Standard 5",
  "Standard 6"
];

export function ChildProfileHubClient() {
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState([] as Awaited<ReturnType<typeof listChildProfiles>>);
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState({
    displayName: "",
    birthDate: "",
    schoolName: "",
    schoolStandard: schoolStandards[0]
  });
  const isLocalDemoMode = !getSupabaseBrowserClient();

  async function loadData() {
    setLoading(true);
    setMessage("");

    try {
      const sessionState = await getCurrentParentSession();
      if (!sessionState.user) {
        setParent(null);
        setChildren([]);
        return;
      }

      const [profile, childProfiles] = await Promise.all([
        fetchParentProfile(sessionState.user.id),
        listChildProfiles(sessionState.user.id)
      ]);

      setParent(profile);
      setChildren(childProfiles);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load child profiles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateChildProfile() {
    if (!parent) return;

    if (!formState.displayName || !formState.birthDate) {
      setMessage("Display name and birth date are required.");
      return;
    }

    try {
      const nextChild = await createChildProfile(parent.id, {
        displayName: formState.displayName,
        birthDate: formState.birthDate,
        schoolName: formState.schoolName || undefined,
        schoolStandard: formState.schoolStandard || undefined,
        themePreferences: {
          favoriteThemes: ["animals"],
          preferredRewardStyle: "sparkles",
          preferredAvatarStyle: "dreamer"
        }
      });

      setChildren((current) => [...current, nextChild]);
      setFormState({
        displayName: "",
        birthDate: "",
        schoolName: "",
        schoolStandard: schoolStandards[0]
      });
      setMessage("Child profile created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create child profile.");
    }
  }

  async function handleSavePreferences(
    childId: string,
    preferences: ChildThemePreferences
  ) {
    const updated = await updateChildProfilePreferences(childId, preferences);
    setChildren((current) =>
      current.map((child) => (child.id === childId ? updated : child))
    );
  }

  async function handleOpenChild(
    childId: string,
    destination: "activities" | "progress"
  ) {
    const updated = await markChildLastLogin(childId);
    saveActiveChildId(childId);
    setChildren((current) =>
      current.map((child) => (child.id === childId ? updated : child))
    );
    setMessage(
      destination === "activities"
        ? "Child session started."
        : "Opening parent progress."
    );
  }

  if (loading) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">Loading profiles...</p>
      </Panel>
    );
  }

  if (!parent) {
    return (
      <Panel className="grid gap-4">
        <h2 className="font-display text-3xl font-semibold">
          Sign in as a parent to continue
        </h2>
        <p className="text-sm leading-6 text-slate-700">
          Children enter the learning interface by selecting a profile from the
          parent account.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/auth/login">Parent login</LinkButton>
          <LinkButton href="/auth/register" variant="secondary">
            Parent registration
          </LinkButton>
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-8">
      {isLocalDemoMode ? (
        <Panel className="border border-dashed border-orange-200 bg-orange-50/70">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-700">
            Local demo mode
          </p>
          <p className="mt-2 text-sm leading-6 text-orange-950">
            Parent accounts and child profiles are being stored in this browser only.
            Add Supabase keys later to switch to persistent cloud storage.
          </p>
        </Panel>
      ) : null}

      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Parent account
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            {parent.fullName || parent.email}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Create and manage child profiles, then select a learner before opening
            the activity interface.
          </p>
        </div>
        <BrandLogo size="md" />
        <Button
          variant="secondary"
          onClick={async () => {
            await signOutParent();
            setParent(null);
            setChildren([]);
          }}
        >
          Sign out
        </Button>
      </Panel>

      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Create child profile
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold">
              Add a learner
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Store only the minimum needed to personalize learning and support
              future progress tracking.
            </p>
          </div>
          <div className="grid gap-3">
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              placeholder="Display name"
              value={formState.displayName}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  displayName: event.target.value
                }))
              }
            />
            <input
              type="date"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.birthDate}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  birthDate: event.target.value
                }))
              }
            />
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              placeholder="School name (optional)"
              value={formState.schoolName}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  schoolName: event.target.value
                }))
              }
            />
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={formState.schoolStandard}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  schoolStandard: event.target.value
                }))
              }
            >
              {schoolStandards.map((standard) => (
                <option key={standard} value={standard}>
                  {standard}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleCreateChildProfile}>Create child profile</Button>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </div>
          </div>
        </div>
      </Panel>

      <ChildProfilePicker
        childProfiles={children}
        onSavePreferences={handleSavePreferences}
        onOpenChild={handleOpenChild}
      />
    </div>
  );
}
