import { auth } from "@/auth";
import { AnalysisWorkbench } from "@/components/analysis/analysis-workbench";

export default async function AnalyzePage() {
  const session = await auth();

  return (
    <main className="page-shell flex flex-1 flex-col pb-20 pt-10">
      <AnalysisWorkbench userName={session?.user?.name} />
    </main>
  );
}
