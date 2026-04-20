import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { ProtectedReaderGuard } from "@/components/content/protected-reader-guard";
import styles from "@/components/content/protected-rich-text.module.css";
import { getLongNardyTextbook } from "@/server/content/long-nardy-textbook";
import { getLongNardyTextbookAccess } from "@/server/use-cases/content/get-long-nardy-textbook-access";

export default async function LongNardyPracticalSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const session = await auth();
  const material = await getLongNardyTextbook();
  const currentIndex = material.sections.findIndex((item) => item.id === section);

  if (currentIndex === -1) {
    notFound();
  }

  const currentSection = material.sections[currentIndex];
  const previousSection = material.sections[currentIndex - 1] ?? null;
  const nextSection = material.sections[currentIndex + 1] ?? null;
  const ownerLabel =
    session?.user?.email ?? session?.user?.name ?? "Личный доступ";
  const access =
    session?.user?.id
      ? await getLongNardyTextbookAccess({
          userId: session.user.id,
          role: session.user.role,
        })
      : null;
  const readerTierLabel = access?.readerTierLabel ?? "Pro и Premium";
  const pdfProductCode =
    access?.pdfProductCode ?? "content-long-nardy-practical-pdf";

  if (!access?.canReadOnline) {
    return (
      <main className="space-y-6">
        <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">
              Материал закрыт
            </p>
            <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
              Онлайн-reader открывается по подписке
            </h1>
            <p className="text-sm leading-7 text-muted sm:text-base">
              Полный доступ к живому reader дается в {readerTierLabel}.
              Если подписка пока не нужна, можно купить PDF-версию отдельно и
              получить постоянный доступ к самому материалу внутри кабинета.
            </p>
            <div className="flex flex-wrap gap-3">
              <CheckoutButton
                productCode="plan-pro-monthly"
                label="Открыть через Pro"
              />
              <CheckoutButton
                productCode={pdfProductCode}
                label="Купить PDF"
                variant="secondary"
              />
              <Link
                href="/dashboard/library"
                className="inline-flex rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
              >
                Вернуться к материалам
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">
              Защищенный reader
            </p>
            <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
              {currentSection.title}
            </h1>
            <p className="text-sm leading-7 text-muted sm:text-base">
              {currentSection.excerpt}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/library"
              className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
            >
              Ко всем материалам
            </Link>
            {previousSection ? (
              <Link
                href={previousSection.href}
                className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
              >
                Предыдущая глава
              </Link>
            ) : null}
            {nextSection ? (
              <Link
                href={nextSection.href}
                className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                Следующая глава
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="glass-panel rounded-[30px] px-5 py-6 xl:sticky xl:top-6 xl:self-start">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent">
                {material.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Главы открываются по одной. Материал защищен от обычного
                копирования и печати, а на страницу накладывается персональный
                водяной знак.
              </p>
            </div>

            <nav className="space-y-2">
              {material.sections.map((item) => {
                const isActive = item.id === currentSection.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={[
                      "block rounded-[22px] border px-4 py-3 transition-colors",
                      isActive
                        ? "border-foreground/10 bg-foreground text-white"
                        : "border-line bg-white/75 text-foreground hover:bg-white",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-[11px] uppercase tracking-[0.26em]",
                        isActive ? "text-white/70" : "text-accent",
                      ].join(" ")}
                    >
                      {item.chapterLabel}
                    </p>
                    <p className="mt-2 text-sm leading-6">{item.title}</p>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="glass-panel rounded-[30px] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-accent">
                  {currentSection.chapterLabel}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Режим чтения: одна глава на экран, без свободного copy/select
                  и без печати страницы.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {access.canDownloadPdf ? (
                  <a
                    href="/api/content/long-nardy-practical/pdf"
                    className="inline-flex items-center rounded-full border border-line bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted transition-colors hover:bg-white"
                  >
                    Скачать PDF
                  </a>
                ) : null}
                <div className="rounded-full border border-line bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted">
                  Водяной знак: {ownerLabel}
                </div>
              </div>
            </div>
          </div>

          <ProtectedReaderGuard ownerLabel={ownerLabel}>
            <article
              className={styles.reader}
              dangerouslySetInnerHTML={{ __html: currentSection.html }}
            />
          </ProtectedReaderGuard>
        </section>
      </div>
    </main>
  );
}
