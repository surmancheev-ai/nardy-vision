type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl leading-none text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="text-base leading-8 text-muted sm:text-lg">{description}</p>
    </div>
  );
}
