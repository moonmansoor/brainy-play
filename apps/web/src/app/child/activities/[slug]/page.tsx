import { ActivityPlayerClient } from "@/components/activity/activity-player-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function ActivityPlayPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ childId?: string }>;
}) {
  const routeParams = await params;
  const query = await searchParams;

  return (
    <AppShell
      heading="Play activity"
      subheading="The activity engine stays config-driven so new game types can be added without rebuilding the child app shell."
    >
      <ActivityPlayerClient slug={routeParams.slug} childId={query.childId} />
    </AppShell>
  );
}
