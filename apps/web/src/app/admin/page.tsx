import { AdminActivityManager } from "@/components/activity/admin-activity-manager";
import { AppShell } from "@/components/layout/app-shell";

export default function AdminPage() {
  return (
    <AppShell
      heading="Admin content studio"
      subheading="Create, edit, preview, and publish activities using the shared config model. Supabase persistence is ready when environment variables are configured."
    >
      <AdminActivityManager />
    </AppShell>
  );
}
