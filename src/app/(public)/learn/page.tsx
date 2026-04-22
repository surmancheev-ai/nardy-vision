import { BookOpenText, GraduationCap, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import {
  learningTracks,
  methodologyPoints,
} from "@/features/content/public-content";
import { getLongNardyTextbook } from "@/server/content/long-nardy-textbook";

const icons = [BookOpenText, GraduationCap, Sparkles, LockKeyhole];

export default async function LearnPage() {
  const textbook = await getLongNardyTextbook();
  const chapterPreview = textbook.sections.slice(0, 6);

  return (
    <main className="flex flex-1 flex-col gap-24 pb-20 pt-10">
      <section className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <SectionHeading
            eyebrow="База знаний"
            title="Материалы помогают понять решения движка и быстрее перенести их в практику."
            description="Библиотека не заменяет анализ. Она объясняет типовые структуры, ошибки и планы, которые игрок видит в собственных позициях и матчах."
          />
          <div className="glass-panel rounded-[36px] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Форматы
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Статьи, гайды, серии уроков, практические разборы и protected reader
                  с платной PDF-версией.
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Модель доступа
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Бесплатные материалы, доступ по подписке и отдельная покупка
                  конкретного руководства или PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-accent">
                Новый материал
              </p>
              <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                Практическое руководство по длинным нардам уже встроено в платформу
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                Руководство открывается в защищенном reader внутри кабинета: главы
                разбиты по разделам, свободное копирование и печать отключены, а на
                экран накладывается персональный водяной знак. Для тех, кому удобнее
                офлайн-формат, доступна отдельная покупка компактной PDF-версии.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/library"
                  className="inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                >
                  Открыть библиотеку
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white"
                >
                  Посмотреть сценарии доступа
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <article className="rounded-[28px] border border-line bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Формат
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {textbook.sectionCount} самостоятельных глав, таблицы, практикум и
                  подготовка к турнирной игре.
                </p>
              </article>
              <article className="rounded-[28px] border border-line bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Защита
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Одна глава на экран, персональный водяной знак и повышенный порог для
                  обычного копирования из браузера.
                </p>
              </article>
              <article className="rounded-[28px] border border-line bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Доступ
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Reader входит в Pro и Premium, а PDF можно купить отдельно и скачать
                  из кабинета навсегда.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Оглавление"
              title="Первые главы уже можно просмотреть как маршрут по материалу"
              description="Даже до покупки видно, что библиотека строится вокруг практических сценариев, а не случайного набора заметок."
            />
            <div className="rounded-full border border-line bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted">
              {textbook.estimatedReadLabel}
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {chapterPreview.map((section) => (
              <article
                key={section.id}
                className="rounded-[26px] border border-line bg-white/72 px-5 py-4"
              >
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  {section.chapterLabel}
                </p>
                <h3 className="mt-3 font-serif text-2xl text-foreground">
                  {section.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {section.excerpt}
                </p>
              </article>
            ))}
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
                  Доступ: {track.access}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <SectionHeading
            eyebrow="Как это работает"
            title="Материалы усиливают аналитический продукт, а не дублируют его"
            description="Задача библиотеки — помочь понять, почему рекомендация важна, и превратить вывод движка в устойчивую игровую привычку."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {methodologyPoints.map((point, index) => (
              <article
                key={point}
                className="rounded-[28px] border border-line bg-white/65 p-5"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-accent">
                  Принцип {index + 1}
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
            По подписке
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Подписка открывает более глубокие уровни библиотеки по мере роста тарифа
            и помогает учиться системно, а не отдельными рывками.
          </p>
        </div>
        <div className="glass-panel rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-accent">
            Отдельной покупкой
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Специальные материалы и PDF-версии можно купить отдельно, не переходя на
            более дорогую подписку ради одного нужного ресурса.
          </p>
        </div>
      </section>
    </main>
  );
}
