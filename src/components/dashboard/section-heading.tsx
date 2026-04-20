type DashboardSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DashboardSectionHeading({
  eyebrow,
  title,
  description,
}: DashboardSectionHeadingProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl text-foreground">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}
