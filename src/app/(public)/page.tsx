import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChartSpline,
  Layers3,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import {
  analysisFlow,
  enginePillars,
  heroStats,
  trustSignals,
} from "@/features/content/public-content";

const pillarIcons = [ScanSearch, BrainCircuit, Layers3];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-24 pb-20 pt-10">
      <section className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-accent">
              Analysis-first SaaS for long nardy
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] text-foreground sm:text-7xl">
                A platform where the main value is not the lesson,
                <span className="text-accent"> but the analytical engine.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Nardy Vision turns a board image into a structured review:
                position recognition, actionable recommendations, and metrics for
                players who want deliberate training rather than random practice.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                Upload a position
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-strong"
              >
                View pricing
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-panel rounded-[24px] px-5 py-5"
                >
                  <p className="font-serif text-4xl text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(155,107,47,0.22),_transparent_70%)] blur-2xl" />
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-accent">
                      Mock analysis preview
                    </p>
                    <h2 className="mt-3 font-serif text-3xl text-foreground">
                      Position intelligence
                    </h2>
                  </div>
                  <div className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs text-muted">
                    status: completed
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[28px] border border-line bg-[#1f1711] p-4 text-[#f5ebda]">
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 24 }, (_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-xl ${
                            index % 3 === 0
                              ? "bg-[#c59a62]"
                              : index % 4 === 0
                                ? "bg-[#f1d9b0]"
                                : "bg-[#8a5e31]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#d8c7b0]">
                      Detected structure: closed race with contact risk on the
                      outer board.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-line bg-white/70 p-4">
                      <div className="flex items-center gap-3">
                        <ChartSpline className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium">Best move equity</p>
                      </div>
                      <p className="mt-4 font-serif text-5xl text-foreground">
                        +0.42
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        Confidence 91%, alternative line drops to +0.18.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-line bg-white/70 p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium">Recommendation</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        Preserve timing, avoid premature release from the prime,
                        and keep the race flexible for the next roll.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <SectionHeading
          eyebrow="Engine core"
          title="The site wraps the engine instead of hiding it."
          description="The MVP foundation is built around an analysis service that can switch from mock API to production endpoint without forcing a UI rewrite."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {enginePillars.map((pillar, index) => {
            const Icon = pillarIcons[index];

            return (
              <article
                key={pillar.title}
                className="glass-panel rounded-[28px] px-5 py-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <SectionHeading
            eyebrow="Workflow"
            title="How the position analysis flow works"
            description="The user path is already structured for history, usage limits, and future asynchronous processing."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {analysisFlow.map((item) => (
              <article
                key={item.step}
                className="rounded-[28px] border border-line bg-white/65 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                  {item.step}
                </p>
                <h3 className="mt-4 font-serif text-3xl text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-center">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Why this foundation"
            title="SaaS-ready from the first release"
            description="The platform is already prepared for multi-user access, pricing tiers, limits, and a real backend engine without architectural fracture."
          />
          <div className="grid gap-3">
            {trustSignals.map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-3 rounded-full border border-line bg-white/60 px-4 py-3 text-sm text-foreground"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                {signal}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[36px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Ready for the next layers
          </p>
          <h3 className="mt-4 font-serif text-4xl text-foreground">
            Auth, billing, storage, and the real engine can all evolve without
            replacing the foundation.
          </h3>
          <p className="mt-4 text-base leading-8 text-muted">
            The database already supports analysis history, access tiers,
            one-time packs, and standalone premium material sales. That is the
            kind of groundwork that keeps an MVP from collapsing under its first
            real users.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-foreground"
            >
              View architecture
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
            >
              Explore the library
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
