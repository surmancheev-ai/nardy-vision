import { BookOpenText, GraduationCap, LockKeyhole, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import {
  learningTracks,
  methodologyPoints,
} from "@/features/content/public-content";

const icons = [BookOpenText, GraduationCap, Sparkles, LockKeyhole];

export default function LearnPage() {
  return (
    <main className="flex flex-1 flex-col gap-24 pb-20 pt-10">
      <section className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <SectionHeading
            eyebrow="Learning library"
            title="Learning is built around decisions, not around abstract theory."
            description="The material library is a companion layer to the engine. Its job is to help players interpret analysis results and turn them into stable playing patterns."
          />
          <div className="glass-panel rounded-[36px] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Formats
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Articles, guides, lesson series, workshops, and premium dossiers.
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Access model
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Free, Pro, Premium, or one-time access per material.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-4 xl:grid-cols-4">
          {learningTracks.map((track, index) => {
            const Icon = icons[index];

            return (
              <article
                key={track.title}
                className="glass-panel rounded-[30px] px-5 py-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.26em] text-accent">
                  {track.format}
                </p>
                <h2 className="mt-3 font-serif text-3xl text-foreground">
                  {track.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {track.description}
                </p>
                <div className="mt-5 inline-flex rounded-full border border-line bg-white/70 px-3 py-1 text-xs text-foreground">
                  Access: {track.access}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <SectionHeading
            eyebrow="Methodology"
            title="How content strengthens the analytical product"
            description="The materials do not duplicate the engine. They explain why a recommendation matters and how to turn engine output into a playing habit."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {methodologyPoints.map((point, index) => (
              <article
                key={point}
                className="rounded-[28px] border border-line bg-white/65 p-5"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-accent">
                  Principle {index + 1}
                </p>
                <p className="mt-4 text-sm leading-7 text-muted">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-accent">
            For subscriptions
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Subscriptions unlock deeper layers of the library according to plan
            tier and support long-form study over time.
          </p>
        </div>
        <div className="glass-panel rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-accent">
            For one-time sales
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Premium dossiers and special materials can be sold individually and
            unlocked through access grants without forcing a subscription upgrade.
          </p>
        </div>
      </section>
    </main>
  );
}
