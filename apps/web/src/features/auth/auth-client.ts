import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  findLocalParentAccountByEmail,
  loadCurrentLocalParent,
  saveLocalParentAccount,
  setCurrentLocalParent
} from "@/lib/utils/storage";
import { ParentProfile } from "@/types/activity";

export type ParentAuthPayload = {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
};

function mapLocalParent(profile: ParentProfile) {
  return {
    id: profile.id,
    email: profile.email
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getCurrentParentSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const parent = loadCurrentLocalParent();

    return {
      session: parent ? { user: mapLocalParent(parent) } : null,
      user: parent ? mapLocalParent(parent) : null,
      error: null
    };
  }

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  return {
    session,
    user: session?.user ?? null,
    error: error?.message ?? null
  };
}

export async function signInParent(payload: ParentAuthPayload) {
  const supabase = getSupabaseBrowserClient();
  const email = normalizeEmail(payload.email);

  if (!supabase) {
    const account = findLocalParentAccountByEmail(email);
    if (!account || account.password !== payload.password) {
      throw new Error("Invalid email or password.");
    }

    setCurrentLocalParent(account.id);
    return { user: mapLocalParent(account) };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: payload.password
  });

  if (error) throw error;
  return data;
}

export async function registerParent(payload: ParentAuthPayload) {
  const supabase = getSupabaseBrowserClient();
  const email = normalizeEmail(payload.email);

  if (!supabase) {
    if (findLocalParentAccountByEmail(email)) {
      throw new Error("An account with this email already exists.");
    }

    const now = new Date().toISOString();
    const parentProfile: ParentProfile = {
      id: crypto.randomUUID(),
      role: "parent",
      email,
      fullName: payload.fullName?.trim() || undefined,
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };

    saveLocalParentAccount({
      ...parentProfile,
      password: payload.password
    });
    setCurrentLocalParent(parentProfile.id);

    return { user: mapLocalParent(parentProfile) };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password
  });

  if (error) throw error;
  if (!data.user) throw new Error("Parent account could not be created.");

  const parentProfile: ParentProfile = {
    id: data.user.id,
    role: "parent",
    email,
    fullName: payload.fullName?.trim() || undefined,
    phoneNumber: payload.phoneNumber?.trim() || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: parentProfile.id,
    role: "parent",
    email: parentProfile.email,
    full_name: parentProfile.fullName ?? null,
    phone_number: parentProfile.phoneNumber ?? null
  });

  if (profileError) throw profileError;
  return data;
}

export async function signOutParent() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    setCurrentLocalParent(null);
    return;
  }

  await supabase.auth.signOut();
}

export async function fetchParentProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const parent = loadCurrentLocalParent();
    return parent && parent.id === userId ? parent : null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    role: data.role,
    email: data.email,
    fullName: data.full_name ?? undefined,
    phoneNumber: data.phone_number ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } satisfies ParentProfile;
}
