"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CheckoutButtonProps = {
  productCode: string;
  label: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export function CheckoutButton({
  productCode,
  label,
  variant = "primary",
  fullWidth = false,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productCode,
        }),
      });

      if (response.status === 401) {
        router.push("/login?callbackUrl=/pricing");
        return;
      }

      const payload = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !payload.url) {
        setError(payload.message ?? "Checkout could not be started.");
        return;
      }

      window.location.href = payload.url;
    });
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isPending}
        className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 ${
          fullWidth ? "w-full" : ""
        } ${
          variant === "primary"
            ? "bg-foreground text-background"
            : "border border-line bg-white/80 text-foreground"
        }`}
      >
        {isPending ? "Redirecting..." : label}
      </button>
      {error ? (
        <p className="mt-3 text-sm leading-6 text-[#9b4a2f]">{error}</p>
      ) : null}
    </div>
  );
}
