import Link from "next/link";
import { ReactNode } from "react";

export function AppShell({
  children,
  heading,
  subheading,
  actions
}: {
  children: ReactNode;
  heading?: string;
  subheading?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
          <span className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[#ffd978] via-[#ff9f6d] to-[#ff7f8d] text-xl shadow-playful">
            ✦
          </span>
          <span>Code for Beginner</span>
        </Link>
        <nav className="flex items-center gap-2 rounded-full bg-white/70 p-1 text-sm font-semibold shadow-playful backdrop-blur">
          <Link className="rounded-full px-4 py-2 hover:bg-white" href="/child">
            Child
          </Link>
          <Link className="rounded-full px-4 py-2 hover:bg-white" href="/parent">
            Parent
          </Link>
          <Link className="rounded-full px-4 py-2 hover:bg-white" href="/admin">
            Admin
          </Link>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12 sm:px-6 lg:px-8">
        {(heading || subheading || actions) && (
          <section className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/60 bg-confetti p-6 shadow-playful backdrop-blur lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              {heading ? (
                <h1 className="font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                  {heading}
                </h1>
              ) : null}
              {subheading ? (
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                  {subheading}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </section>
        )}
        {children}
      </main>
    </div>
  );
}
