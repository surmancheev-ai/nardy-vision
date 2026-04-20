import { BookOpenText, GraduationCap, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
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
            eyebrow="База знаний"
            title="Материалы помогают понять решения движка и быстрее закрепить их в игре."
            description="Библиотека не заменяет анализ. Она объясняет типовые структуры, ошибки и планы, которые игрок видит в собственных позициях."
          />
          <div className="glass-panel rounded-[36px] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Форматы
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Статьи, гайды, серии уроков, практические разборы и premium-досье.
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Модель доступа
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Бесплатно, Pro, Premium или отдельная покупка конкретного материала.
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
                Руководство открывается в защищенном reader внутри кабинета:
                главы разбиты по разделам, свободное копирование и печать
                отключены, а на экран накладывается персональный водяной знак.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/library"
                  className="inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                >
                  Открыть материал
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
                  20 самостоятельных глав, таблицы, практикум и предтурнирный
                  лист.
                </p>
              </article>
              <article className="rounded-[28px] border border-line bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Защита
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Одна глава на экран, без обычного copy/select и без печати из
                  браузера.
                </p>
              </article>
              <article className="rounded-[28px] border border-line bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Следующий шаг
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Reader уже входит в Pro/Premium, а компактную PDF-версию
                  можно купить отдельно и скачать из кабинета.
                </p>
              </article>
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
            Подписка открывает более глубокие уровни библиотеки по мере роста
            тарифа и помогает учиться системно, а не рывками.
          </p>
        </div>
        <div className="glass-panel rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-accent">
            Отдельной покупкой
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Special-досье и узкие тематические материалы можно купить отдельно,
            не переходя на более дорогую подписку.
          </p>
        </div>
      </section>
    </main>
  );
}
