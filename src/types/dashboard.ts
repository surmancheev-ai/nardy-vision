import type { AnalysisMode, AnalysisStatus } from "@/types/analysis";
import type { PlanTier } from "@/types/billing";

export type DashboardAnalysisItem = {
  id: string;
  title: string;
  analysisMode: AnalysisMode;
  status: AnalysisStatus;
  createdAt: string;
  summary: string;
  creditCost: number;
  sourceLabel: string;
};

export type DashboardCreditSummary = {
  monthlyIncluded: number | null;
  monthlyUsed: number;
  oneTimeCredits: number;
  computeCredits: number;
};

export type DashboardPurchaseItem = {
  id: string;
  label: string;
  kind: "POSITION_PACK" | "CONTENT_ACCESS" | "MATCH_ANALYSIS";
  createdAt: string;
  status: "PAID" | "AVAILABLE";
  valueLabel: string;
};

export type DashboardSnapshot = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: "USER" | "ADMIN";
  };
  subscription: {
    tier: PlanTier;
    status:
      | "ACTIVE"
      | "TRIALING"
      | "PAST_DUE"
      | "CANCELED"
      | "INCOMPLETE"
      | "EXPIRED";
    renewalLabel: string;
  };
  credits: DashboardCreditSummary;
  entitlements: {
    premiumContent: boolean;
    advancedMetrics: boolean;
    matchProtocolAccess: boolean;
  };
  recentAnalyses: DashboardAnalysisItem[];
  purchases: DashboardPurchaseItem[];
  notes: string[];
};
