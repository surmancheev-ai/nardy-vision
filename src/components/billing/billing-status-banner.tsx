"use client";

import { useSearchParams } from "next/navigation";

type BillingStatusBannerProps = {
  location: "pricing" | "subscription";
};

function getCopy(
  location: BillingStatusBannerProps["location"],
  checkout: string | null,
) {
  if (checkout === "success") {
    return {
      tone: "success",
      title: "Оплата прошла успешно",
      description:
        location === "subscription"
          ? "Платеж подтвержден. Обработка webhook от Stripe может занять несколько секунд, прежде чем покупка отразится в кабинете."
          : "Платеж подтвержден. Если вы вошли в аккаунт, кабинет обновится после обработки webhook от Stripe.",
    };
  }

  if (checkout === "cancelled") {
    return {
      tone: "neutral",
      title: "Оплата не завершена",
      description:
        "Платеж был отменен до завершения. Вы можете вернуться к оплате в любой удобный момент.",
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
