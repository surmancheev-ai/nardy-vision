import Link from "next/link";
import { siteNavigation } from "@/features/content/public-content";

const footerGroups = [
  {
    title: "Продукт",
    links: [
      { label: "Анализ позиций", href: "/analyze" },
      { label: "Тарифы", href: "/pricing" },
      { label: "База знаний", href: "/learn" },
    ],
  },
  {
    title: "Аккаунт",
    links: [
      { label: "О платформе", href: "/about" },
      { label: "Войти", href: "/login" },
      { label: "Регистрация", href: "/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 px-4 pb-8 pt-16">
      <div className="page-shell">
        <div className="glass-panel rounded-[32px] px-6 py-10 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  NV
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Nardy Vision
                </p>
              </div>
              <p className="max-w-md text-sm leading-7 text-muted">
                Платформа для игроков, которым нужен не просто контент, а понятный
                разбор позиции, рекомендации по лучшему плану и история собственных
                решений.
              </p>
            </div>

            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <p className="text-sm font-semibold text-foreground">
                  {group.title}
                </p>
                <div className="space-y-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {siteNavigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <p>
              Подписка, разовые пакеты и платный анализ матчей в одной платформе.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
