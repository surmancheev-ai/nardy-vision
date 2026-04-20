type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <main className="flex flex-1 items-center py-16">
      <div className="page-shell">
        <section className="glass-panel rounded-[32px] px-6 py-12 sm:px-10">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              {eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {description}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
