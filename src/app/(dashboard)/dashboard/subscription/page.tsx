import { Suspense } from "react";
import { auth } from "@/auth";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { BillingStatusBanner } from "@/components/billing/billing-status-banner";
import { DashboardSectionHeading } from "@/components/dashboard/section-heading";
import { PurchaseList } from "@/components/dashboard/purchase-list";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { oneTimeOffers, planCatalog } from "@/server/services/billing/catalog";
import { getDashboardSnapshot } from "@/server/use-cases/dashboard/get-dashboard-snapshot";

export default async function SubscriptionPage() {
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

  const currentPlan = planCatalog.find(
    (plan) => plan.tier === snapshot.subscription.tier,
  );

  return (
    <main className="space-y-6">
      <Suspense fallback={null}>
        <BillingStatusBanner location="subscription" />
      </Suspense>
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Subscription"
          title="Plan, credits, and one-time economics"
          description="Recurring access and one-time purchases live side by side, but they stay separated in the product model."
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          <SummaryCard
            label="Current plan"
            value={snapshot.subscription.tier}
            hint={snapshot.subscription.renewalLabel}
          />
          <SummaryCard
            label="Monthly included"
            value={
              currentPlan?.monthlyAnalyses === null
                ? "Unlimited"
                : String(currentPlan?.monthlyAnalyses ?? 0)
            }
            hint="Recurring entitlement from the active subscription."
          />
          <SummaryCard
            label="Position pack reserve"
            value={String(snapshot.credits.oneTimeCredits)}
            hint="Credits purchased separately from the plan."
          />
        </div>
        {snapshot.subscription.tier !== "FREE" ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <BillingPortalButton />
          </div>
        ) : null}
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="One-time purchases"
          title="One-time purchases as a separate revenue layer"
          description="This is where position packs, premium materials, and future match-compute credits belong."
        />
        <div className="mt-8">
          <PurchaseList items={snapshot.purchases} />
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Catalog direction"
          title="What is already defined in the billing catalog"
          description="The current UI reads from the same billing domain that will later be synchronized with Stripe."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {oneTimeOffers.map((offer) => (
            <article
              key={offer.code}
              className="rounded-[26px] border border-line bg-white/75 p-5"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                {offer.mode}
              </p>
              <p className="mt-3 text-base font-medium text-foreground">
                {offer.code}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {offer.credits
                  ? `Credits included: ${offer.credits}`
                  : "Used for single premium material access."}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
