import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteNavigation } from "@/features/content/public-content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="page-shell">
        <div className="glass-panel flex items-center justify-between rounded-full px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              NV
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                Nardy Vision
              </p>
              <p className="text-xs text-muted">
                Analysis-first platform for long nardy
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

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Start analysis
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
