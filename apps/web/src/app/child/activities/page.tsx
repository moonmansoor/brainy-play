import { ActivityLibraryClient } from "@/components/activity/activity-library-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function ChildActivitiesPage({
  searchParams
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell
      heading="Activity library"
      subheading="Browse the first three MVP activity types: shape match, count the objects, and pattern completion."
    >
      <ActivityLibraryClient childId={params.childId} />
    </AppShell>
  );
}
