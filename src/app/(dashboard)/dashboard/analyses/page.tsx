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
          eyebrow="Analysis history"
          title="History organized by analysis type"
          description="This page already separates fast position checks from more expensive match-compute jobs."
        />
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Position image analyses"
          title="Board reviews from uploaded images"
          description="This is the fast product flow for studying a single position on the board."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={positionAnalyses} />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Match protocol analyses"
          title="Paid match protocol analysis"
          description="This flow is designed as a separate compute service: MAT or LMA import, queueing, worker execution, and credit-based billing."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={matchAnalyses} />
        </div>
      </section>
    </main>
  );
}
