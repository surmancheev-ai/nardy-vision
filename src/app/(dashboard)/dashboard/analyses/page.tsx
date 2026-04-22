import { auth } from "@/auth";
import { AnalysisHistoryList } from "@/components/dashboard/analysis-history-list";
import { DashboardSectionHeading } from "@/components/dashboard/section-heading";
import { getDashboardSnapshot } from "@/server/use-cases/dashboard/get-dashboard-snapshot";

export default async function AnalysesPage() {
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

  const positionAnalyses = snapshot.recentAnalyses.filter(
    (item) => item.analysisMode === "POSITION_IMAGE",
  );
  const matchAnalyses = snapshot.recentAnalyses.filter(
    (item) => item.analysisMode === "MATCH_PROTOCOL",
  );

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="История"
          title="Разборы разделены по типу сценария"
          description="Позиции по снимкам и тяжелые матчевые расчеты живут в одной истории, но не смешиваются между собой."
        />
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Позиции"
          title="Быстрые разборы по изображению доски"
          description="Этот поток нужен для оперативной проверки одной позиции: распознать доску, понять идею хода и сохранить результат в истории."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={positionAnalyses} />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Матчи"
          title="LogasAI-протоколы и платный расчет матча"
          description="Здесь собираются MAT, 7Z и LMA-файлы, очередь desktop-worker-а и детальные отчеты по фазам и ходам."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={matchAnalyses} />
        </div>
      </section>
    </main>
  );
}
