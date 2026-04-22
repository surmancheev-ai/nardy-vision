import Link from "next/link";
import { auth } from "@/auth";
import { AnalysisHistoryList } from "@/components/dashboard/analysis-history-list";
import { EntitlementsPanel } from "@/components/dashboard/entitlements-panel";
import { DashboardSectionHeading } from "@/components/dashboard/section-heading";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { getDashboardSnapshot } from "@/server/use-cases/dashboard/get-dashboard-snapshot";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const snapshot = await getDashboardSnapshot({
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      role: session.user.role,
    },
  });

  const remainingMonthly =
    snapshot.credits.monthlyIncluded === null
      ? "Без лимита"
      : String(
          Math.max(
            snapshot.credits.monthlyIncluded - snapshot.credits.monthlyUsed,
            0,
          ),
        );

  const recentMatchAnalyses = snapshot.recentAnalyses.filter(
    (analysis) => analysis.analysisMode === "MATCH_PROTOCOL",
  );

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Обзор"
          title="Кабинет построен вокруг аналитического инструмента"
          description="Здесь собраны подписка, история разборов, разовые покупки и отдельный матчевый поток через LogasAI Game и LogasAI Analysis."
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          <SummaryCard
            label="Тариф"
            value={snapshot.subscription.tier}
            hint={snapshot.subscription.renewalLabel}
          />
          <SummaryCard
            label="Осталось в месяце"
            value={remainingMonthly}
            hint={`${snapshot.credits.monthlyUsed} уже использовано в текущем цикле`}
          />
          <SummaryCard
            label="Разовые кредиты"
            value={String(snapshot.credits.oneTimeCredits)}
            hint="Пакеты разборов позиции сверх подписки."
          />
          <SummaryCard
            label="Match compute"
            value={String(snapshot.credits.computeCredits)}
            hint="Резерв под платный разбор матчевых протоколов."
          />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="LogasAI"
          title="Полный матчевый цикл вынесен в отдельное рабочее пространство"
          description="Сыграйте в LogasAI Game, загрузите протокол на сайт и получите разбор по фазам и ходам в одном месте."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/logasai"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Открыть LogasAI workspace
          </Link>
          <Link
            href="/analyze"
            className="rounded-full border border-line bg-white/75 px-5 py-3 text-sm font-medium text-foreground"
          >
            Загрузить новый протокол
          </Link>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Права доступа"
          title="Подписка и разовые покупки разделены на уровне продукта"
          description="Это важно, потому что библиотека, PDF, пакеты разборов и тяжелые матчевые расчеты живут по разным правилам доступа."
        />
        <div className="mt-8">
          <EntitlementsPanel {...snapshot.entitlements} />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Последние матчи"
          title="Что происходит в очереди LogasAI прямо сейчас"
          description="Матчевые протоколы не смешиваются с быстрыми разборами позиции, поэтому их проще отслеживать как отдельный рабочий поток."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={recentMatchAnalyses.slice(0, 3)} />
        </div>
      </section>
    </main>
  );
}
