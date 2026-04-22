import Link from "next/link";
import { auth } from "@/auth";
import { CheckoutButton } from "@/components/billing/checkout-button";
import {
  BookOpenText,
  Download,
  LockKeyhole,
  Shield,
  SplitSquareVertical,
} from "lucide-react";
import { DashboardSectionHeading } from "@/components/dashboard/section-heading";
import { getLongNardyTextbook } from "@/server/content/long-nardy-textbook";
import { getLongNardyTextbookAccess } from "@/server/use-cases/content/get-long-nardy-textbook-access";

const protectionIcons = [SplitSquareVertical, Shield, LockKeyhole] as const;

export default async function LibraryPage() {
  const session = await auth();
  const material = await getLongNardyTextbook();
  const access =
    session?.user?.id
      ? await getLongNardyTextbookAccess({
          userId: session.user.id,
          role: session.user.role,
        })
      : null;
  const firstSection = material.sections[0];

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <DashboardSectionHeading
              eyebrow="Библиотека"
              title="Первый живой учебный материал уже встроен в платформу"
              description="Практическое руководство перенесено в закрытый reader внутри кабинета. Оно открывается по главам, а не одним длинным полотном, и уже готово к продажам через подписку и отдельную покупку PDF."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[28px] border border-line bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Материал
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {material.title}
                </p>
              </article>
              <article className="rounded-[28px] border border-line bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Объем
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {material.sectionCount} глав
                </p>
              </article>
              <article className="rounded-[28px] border border-line bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Формат
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {material.estimatedReadLabel}
                </p>
              </article>
            </div>

            <div className="flex flex-wrap gap-3">
              {access?.canReadOnline && firstSection ? (
                <Link
                  href={firstSection.href}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                >
                  <BookOpenText className="h-4 w-4" />
                  Открыть первую главу
                </Link>
              ) : (
                <CheckoutButton
                  productCode="plan-pro-monthly"
                  label="Открыть reader через Pro"
                />
              )}
              {access?.canDownloadPdf ? (
                <a
                  href="/api/content/long-nardy-practical/pdf"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                  Скачать PDF
                </a>
              ) : (
                <CheckoutButton
                  productCode={access?.pdfProductCode ?? "content-long-nardy-practical-pdf"}
                  label="Купить PDF"
                  variant="secondary"
                />
              )}
              <Link
                href="/learn"
                className="inline-flex items-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
              >
                Вернуться к описанию библиотеки
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-line bg-white/75 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">
              Режим защищенного чтения
            </p>
            <div className="mt-5 grid gap-4">
              {material.protectionNotes.map((note, index) => {
                const Icon = protectionIcons[index];

                return (
                  <article
                    key={note}
                    className="rounded-[24px] border border-line/80 bg-white/90 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-soft text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted">{note}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-6 rounded-[24px] border border-line/80 bg-soft/80 p-4 text-sm leading-7 text-muted">
              Reader входит в подписку {access?.readerTierLabel ?? "Pro и Premium"}.
              PDF-файл можно купить отдельно и скачать из кабинета, даже если
              постоянная подписка пока не нужна.
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] px-6 py-7 sm:px-8">
        <DashboardSectionHeading
          eyebrow="Оглавление"
          title="Навигация по главам уже готова"
          description="Материал разбит на независимые разделы, поэтому его удобно читать по теме, а не только подряд от начала до конца."
        />

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {material.sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="rounded-[26px] border border-line bg-white/72 px-5 py-4 transition-colors hover:bg-white"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                {section.chapterLabel}
              </p>
              <h2 className="mt-3 font-serif text-2xl text-foreground">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {section.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
