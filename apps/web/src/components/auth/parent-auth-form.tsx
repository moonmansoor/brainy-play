"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Panel } from "@/components/ui/panel";
import { Button, LinkButton } from "@/components/ui/button";
import {
  getCurrentParentSession,
  registerParent,
  signInParent
} from "@/features/auth/auth-client";

export function ParentAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: ""
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrateSession() {
      const sessionState = await getCurrentParentSession();
      if (!active) return;

      setIsSignedIn(Boolean(sessionState.user));
      setCheckingSession(false);
    }

    void hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "register") {
        await registerParent(formState);
        setMessage("Account created. Redirecting to child profiles...");
      } else {
        await signInParent(formState);
        setMessage("Signed in. Redirecting to child profiles...");
      }

      router.push("/child");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <Panel className="mx-auto w-full max-w-xl">
        <div className="grid gap-4">
          <div className="flex justify-center">
            <BrandLogo size="md" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Parent account
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Checking your session
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              One moment while Brainy Play loads your account.
            </p>
          </div>
        </div>
      </Panel>
    );
  }

  if (isSignedIn) {
    return (
      <Panel className="mx-auto w-full max-w-xl">
        <div className="grid gap-4">
          <div className="flex justify-center">
            <BrandLogo size="md" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Parent account
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              You are already signed in
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your account is active, so the {mode === "register" ? "create account" : "login"} form
              is hidden.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href="/child">Go to child profiles</LinkButton>
            <LinkButton href="/dashboard" variant="secondary">
              Open dashboard
            </LinkButton>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="mx-auto w-full max-w-xl">
      <div className="grid gap-4">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Parent account
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            {mode === "register" ? "Create your parent account" : "Sign in to continue"}
          </h2>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Email
          <input
            type="email"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Password
          <input
            type="password"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            value={formState.password}
            onChange={(event) =>
              setFormState((current) => ({ ...current, password: event.target.value }))
            }
          />
        </label>
        {mode === "register" ? (
          <>
            <label className="grid gap-2 text-sm font-semibold">
              Full name
              <input
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                value={formState.fullName}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, fullName: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Phone number
              <input
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                value={formState.phoneNumber}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    phoneNumber: event.target.value
                  }))
                }
              />
            </label>
          </>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </Button>
          <LinkButton
            href={mode === "register" ? "/auth/login" : "/auth/register"}
            variant="secondary"
          >
            {mode === "register" ? "Have an account?" : "Create account"}
          </LinkButton>
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </Panel>
  );
}
