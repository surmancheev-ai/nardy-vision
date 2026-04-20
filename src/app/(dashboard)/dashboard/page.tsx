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
      ? "Unlimited"
      : String(
          Math.max(
            snapshot.credits.monthlyIncluded - snapshot.credits.monthlyUsed,
            0,
          ),
        );

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Overview"
          title="The cabinet is centered around the analytical product"
          description="The dashboard now separates subscription access, saved analyses, one-time purchases, and compute-heavy match work. This screen is already powered by Prisma-backed data."
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          <SummaryCard
            label="Plan"
            value={snapshot.subscription.tier}
            hint={snapshot.subscription.renewalLabel}
          />
          <SummaryCard
            label="Monthly analyses left"
            value={remainingMonthly}
            hint={`${snapshot.credits.monthlyUsed} already used this cycle`}
          />
          <SummaryCard
            label="One-time position credits"
            value={String(snapshot.credits.oneTimeCredits)}
            hint="Credits from purchased packs remain separate from subscription."
          />
          <SummaryCard
            label="Match compute credits"
            value={String(snapshot.credits.computeCredits)}
            hint="Reserved for paid protocol analysis based on heavy local compute."
          />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Entitlements"
          title="Access is modeled as entitlements, not just as a plan name"
          description="This matters because the product combines subscriptions, one-time position packs, premium materials, and paid match-compute jobs."
        />
        <div className="mt-8">
          <EntitlementsPanel {...snapshot.entitlements} />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Recent activity"
          title="Recent analyses"
          description="History is split by product flow, so image-based board reviews and match-protocol analysis do not get mixed together."
        />
        <div className="mt-8">
          <AnalysisHistoryList items={snapshot.recentAnalyses.slice(0, 2)} />
        </div>
      </section>
    </main>
  );
}
