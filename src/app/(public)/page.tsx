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
              Аналитика позиций для длинных нард
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] text-foreground sm:text-7xl">
                Загрузите позицию и получите
                <span className="text-accent"> разбор, метрики и лучший план</span>
                {" "}в одном окне.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Nardy Vision помогает быстро понять позицию, увидеть сильнейшее
                продолжение и собирать свои разборы в личной истории, чтобы
                тренировка была осознанной, а не случайной.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                Загрузить позицию
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-strong"
              >
                Смотреть тарифы
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
                      Пример результата
                    </p>
                    <h2 className="mt-3 font-serif text-3xl text-foreground">
                      Разбор позиции
                    </h2>
                  </div>
                  <div className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs text-muted">
                    готово
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
                      Обнаружена позиция с переходом в гонку и риском потери
                      темпа на внешнем поле.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-line bg-white/70 p-4">
                      <div className="flex items-center gap-3">
                        <ChartSpline className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium">Эквити лучшего хода</p>
                      </div>
                      <p className="mt-4 font-serif text-5xl text-foreground">
                        +0.42
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        Уверенность 91%, ближайшая альтернатива заметно слабее.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-line bg-white/70 p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium">Рекомендация</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        Сохранить форму прайма, не отпускать контакт слишком
                        рано и оставить себе гибкость на следующий бросок.
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
          eyebrow="Что получает игрок"
          title="После загрузки сервис не просто показывает картинку, а превращает ее в готовый разбор."
          description="Платформа распознает позицию, считает оценку и возвращает результат в формате, с которым удобно работать в реальной тренировке."
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
            eyebrow="Сценарий"
            title="Как устроен разбор позиции"
            description="Сайт ведет игрока от загрузки файла к результату и возвращению в историю без лишних экранов и технического шума."
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
            eyebrow="Почему сервисом удобно пользоваться"
            title="Платформа помогает превратить разбор позиции в регулярную практику"
            description="Материалы, история и доступ к анализу подчинены одной цели: чтобы игрок чаще возвращался к своим решениям и быстрее видел прогресс."
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
            Готово для первых сессий
          </p>
          <h3 className="mt-4 font-serif text-4xl text-foreground">
            Можно загрузить позицию, получить рекомендации и сохранить разбор в
            личной истории уже сейчас.
          </h3>
          <p className="mt-4 text-base leading-8 text-muted">
            Дальше платформа масштабируется в обе стороны: в сторону более
            сильного аналитического движка и в сторону коммерческой модели с
            подпиской, пакетами анализов и платным разбором матчей.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-medium text-foreground"
            >
              О платформе
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
            >
              Перейти к анализу
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
