import { ParentDashboardClient } from "@/components/activity/parent-dashboard-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      heading="Learning dashboard"
      subheading="See the child’s current level, strengths, practice focus, and the skills that need more practice."
    >
      <ParentDashboardClient childId={params.childId} />
    </AppShell>
  );
}
