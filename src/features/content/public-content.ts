type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  highlights: string[];
  featured?: boolean;
};

type OneTimeOffer = {
  title: string;
  price: string;
  description: string;
};

export const siteNavigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Learn", href: "/learn" },
] as const;

export const heroStats = [
  {
    value: "3 layers",
    label: "recognition, position understanding, and actionable recommendations",
  },
  {
    value: "2 billing models",
    label: "subscriptions plus one-time purchases for flexible access",
  },
  {
    value: "1 product core",
    label: "analysis-first SaaS built around the engine, not around content",
  },
] as const;

export const enginePillars = [
  {
    title: "Computer vision for board capture",
    description:
      "The platform is already structured to accept a board image, extract the position, and normalize the result for the analysis engine.",
  },
  {
    title: "Structured analysis service",
    description:
      "The UI does not know how the engine calculates. It only receives a typed result through a service layer that can switch from mock to production backend cleanly.",
  },
  {
    title: "SaaS-ready billing model",
    description:
      "One domain already supports subscriptions, position packs, paid match analysis, and standalone premium materials without mixing those access models together.",
  },
] as const;

export const analysisFlow = [
  {
    step: "01",
    title: "Upload",
    description:
      "The user uploads a board image or a match protocol. The file is stored separately from the analysis entity so the engine can be replaced later without data loss.",
  },
  {
    step: "02",
    title: "Recognize",
    description:
      "The analysis service normalizes the request, prepares the payload, and sends it to the current engine adapter, whether mock or production.",
  },
  {
    step: "03",
    title: "Explain",
    description:
      "The result comes back as a structured position, metrics, and recommendations, then lands in the user history for future review and learning.",
  },
] as const;

export const trustSignals = [
  "Dashboard with saved analysis history",
  "Storage and billing abstractions ready for production services",
  "Clear upgrade path from MVP shell to real engine backend",
  "Content and analytics separated at the domain level",
] as const;

export const productPrinciples = [
  {
    title: "Not a content portal",
    description:
      "Learning materials strengthen the product, but they are not the core asset. The real value is the analytical engine and the workflow around it.",
  },
  {
    title: "Modular monolith to start",
    description:
      "This lets the MVP move quickly without collapsing into chaos. When the analytical backend grows, it can be extracted without rewriting the platform shell.",
  },
  {
    title: "Entitlement-driven access",
    description:
      "Access is modeled through rights and purchases, not only through a plan name. That matters when subscriptions, one-time packs, and premium materials coexist.",
  },
] as const;

export const architectureSlices = [
  {
    name: "Presentation",
    detail:
      "Marketing pages, dashboard screens, and analysis views stay focused on interface and interaction rather than business rules.",
  },
  {
    name: "Application",
    detail:
      "Use-cases orchestrate uploads, limits, billing decisions, and calls to the analysis service.",
  },
  {
    name: "Domain",
    detail:
      "User, Subscription, Purchase, Analysis, UploadedImage, and Content capture the commercial model of the platform.",
  },
  {
    name: "Infrastructure",
    detail:
      "Prisma, Auth.js, Stripe, storage providers, and future engine adapters live here behind stable abstractions.",
  },
] as const;

export const pricingPlans = [
  {
    name: "Free",
    price: "0",
    cadence: "/ month",
    description:
      "A lightweight entry point for players who want to test the workflow before committing to a deeper training rhythm.",
    highlights: [
      "Up to 5 analyses per month",
      "Recent position history",
      "Basic learning library",
    ],
  },
  {
    name: "Pro",
    price: "29",
    cadence: "/ month",
    description:
      "Balanced for regular practice, repeat review, and players who build real study habits around their own positions.",
    highlights: [
      "Up to 60 analyses per month",
      "Expanded metrics and history",
      "Premium learning access",
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: "79",
    cadence: "/ month",
    description:
      "For advanced players who want full access to analytics, the content catalog, and future higher-depth engine reports.",
    highlights: [
      "Practically unlimited analytical work",
      "Full learning catalog",
      "Priority for future advanced reports",
    ],
  },
] as const satisfies readonly PricingPlan[];

export const oneTimeOffers = [
  {
    title: "Position pack for 10 analyses",
    price: "$9",
    description:
      "A one-time purchase for players without an active subscription or as an overflow pack above the monthly limit.",
  },
  {
    title: "Position pack for 50 analyses",
    price: "$35",
    description:
      "Best for tournament review, training blocks, or concentrated sessions with many positions.",
  },
  {
    title: "Single premium study dossier",
    price: "from $7",
    description:
      "Standalone learning materials that can be sold separately and unlocked permanently through a one-time purchase.",
  },
] as const satisfies readonly OneTimeOffer[];

export const learningTracks = [
  {
    title: "Opening discipline",
    format: "guide",
    access: "Free",
    description:
      "A starter library about early-board structure, common setup mistakes, and how to see a position before it becomes tactical.",
  },
  {
    title: "Prime and blockade structures",
    format: "lesson series",
    access: "Pro",
    description:
      "A focused set of materials on controlling timing, maintaining shape, and using structure to create pressure.",
  },
  {
    title: "Race conversion clinic",
    format: "premium workshop",
    access: "Premium",
    description:
      "A deeper look at converting positional edges into races without losing the quality of the decision tree.",
  },
  {
    title: "Single paid dossier",
    format: "one-time access",
    access: "Purchase",
    description:
      "Standalone special issues and paid guides that can be unlocked independently from the main subscription.",
  },
] as const;

export const methodologyPoints = [
  "Show the player the position and the recommended move first, then explain why the engine favors it.",
  "Connect theory to the user’s own uploaded positions so training stays grounded in real practice.",
  "Store results in the dashboard so learning compounds instead of disappearing after a single session.",
] as const;
