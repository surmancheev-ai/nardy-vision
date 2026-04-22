import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { MatchReportView } from "@/components/analysis/match-report-view";
import { AnalysisResultCard } from "@/components/analysis/analysis-result-card";
import { getUserAnalysis } from "@/server/use-cases/analysis/get-user-analysis";

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;
  const analysis = await getUserAnalysis(session.user.id, id);

  if (!analysis) {
    notFound();
  }

  return (
    <main className="space-y-6">
      {analysis.analysisMode === "MATCH_PROTOCOL" ? (
        <MatchReportView analysis={analysis} />
      ) : (
        <AnalysisResultCard result={analysis} />
      )}
    </main>
  );
}
