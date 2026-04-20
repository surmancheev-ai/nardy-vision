export type ContentAccessTier = "FREE" | "PRO" | "PREMIUM";

export type ContentType = "ARTICLE" | "GUIDE" | "LESSON";

export type ContentSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  type: ContentType;
  accessTier: ContentAccessTier;
  isIndividuallySold: boolean;
};
