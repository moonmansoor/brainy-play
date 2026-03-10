import { AppShell } from "@/components/layout/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const pillars = [
  {
    title: "Visual-first activities",
    body: "Large cards, minimal text, and quick reward loops for ages 4 to 12."
  },
  {
    title: "Config-driven engine",
    body: "Shape match, counting, and pattern games use one typed activity model."
  },
  {
    title: "Parent accounts and storage",
    body: "Email/password auth, child profiles, and persistent learner selection are ready for future progress tracking."
  }
];

export default function HomePage() {
  return (
    <AppShell
      heading="Playful logic learning for young beginners."
      subheading="This MVP now includes parent authentication, persistent child profile storage, a reusable activity engine, backend-ready attempts, and a themed learning experience."
      actions={
        <>
          <LinkButton href="/auth/register">Create parent account</LinkButton>
          <LinkButton href="/auth/login" variant="secondary">
            Parent login
          </LinkButton>
          <LinkButton href="/child" variant="ghost">
            Child profiles
          </LinkButton>
          <LinkButton href="/admin" variant="secondary">
            Open admin
          </LinkButton>
        </>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Panel key={pillar.title} className="bg-white/70">
            <h2 className="font-display text-2xl font-semibold">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{pillar.body}</p>
          </Panel>
        ))}
      </section>
    </AppShell>
  );
}
