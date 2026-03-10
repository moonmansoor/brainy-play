import { ParentDashboardClient } from "@/components/activity/parent-dashboard-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function ParentPage({
  searchParams
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      heading="Parent dashboard"
      subheading="Track activity history, stars, time spent, and recommended next activities by learner."
    >
      <ParentDashboardClient childId={params.childId} />
    </AppShell>
  );
}
