import { ParentAuthForm } from "@/components/auth/parent-auth-form";
import { AppShell } from "@/components/layout/app-shell";

export default function ParentLoginPage() {
  return (
    <AppShell
      heading="Parent login"
      subheading="Sign in with email and password to manage child profiles and enter the learning app."
    >
      <ParentAuthForm mode="login" />
    </AppShell>
  );
}
