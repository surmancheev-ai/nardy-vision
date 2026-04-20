"use client";

import { useSearchParams } from "next/navigation";

type BillingStatusBannerProps = {
  location: "pricing" | "subscription";
};

function getCopy(location: BillingStatusBannerProps["location"], checkout: string | null) {
  if (checkout === "success") {
    return {
      tone: "success",
      title: "Payment completed",
      description:
        location === "subscription"
          ? "Checkout returned successfully. Stripe webhook processing can take a few seconds before the dashboard reflects the new purchase."
          : "Checkout returned successfully. If you are signed in, the dashboard will update after the Stripe webhook is processed.",
    };
  }

  if (checkout === "cancelled") {
    return {
      tone: "neutral",
      title: "Payment was not completed",
      description:
        "The checkout flow was canceled before the payment finished. You can start it again whenever you are ready.",
    };
  }

  return null;
}

export function BillingStatusBanner({ location }: BillingStatusBannerProps) {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const copy = getCopy(location, checkout);

  if (!copy) {
    return null;
  }

  return (
    <div
      className={`rounded-[26px] border px-5 py-4 text-sm leading-7 ${
        copy.tone === "success"
          ? "border-[#c7d7c0] bg-[#f4fbf0] text-[#315533]"
          : "border-line bg-white/75 text-muted"
      }`}
    >
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1">{copy.description}</p>
    </div>
  );
}
