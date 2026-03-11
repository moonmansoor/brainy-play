"use client";

import { fetchParentProfile, getCurrentParentSession } from "@/features/auth/auth-client";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";

export type AppViewerType = "guest" | "student" | "premium-student" | "admin";

export async function resolveViewerType(): Promise<AppViewerType> {
  const sessionState = await getCurrentParentSession();

  if (!sessionState.user) {
    return "guest";
  }

  const profile = await fetchParentProfile(sessionState.user.id);
  if (profile?.role === "admin") {
    return "admin";
  }

  const activeChildState = await resolveActiveChild();

  if (activeChildState.child) {
    return "student";
  }

  return "guest";
}
