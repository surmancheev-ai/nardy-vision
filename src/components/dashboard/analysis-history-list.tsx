import type { DashboardAnalysisItem } from "@/types/dashboard";

type AnalysisHistoryListProps = {
  items: DashboardAnalysisItem[];
};

export function AnalysisHistoryList({ items }: AnalysisHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[26px] border border-line bg-white/75 p-5 text-sm leading-7 text-muted">
        No saved analyses yet. Run your first review on `/analyze`, and it will
        appear here automatically.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[26px] border border-line bg-white/75 p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  {item.analysisMode}
                </span>
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  {item.status}
                </span>
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  {item.sourceLabel}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {item.summary}
                </p>
              </div>
            </div>

            <div className="shrink-0 space-y-2 text-sm text-muted">
              <p>{item.createdAt}</p>
              <p className="font-medium text-foreground">
                Cost: {item.creditCost} credit
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
