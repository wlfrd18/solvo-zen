"use client";

import { Calendar, LogOut, SlidersHorizontal, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { logout, useIsAuthenticated } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Wallet },
  { href: "/setup", label: "Configuration", icon: SlidersHorizontal },
  { href: "/projection", label: "Projection", icon: Calendar },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useIsAuthenticated();

  useEffect(() => {
    if (!authenticated) {
      router.replace("/login");
    }
  }, [authenticated, router]);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="hidden border-r border-border bg-surface md:flex md:w-60 md:flex-col md:justify-between md:py-6">
        <div>
          <div className="flex items-center gap-2 px-6 pb-6">
            <Wallet className="h-6 w-6 text-brand" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">Solvo</span>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand/10 text-brand-strong"
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-3">
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-danger"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Deconnexion
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand" aria-hidden="true" />
            <span className="text-base font-semibold tracking-tight">Solvo</span>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            aria-label="Deconnexion"
            className="rounded-lg p-2 text-muted hover:bg-background hover:text-danger"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface md:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  active ? "text-brand-strong" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
