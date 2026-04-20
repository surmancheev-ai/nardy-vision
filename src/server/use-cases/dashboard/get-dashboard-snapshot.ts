import { prisma } from "@/server/db/prisma";
import { listAnalysesByUserId } from "@/server/repositories/analysis-repository";
import { listCreditLedgerByUserId } from "@/server/repositories/credit-ledger-repository";
import { listPurchasesByUserId } from "@/server/repositories/purchase-repository";
import { findSubscriptionByUserId } from "@/server/repositories/subscription-repository";
import { planCatalog } from "@/server/services/billing/catalog";
import type { DashboardPurchaseItem, DashboardSnapshot } from "@/types/dashboard";
import type { PlanTier } from "@/types/billing";

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatDate(date: Date, withTime = false) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function buildRenewalLabel(input: {
  tier: PlanTier;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}) {
  if (input.tier === "FREE") {
    return "Free plan without recurring billing";
  }

  if (input.currentPeriodEnd) {
    const suffix = formatDate(input.currentPeriodEnd);
    if (input.cancelAtPeriodEnd) {
      return `Access until ${suffix}`;
    }

    if (input.status === "TRIALING") {
      return `Trial ends on ${suffix}`;
    }

    return `Renews on ${suffix}`;
  }

  if (input.status === "TRIALING") {
    return "Trial is active";
  }

  return "Recurring access is active";
}

function sumCreditsFromPurchases(
  purchases: Awaited<ReturnType<typeof listPurchasesByUserId>>,
  productType: "POSITION_PACK" | "MATCH_ANALYSIS",
) {
  return purchases
    .filter((purchase) => purchase.status === "PAID")
    .flatMap((purchase) => purchase.items)
    .filter((item) => item.product.productType === productType)
    .reduce(
      (total, item) =>
        total + (item.product.analysisCredits ?? 0) * item.quantity,
      0,
    );
}

function sumCreditsFromLedger(
  ledgerEntries: Awaited<ReturnType<typeof listCreditLedgerByUserId>>,
  kind: "POSITION_PACK" | "MATCH_ANALYSIS",
) {
  return ledgerEntries.reduce((total, entry) => {
    if (entry.purchase?.items.some((item) => item.product.productType === kind)) {
      return total + entry.delta;
    }

    if (kind === "MATCH_ANALYSIS" && entry.analysis?.analysisMode === "MATCH_PROTOCOL") {
      return total + entry.delta;
    }

    if (kind === "POSITION_PACK" && entry.analysis?.analysisMode === "POSITION_IMAGE") {
      return total + entry.delta;
    }

    return total;
  }, 0);
}

function buildPurchaseLabel(
  purchase: Awaited<ReturnType<typeof listPurchasesByUserId>>[number],
) {
  if (purchase.items.length === 1) {
    return purchase.items[0]?.product.name ?? "Purchase";
  }

  const primaryLabel = purchase.items[0]?.product.name ?? "Purchase";
  return `${primaryLabel} +${purchase.items.length - 1} more`;
}

function buildPurchaseValueLabel(
  purchase: Awaited<ReturnType<typeof listPurchasesByUserId>>[number],
) {
  const analysisCredits = purchase.items.reduce(
    (total, item) =>
      total + (item.product.analysisCredits ?? 0) * item.quantity,
    0,
  );

  const hasMatchAnalysis = purchase.items.some(
    (item) => item.product.productType === "MATCH_ANALYSIS",
  );
  const hasContentAccess = purchase.items.some(
    (item) => item.product.productType === "CONTENT_ACCESS",
  );

  if (hasMatchAnalysis) {
    return `${analysisCredits} match analysis credit${analysisCredits === 1 ? "" : "s"}`;
  }

  if (hasContentAccess && analysisCredits === 0) {
    return "Permanent content access";
  }

  return `${analysisCredits} position credit${analysisCredits === 1 ? "" : "s"}`;
}

function resolvePurchaseKind(
  purchase: Awaited<ReturnType<typeof listPurchasesByUserId>>[number],
): DashboardPurchaseItem["kind"] | null {
  if (
    purchase.items.some((item) => item.product.productType === "MATCH_ANALYSIS")
  ) {
    return "MATCH_ANALYSIS";
  }

  if (
    purchase.items.some((item) => item.product.productType === "CONTENT_ACCESS")
  ) {
    return "CONTENT_ACCESS";
  }

  if (
    purchase.items.some((item) => item.product.productType === "POSITION_PACK")
  ) {
    return "POSITION_PACK";
  }

  return null;
}

type GetDashboardSnapshotInput = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: "USER" | "ADMIN";
  };
};

export async function getDashboardSnapshot({
  user,
}: GetDashboardSnapshotInput): Promise<DashboardSnapshot> {
  const [subscription, analyses, purchases, creditLedger] = await Promise.all([
    findSubscriptionByUserId(prisma, user.id),
    listAnalysesByUserId(prisma, user.id, 20),
    listPurchasesByUserId(user.id, prisma),
    listCreditLedgerByUserId(prisma, user.id),
  ]);

  const subscriptionTier = subscription?.planTier ?? "FREE";
  const plan = planCatalog.find((item) => item.tier === subscriptionTier);
  const billingCycleStart = subscription?.currentPeriodStart ?? startOfCurrentMonth();

  const monthlyUsed = analyses.filter(
    (analysis) =>
      analysis.analysisMode === "POSITION_IMAGE" &&
      analysis.createdAt >= billingCycleStart,
  ).length;

  const grossPositionCredits = sumCreditsFromPurchases(purchases, "POSITION_PACK");
  const grossMatchCredits = sumCreditsFromPurchases(purchases, "MATCH_ANALYSIS");
  const positionCreditsFromLedger = sumCreditsFromLedger(
    creditLedger,
    "POSITION_PACK",
  );
  const matchCreditsFromLedger = sumCreditsFromLedger(
    creditLedger,
    "MATCH_ANALYSIS",
  );

  const oneTimeCredits =
    creditLedger.length > 0
      ? Math.max(positionCreditsFromLedger, 0)
      : grossPositionCredits;
  const computeCredits =
    creditLedger.length > 0
      ? Math.max(matchCreditsFromLedger, 0)
      : Math.max(
          grossMatchCredits -
            analyses.filter((analysis) => analysis.analysisMode === "MATCH_PROTOCOL")
              .length,
          0,
        );
  const purchaseItems: DashboardPurchaseItem[] = purchases
    .filter((purchase) => purchase.status === "PAID")
    .flatMap((purchase) => {
      const kind = resolvePurchaseKind(purchase);

      if (!kind) {
        return [];
      }

      return [
        {
          id: purchase.id,
          label: buildPurchaseLabel(purchase),
          kind,
          createdAt: formatDate(purchase.createdAt),
          status: "PAID" as const,
          valueLabel: buildPurchaseValueLabel(purchase),
        },
      ];
    });

  return {
    user,
    subscription: {
      tier: subscriptionTier,
      status:
        subscription?.status === "TRIALING" ? "TRIALING" : "ACTIVE",
      renewalLabel: buildRenewalLabel({
        tier: subscriptionTier,
        status: subscription?.status ?? "ACTIVE",
        currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      }),
    },
    credits: {
      monthlyIncluded: plan?.monthlyAnalyses ?? null,
      monthlyUsed,
      oneTimeCredits,
      computeCredits,
    },
    entitlements: {
      premiumContent: Boolean(plan?.premiumContent),
      advancedMetrics: Boolean(plan?.advancedMetrics),
      matchProtocolAccess: true,
    },
    recentAnalyses: analyses.map((analysis) => ({
      id: analysis.id,
      title:
        analysis.analysisMode === "MATCH_PROTOCOL"
          ? "Imported match protocol analysis"
          : "Board position analysis",
      analysisMode: analysis.analysisMode,
      status: analysis.status,
      createdAt: formatDate(analysis.createdAt, true),
      summary:
        analysis.summary ??
        (analysis.analysisMode === "MATCH_PROTOCOL"
          ? "Compute-heavy protocol analysis was completed."
          : "Position image was processed and stored."),
      creditCost: analysis.creditCost,
      sourceLabel: analysis.uploadedImage.originalName,
    })),
    purchases: purchaseItems,
    notes: [
      "Dashboard metrics are now loaded from Prisma-backed user data.",
      "Subscription entitlements remain separated from one-time credits and paid compute jobs.",
      "Match protocol analysis is tracked as a dedicated paid flow and stays independent from monthly free limits.",
    ],
  };
}
