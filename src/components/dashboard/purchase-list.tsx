import type { DashboardPurchaseItem } from "@/types/dashboard";

type PurchaseListProps = {
  items: DashboardPurchaseItem[];
};

export function PurchaseList({ items }: PurchaseListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-line bg-white/75 p-4 text-sm leading-7 text-muted">
        This account does not have completed purchases yet. After Stripe is
        connected, position packs, premium materials, and match compute credits
        will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[24px] border border-line bg-white/75 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-medium text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-muted">{item.valueLabel}</p>
            </div>
            <div className="text-sm text-muted">
              <p>{item.createdAt}</p>
              <p className="mt-1 font-medium text-foreground">{item.status}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
