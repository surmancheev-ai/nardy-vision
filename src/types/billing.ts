export type PlanTier = "FREE" | "PRO" | "PREMIUM";

export type MonetizationMode =
  | "SUBSCRIPTION"
  | "POSITION_PACK"
  | "CONTENT_ACCESS"
  | "MATCH_ANALYSIS";

export type PlanEntitlement = {
  tier: PlanTier;
  monthlyAnalyses: number | null;
  premiumContent: boolean;
  advancedMetrics: boolean;
};

export type OneTimeOffer = {
  code: string;
  mode: MonetizationMode;
  credits?: number;
  contentSlug?: string;
};

export type BillingPlanOffer = {
  code: string;
  tier: PlanTier;
  name: string;
  priceLabel: string;
  cadenceLabel: string;
  description: string;
  highlights: string[];
  featured?: boolean;
};

export type BillingOneTimeOffer = {
  code: string;
  title: string;
  priceLabel: string;
  description: string;
};
