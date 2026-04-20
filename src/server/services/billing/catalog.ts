import type {
  BillingOneTimeOffer,
  BillingPlanOffer,
  OneTimeOffer,
  PlanEntitlement,
} from "@/types/billing";

export const planCatalog: PlanEntitlement[] = [
  {
    tier: "FREE",
    monthlyAnalyses: 5,
    premiumContent: false,
    advancedMetrics: false,
  },
  {
    tier: "PRO",
    monthlyAnalyses: 60,
    premiumContent: true,
    advancedMetrics: true,
  },
  {
    tier: "PREMIUM",
    monthlyAnalyses: null,
    premiumContent: true,
    advancedMetrics: true,
  },
];

export const oneTimeOffers: OneTimeOffer[] = [
  {
    code: "position-pack-10",
    mode: "POSITION_PACK",
    credits: 10,
  },
  {
    code: "position-pack-50",
    mode: "POSITION_PACK",
    credits: 50,
  },
  {
    code: "content-race-conversion-dossier",
    mode: "CONTENT_ACCESS",
  },
  {
    code: "match-analysis-credit",
    mode: "MATCH_ANALYSIS",
    credits: 1,
  },
];

export const billingPlanOffers: BillingPlanOffer[] = [
  {
    code: "plan-free",
    tier: "FREE",
    name: "Free",
    priceLabel: "$0",
    cadenceLabel: "/ month",
    description:
      "For first contact with the product: a limited number of analyses and access to the basic learning library.",
    highlights: [
      "Up to 5 analyses per month",
      "Recent analysis history",
      "Basic learning materials",
    ],
  },
  {
    code: "plan-pro-monthly",
    tier: "PRO",
    name: "Pro",
    priceLabel: "$29",
    cadenceLabel: "/ month",
    description:
      "The balanced plan for regular practice, deeper review, and ongoing work with your own positions.",
    highlights: [
      "Up to 60 analyses per month",
      "Expanded metrics and history",
      "Access to premium learning library",
    ],
    featured: true,
  },
  {
    code: "plan-premium-monthly",
    tier: "PREMIUM",
    name: "Premium",
    priceLabel: "$79",
    cadenceLabel: "/ month",
    description:
      "For players who want full access to analytics, premium materials, and future advanced engine reports.",
    highlights: [
      "Practically unlimited analytical work",
      "Full learning catalog access",
      "Priority for future advanced reports",
    ],
  },
];

export const billingOneTimeOffers: BillingOneTimeOffer[] = [
  {
    code: "position-pack-10",
    title: "Position pack for 10 analyses",
    priceLabel: "$9",
    description:
      "One-time credits for players without an active subscription or as an overflow pack above the monthly plan limit.",
  },
  {
    code: "position-pack-50",
    title: "Position pack for 50 analyses",
    priceLabel: "$35",
    description:
      "Useful for tournaments, training blocks, or longer review sessions with many positions.",
  },
  {
    code: "match-analysis-credit",
    title: "Paid match analysis credit",
    priceLabel: "$15",
    description:
      "A separate compute-heavy purchase for MAT or LMA protocol analysis.",
  },
  {
    code: "content-race-conversion-dossier",
    title: "Single premium study dossier",
    priceLabel: "from $7",
    description:
      "Permanent access to a standalone premium training material without requiring an active subscription.",
  },
];
