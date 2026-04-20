"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type BillingPortalButtonProps = {
  label?: string;
};

export function BillingPortalButton({
  label = "Manage billing",
}: BillingPortalButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePortal() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (response.status === 401) {
        router.push("/login?callbackUrl=/dashboard/subscription");
        return;
      }

      const payload = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !payload.url) {
        setError(payload.message ?? "Billing portal could not be opened.");
        return;
      }

      window.location.href = payload.url;
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePortal}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Opening..." : label}
      </button>
      {error ? (
        <p className="mt-3 text-sm leading-6 text-[#9b4a2f]">{error}</p>
      ) : null}
    </div>
  );
}
