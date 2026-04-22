import Link from "next/link";
import type { DashboardAnalysisItem } from "@/types/dashboard";

type AnalysisHistoryListProps = {
  items: DashboardAnalysisItem[];
};

function formatModeLabel(mode: DashboardAnalysisItem["analysisMode"]) {
  return mode === "MATCH_PROTOCOL"
    ? "Разбор матча"
    : "Разбор позиции";
}

function formatStatusLabel(status: DashboardAnalysisItem["status"]) {
  switch (status) {
    case "QUEUED":
      return "В очереди";
    case "PROCESSING":
      return "В обработке";
    case "COMPLETED":
      return "Готово";
    case "FAILED":
      return "Ошибка";
  }
}

function formatCostLabel(creditCost: number) {
  return creditCost === 0 ? "Бесплатно" : `Списано: ${creditCost} кредит`;
}

export function AnalysisHistoryList({ items }: AnalysisHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[26px] border border-line bg-white/75 p-5 text-sm leading-7 text-muted">
        Пока здесь пусто. Запустите первый разбор на странице{" "}
        <Link href="/analyze" className="font-medium text-foreground">
          /analyze
        </Link>
        , и он автоматически появится в истории.
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
                  {formatModeLabel(item.analysisMode)}
                </span>
                <span className="rounded-full border border-line bg-white px-3 py-1">
                  {formatStatusLabel(item.status)}
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

            <div className="shrink-0 space-y-3 text-sm text-muted">
              <p>{item.createdAt}</p>
              <p className="font-medium text-foreground">
                {formatCostLabel(item.creditCost)}
              </p>
              <Link
                href={`/dashboard/analyses/${item.id}`}
                className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Открыть разбор
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
