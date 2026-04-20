type SummaryCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <article className="rounded-[28px] border border-line bg-white/75 p-5">
      <p className="text-xs uppercase tracking-[0.26em] text-accent">{label}</p>
      <p className="mt-3 font-serif text-4xl text-foreground">{value}</p>
      <p className="mt-3 text-sm leading-7 text-muted">{hint}</p>
    </article>
  );
}
