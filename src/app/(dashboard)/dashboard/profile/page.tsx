import { auth } from "@/auth";
import { DashboardSectionHeading } from "@/components/dashboard/section-heading";
import { getDashboardSnapshot } from "@/server/use-cases/dashboard/get-dashboard-snapshot";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const snapshot = await getDashboardSnapshot({
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      role: session.user.role,
    },
  });

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Profile"
          title="User profile and product access"
          description="This layer will eventually hold identity settings, account security, and the bridge between the web platform and desktop-backed analysis."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-line bg-white/75 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Identity
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>
                Name:{" "}
                <span className="font-medium text-foreground">
                  {snapshot.user.name ?? "Not set"}
                </span>
              </p>
              <p>
                Email:{" "}
                <span className="font-medium text-foreground">
                  {snapshot.user.email ?? "Not set"}
                </span>
              </p>
              <p>
                Role:{" "}
                <span className="font-medium text-foreground">
                  {snapshot.user.role}
                </span>
              </p>
            </div>
          </article>

          <article className="rounded-[28px] border border-line bg-white/75 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Desktop-backed future
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              For match analysis, the profile can later store preferred formats,
              MAT or LMA import history, and the status of background jobs
              started through a local worker.
            </p>
          </article>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Implementation notes"
          title="What is already prepared in the cabinet"
          description="The dashboard is built on top of a server use-case and real persistence rather than a collection of hardcoded widgets."
        />
        <div className="mt-8 grid gap-3">
          {snapshot.notes.map((note) => (
            <div
              key={note}
              className="rounded-full border border-line bg-white/70 px-4 py-3 text-sm text-foreground"
            >
              {note}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
