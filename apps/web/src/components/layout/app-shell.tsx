"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MascotBrain } from "@/components/brand/mascot-brain";

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
  const pathname = usePathname();
  const navItems = [
    { href: "/child", label: "Child" },
    { href: "/parent", label: "Parent" },
    { href: "/admin", label: "Admin" }
  ];

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <BrandLogo size="sm" linked priority />
        <nav className="flex items-center gap-1 rounded-full bg-white/70 p-1 text-sm font-semibold shadow-playful backdrop-blur sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                className={`rounded-full px-4 py-2 transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm ring-2 ring-orange-200"
                    : "text-slate-700 hover:bg-white"
                }`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12 sm:px-6 lg:px-8">
        {(heading || subheading || actions) && (
          <section className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/60 bg-confetti p-6 shadow-playful backdrop-blur lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <BrandLogo size="lg" className="mb-4" priority />
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
            <div className="grid gap-4 justify-items-start lg:justify-items-end">
              <MascotBrain
                state="teaching"
                animation="float"
                size="lg"
                message="Brainy is here to guide every playful learning step."
                className="items-start"
                reverse
              />
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </section>
        )}
        {children}
      </main>
    </div>
  );
}
