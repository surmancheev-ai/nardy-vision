import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerLabel: string;
  footerHref: string;
  footerLinkText: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerLabel,
  footerHref,
  footerLinkText,
}: AuthShellProps) {
  return (
    <main className="page-shell flex flex-1 items-center py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <section className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-none text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">
            {description}
          </p>

          <div className="mt-10 grid gap-3">
            {[
              "Сессии и доступ к личному кабинету",
              "Free-подписка создается автоматически при регистрации",
              "Основа для будущего Stripe entitlement sync",
            ].map((point) => (
              <div
                key={point}
                className="rounded-full border border-line bg-white/70 px-4 py-3 text-sm text-foreground"
              >
                {point}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          {children}
          <p className="mt-6 text-sm text-muted">
            {footerLabel}{" "}
            <Link
              href={footerHref}
              className="font-medium text-foreground underline decoration-line underline-offset-4"
            >
              {footerLinkText}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
