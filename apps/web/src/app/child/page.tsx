import { ChildProfileHubClient } from "@/components/activity/child-profile-hub-client";
import { AppShell } from "@/components/layout/app-shell";

export default function ChildPage() {
  return (
    <AppShell
      heading="Choose a child profile"
      subheading="Parents sign in, create child profiles, and select a learner before entering the themed activity interface."
    >
      <ChildProfileHubClient />
    </AppShell>
  );
}
