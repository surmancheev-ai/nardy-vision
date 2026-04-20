type EntitlementsPanelProps = {
  premiumContent: boolean;
  advancedMetrics: boolean;
  matchProtocolAccess: boolean;
};

export function EntitlementsPanel({
  premiumContent,
  advancedMetrics,
  matchProtocolAccess,
}: EntitlementsPanelProps) {
  const items = [
    {
      label: "Premium content",
      enabled: premiumContent,
    },
    {
      label: "Advanced metrics",
      enabled: advancedMetrics,
    },
    {
      label: "Match protocol flow",
      enabled: matchProtocolAccess,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-[26px] border border-line bg-white/75 p-5"
        >
          <p className="text-xs uppercase tracking-[0.26em] text-accent">
            Entitlement
          </p>
          <p className="mt-3 text-base font-medium text-foreground">
            {item.label}
          </p>
          <p className="mt-3 text-sm text-muted">
            {item.enabled ? "Enabled" : "Locked by current tier"}
          </p>
        </article>
      ))}
    </div>
  );
}
