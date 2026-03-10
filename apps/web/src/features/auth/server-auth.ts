import { ParentProfile } from "@/types/activity";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getServerAuthContext() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      supabase: null,
      user: null,
      profile: null
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null
    };
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data
    ? ({
        id: data.id,
        role: data.role,
        email: data.email,
        fullName: data.full_name ?? undefined,
        phoneNumber: data.phone_number ?? undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } satisfies ParentProfile)
    : null;

  return {
    supabase,
    user,
    profile
  };
}
