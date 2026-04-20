import { prisma } from "@/server/db/prisma";
import {
  LONG_NARDY_TEXTBOOK_ACCESS_TIER,
  LONG_NARDY_TEXTBOOK_PDF_PRODUCT_CODE,
  LONG_NARDY_TEXTBOOK_SLUG,
} from "@/server/content/long-nardy-textbook";
import { findContentAccessGrantByUserAndContentId } from "@/server/repositories/content-access-repository";
import { findPublishedContentBySlug } from "@/server/repositories/content-repository";
import { findSubscriptionByUserId } from "@/server/repositories/subscription-repository";

type AccessRole = "USER" | "ADMIN";

type GetLongNardyTextbookAccessInput = {
  userId: string;
  role: AccessRole;
};

function hasReaderAccessFromSubscription(input: {
  planTier: "FREE" | "PRO" | "PREMIUM";
  status:
    | "ACTIVE"
    | "TRIALING"
    | "PAST_DUE"
    | "CANCELED"
    | "INCOMPLETE"
    | "EXPIRED";
}) {
  if (
    input.status !== "ACTIVE" &&
    input.status !== "TRIALING" &&
    input.status !== "PAST_DUE"
  ) {
    return false;
  }

  if (LONG_NARDY_TEXTBOOK_ACCESS_TIER === "PRO") {
    return input.planTier === "PRO" || input.planTier === "PREMIUM";
  }

  return input.planTier === "PREMIUM";
}

export async function getLongNardyTextbookAccess(
  input: GetLongNardyTextbookAccessInput,
) {
  const [content, subscription] = await Promise.all([
    findPublishedContentBySlug(prisma, LONG_NARDY_TEXTBOOK_SLUG),
    findSubscriptionByUserId(prisma, input.userId),
  ]);

  const hasSubscriptionAccess =
    input.role === "ADMIN"
      ? true
      : subscription
        ? hasReaderAccessFromSubscription({
            planTier: subscription.planTier,
            status: subscription.status,
          })
        : false;

  const grant =
    content && input.role !== "ADMIN"
      ? await findContentAccessGrantByUserAndContentId(prisma, {
          userId: input.userId,
          contentId: content.id,
        })
      : null;

  const hasPurchaseAccess = input.role === "ADMIN" ? true : Boolean(grant);

  return {
    contentId: content?.id ?? null,
    contentConfigured: Boolean(content),
    hasSubscriptionAccess,
    hasPurchaseAccess,
    canReadOnline: hasSubscriptionAccess || hasPurchaseAccess,
    canDownloadPdf: hasPurchaseAccess,
    readerTierLabel: "Pro и Premium",
    pdfProductCode: LONG_NARDY_TEXTBOOK_PDF_PRODUCT_CODE,
  };
}
