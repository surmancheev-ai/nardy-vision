import { Cog, Layers3, Network, ShieldEllipsis } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import {
  architectureSlices,
  productPrinciples,
} from "@/features/content/public-content";

const icons = [Layers3, Cog, Network, ShieldEllipsis];

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col gap-24 pb-20 pt-10">
      <section className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <SectionHeading
            eyebrow="About the platform"
            title="The product is designed as an analytical training system, not just as a material library."
            description="Content, dashboard, and billing all exist to strengthen the engine. That is why the architecture begins with analysis services, result persistence, and entitlement modeling."
          />
          <div className="glass-panel rounded-[36px] p-6 sm:p-8">
            <p className="text-sm leading-8 text-muted">
              If a player uploads a position, the platform should understand the
              board, preserve the context, return a recommendation, and place
              that result into a long-term training trajectory. Everything else
              in the system is built around that loop.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Core asset
                </p>
                <p className="mt-2 text-lg font-semibold">Analysis engine</p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Delivery model
                </p>
                <p className="mt-2 text-lg font-semibold">
                  SaaS plus one-time access
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-4 md:grid-cols-3">
          {productPrinciples.map((principle) => (
            <article
              key={principle.title}
              className="glass-panel rounded-[30px] px-5 py-6"
            >
              <h2 className="font-serif text-3xl text-foreground">
                {principle.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <SectionHeading
            eyebrow="Architecture slices"
            title="Four layers that do not bleed into each other"
            description="Business rules are not smeared across UI components. Each layer has its own job and its own boundary."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {architectureSlices.map((slice, index) => {
              const Icon = icons[index];

              return (
                <article
                  key={slice.name}
                  className="rounded-[28px] border border-line bg-white/65 p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">
                    {slice.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {slice.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Commercial readiness"
            title="The platform is designed from the start as something that can be sold and operated."
            description="That is why the domain model already includes users, subscriptions, one-time purchases, access grants, and credit accounting for analysis-heavy flows."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-[30px] p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                Subscription path
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Free, Pro, and Premium handle recurring access, monthly limits,
                and expanded dashboard capabilities.
              </p>
            </div>
            <div className="glass-panel rounded-[30px] p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                Purchase path
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Position packs, paid match compute, and standalone materials are
                purchased separately and do not depend on an active subscription.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
