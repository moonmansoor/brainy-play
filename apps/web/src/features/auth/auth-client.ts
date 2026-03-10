import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  clearActiveChildId,
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

function validateRegistrationPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
}

async function hashLocalPassword(password: string, salt: string) {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0")
  ).join("");
}

async function buildLocalPasswordRecord(password: string) {
  const passwordSalt = crypto.randomUUID();
  const passwordHash = await hashLocalPassword(password, passwordSalt);

  return {
    passwordHash,
    passwordSalt
  };
}

async function verifyLocalPassword(
  account: NonNullable<ReturnType<typeof findLocalParentAccountByEmail>>,
  password: string
) {
  if (account.passwordHash && account.passwordSalt) {
    return (
      (await hashLocalPassword(password, account.passwordSalt)) === account.passwordHash
    );
  }

  return account.password === password;
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
    if (!account || !(await verifyLocalPassword(account, payload.password))) {
      throw new Error("Invalid email or password.");
    }

    if (account.password && !account.passwordHash) {
      const passwordRecord = await buildLocalPasswordRecord(payload.password);
      saveLocalParentAccount({
        ...account,
        ...passwordRecord
      });
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
  validateRegistrationPassword(payload.password);

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

    const passwordRecord = await buildLocalPasswordRecord(payload.password);

    saveLocalParentAccount({
      ...parentProfile,
      ...passwordRecord
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
    clearActiveChildId();
    return;
  }

  await supabase.auth.signOut();
  clearActiveChildId();
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
