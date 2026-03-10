import { ParentAuthForm } from "@/components/auth/parent-auth-form";
import { AppShell } from "@/components/layout/app-shell";

export default function ParentRegisterPage() {
  return (
    <AppShell
      heading="Create a parent account"
      subheading="A parent account owns child profiles, tracks learning activity, and enables future feedback and support features."
    >
      <ParentAuthForm mode="register" />
    </AppShell>
  );
}
