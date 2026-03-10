import { AdminActivityManager } from "@/components/activity/admin-activity-manager";
import { Panel } from "@/components/ui/panel";
import { LinkButton } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { getServerAuthContext } from "@/features/auth/server-auth";

export default async function AdminPage() {
  const auth = await getServerAuthContext();

  if (!auth.supabase) {
    return (
      <AppShell
        heading="Admin content studio"
        subheading="Create, edit, preview, and publish activities using the shared config model. Supabase persistence is ready when environment variables are configured."
      >
        <Panel className="grid gap-4">
          <h2 className="font-display text-3xl font-semibold">
            Admin access requires Supabase auth
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            The admin studio is disabled in local demo mode so activity publishing
            cannot happen without authenticated roles and row-level policies.
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (!auth.user) {
    return (
      <AppShell
        heading="Admin content studio"
        subheading="Create, edit, preview, and publish activities using the shared config model. Supabase persistence is ready when environment variables are configured."
      >
        <Panel className="grid gap-4">
          <h2 className="font-display text-3xl font-semibold">
            Sign in as an admin to continue
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Activity publishing now requires a real authenticated admin session.
          </p>
          <div>
            <LinkButton href="/auth/login">Parent login</LinkButton>
          </div>
        </Panel>
      </AppShell>
    );
  }

  if (auth.profile?.role !== "admin") {
    return (
      <AppShell
        heading="Admin content studio"
        subheading="Create, edit, preview, and publish activities using the shared config model. Supabase persistence is ready when environment variables are configured."
      >
        <Panel className="grid gap-4">
          <h2 className="font-display text-3xl font-semibold">Admin access required</h2>
          <p className="text-sm leading-6 text-slate-700">
            This page is restricted to accounts whose profile role is set to
            <code> admin </code>
            in Supabase.
          </p>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell
      heading="Admin content studio"
      subheading="Create, edit, preview, and publish activities using the shared config model. Supabase persistence is ready when environment variables are configured."
    >
      <AdminActivityManager />
    </AppShell>
  );
}
