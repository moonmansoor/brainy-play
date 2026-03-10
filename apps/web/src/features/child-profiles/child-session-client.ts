import { getCurrentParentSession } from "@/features/auth/auth-client";
import { getChildProfile } from "@/features/child-profiles/child-profiles-client";
import { loadActiveChildId } from "@/lib/utils/storage";

export async function resolveActiveChild(childId?: string | null) {
  const sessionState = await getCurrentParentSession();
  if (!sessionState.user) {
    return { user: null, child: null };
  }

  const resolvedChildId = childId ?? loadActiveChildId();
  if (!resolvedChildId) {
    return { user: sessionState.user, child: null };
  }

  const child = await getChildProfile(resolvedChildId);
  return { user: sessionState.user, child };
}
