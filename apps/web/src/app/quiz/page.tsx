import { AppShell } from "@/components/layout/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const quizIdeas = [
  {
    title: "Quick brain warm-ups",
    body: "Short challenge rounds for pattern spotting, sequencing, and logic thinking."
  },
  {
    title: "Skill checks",
    body: "Fast checkpoints that help Brainy Play decide what the child should practice next."
  },
  {
    title: "Child-friendly only",
    body: "This mode stays playful and visual. It will not replace the main hands-on activity flow."
  }
];

export default function QuizPage() {
  return (
    <AppShell
      heading="Quiz mode"
      subheading="A lighter challenge mode is being prepared. For now, keep building skills through the main learning activities."
      actions={
        <LinkButton href="/child/activities">Open learning activities</LinkButton>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {quizIdeas.map((item) => (
          <Panel key={item.title}>
            <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.body}</p>
          </Panel>
        ))}
      </section>
    </AppShell>
  );
}
