import Link from "next/link";
import { auth } from "@/auth";
import { AnalysisHistoryList } from "@/components/dashboard/analysis-history-list";
import { DashboardSectionHeading } from "@/components/dashboard/section-heading";
import { getDashboardSnapshot } from "@/server/use-cases/dashboard/get-dashboard-snapshot";

const logasaiSteps = [
  {
    title: "Сыграйте матч в LogasAI Game",
    description:
      "Завершите игровую сессию в desktop-клиенте и сохраните протокол матча в формате MAT или архив MAT.7z.",
  },
  {
    title: "Загрузите протокол на платформу",
    description:
      "На странице анализа выберите режим матча и отправьте MAT, 7Z или уже готовый LMA-файл в очередь расчета.",
  },
  {
    title: "Дождитесь Windows-worker с LogasAI Analysis",
    description:
      "Платформа передаст задание на Windows-машину с установленным LogasAI Analysis и покажет все статусы прямо в кабинете.",
  },
  {
    title: "Разберите матч по фазам и ходам",
    description:
      "Когда расчет завершится, здесь появится пошаговый отчет, ключевые эпизоды и ссылка на скачивание LMA-результата.",
  },
] as const;

export default async function LogasAIPage() {
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

  const matchAnalyses = snapshot.recentAnalyses.filter(
    (item) => item.analysisMode === "MATCH_PROTOCOL",
  );

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="LogasAI Workspace"
          title="Полный цикл вокруг LogasAI Game и LogasAI Analysis"
          description="Здесь собран весь матчевый сценарий: от игры в desktop-клиенте и загрузки протокола до очереди расчета и детального разбора по ходам."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/analyze"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Загрузить новый протокол
          </Link>
          <Link
            href="/dashboard/analyses"
            className="rounded-full border border-line bg-white/75 px-5 py-3 text-sm font-medium text-foreground"
          >
            Открыть все анализы
          </Link>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Workflow"
          title="Как связаны desktop-программы и сайт"
          description="Платформа не прячет цепочку внутри себя: она честно показывает, где начинается игра, где появляется протокол и где именно формируется детальный отчет."
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          {logasaiSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[26px] border border-line bg-white/75 p-5"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                Шаг {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-medium text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Recent match analyses"
          title="Последние загрузки из LogasAI-сценария"
          description="Каждый протокол получает собственную карточку со статусом очереди, ссылкой на детальную страницу и итоговым разбором."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={matchAnalyses} />
        </div>
      </section>
    </main>
  );
}
