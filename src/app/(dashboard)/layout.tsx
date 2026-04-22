import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/features/auth/actions";

const dashboardNavigation = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/dashboard/analyses", label: "Анализы" },
  { href: "/dashboard/logasai", label: "LogasAI" },
  { href: "/dashboard/library", label: "Библиотека" },
  { href: "/dashboard/profile", label: "Профиль" },
  { href: "/dashboard/subscription", label: "Тариф и покупки" },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 pb-12 pt-6">
      <div className="page-shell space-y-6">
        <header className="glass-panel rounded-[30px] px-6 py-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Кабинет
              </p>
              <div>
                <h1 className="font-serif text-4xl text-foreground">
                  {session.user.name ?? "Игрок"}, добро пожаловать
                </h1>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {session.user.email} · роль {session.user.role}
                </p>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
              >
                Выйти
              </button>
            </form>
          </div>

          <nav className="mt-6 flex flex-wrap gap-3">
            {dashboardNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-line bg-white/65 px-4 py-2 text-sm text-foreground transition-colors hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
