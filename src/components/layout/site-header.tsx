"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { siteNavigation } from "@/features/content/public-content";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="page-shell">
        <div className="glass-panel rounded-[30px] px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                NV
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                  Nardy Vision
                </p>
                <p className="text-xs text-muted">
                  Анализ позиций в длинных нардах
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {siteNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                Войти
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                Начать анализ
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/analyze"
                className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background sm:inline-flex"
                onClick={closeMenu}
              >
                Анализ
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/75 text-foreground"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="mt-4 border-t border-line pt-4 lg:hidden">
              <nav className="flex flex-col gap-2">
                {siteNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-2xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-white/60"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-4 py-3 text-sm font-medium text-foreground"
                >
                  Войти
                </Link>
                <Link
                  href="/analyze"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
                >
                  Начать анализ
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
