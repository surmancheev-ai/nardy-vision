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
            eyebrow="О платформе"
            title="Nardy Vision строится как рабочая система разбора, а не как витрина уроков."
            description="Игрок загружает позицию, получает оценку, рекомендации и возвращается к своим разборам в личном кабинете. Контент и тарифы поддерживают этот цикл, а не подменяют его."
          />
          <div className="glass-panel rounded-[36px] p-6 sm:p-8">
            <p className="text-sm leading-8 text-muted">
              Если игрок присылает позицию, платформа должна понять структуру
              доски, вернуть сильнейший план и встроить этот результат в длинную
              траекторию обучения. Все остальное в системе строится вокруг этого
              цикла.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Ключевой актив
                </p>
                <p className="mt-2 text-lg font-semibold">Аналитический движок</p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Модель продаж
                </p>
                <p className="mt-2 text-lg font-semibold">
                  SaaS и разовые покупки
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
            eyebrow="Как устроена платформа"
            title="Четыре слоя без смешения ролей"
            description="Бизнес-правила не размазаны по интерфейсу. У каждого слоя есть своя задача и своя граница ответственности."
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
            eyebrow="Коммерческая готовность"
            title="Платформа с самого начала проектируется как продукт, который можно продавать и масштабировать."
            description="Поэтому доменная модель уже учитывает пользователей, подписки, разовые покупки, доступ к материалам и учет кредитов для тяжелых сценариев анализа."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-[30px] p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                Подписка
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Free, Pro и Premium закрывают регулярный доступ, месячные лимиты
                и более глубокий функционал личного кабинета.
              </p>
            </div>
            <div className="glass-panel rounded-[30px] p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-accent">
                Разовые покупки
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Пакеты анализов, платный расчет матчей и отдельные материалы
                покупаются независимо и не зависят от активной подписки.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
