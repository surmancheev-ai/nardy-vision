import { Suspense } from "react";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { BillingStatusBanner } from "@/components/billing/billing-status-banner";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { SectionHeading } from "@/components/marketing/section-heading";
import {
  billingOneTimeOffers,
  billingPlanOffers,
} from "@/server/services/billing/catalog";

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col gap-24 pb-20 pt-10">
      <section className="page-shell">
        <Suspense fallback={null}>
          <BillingStatusBanner location="pricing" />
        </Suspense>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <SectionHeading
            eyebrow="Тарифы"
            title="Подписка для регулярной практики и разовые покупки для точечных задач"
            description="Один игрок хочет постоянно разбирать позиции и накапливать историю, другому нужен пакет анализов или отдельный материал. Платформа поддерживает оба сценария."
          />
          <div className="glass-panel rounded-[36px] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Подписка
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Для тех, кто тренируется регулярно и хочет стабильный месячный
                  доступ.
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Разовые пакеты
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Для редких разборов, дополнительного лимита и отдельных покупок.
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-accent">
                  Матч-анализ
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Для тяжелого расчета по протоколу матча с отдельной тарификацией.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-4 xl:grid-cols-3">
          {billingPlanOffers.map((plan) => {
            const isFeatured = Boolean(plan.featured);
            const isFree = plan.tier === "FREE";

            return (
              <article
                key={plan.code}
                className={`rounded-[34px] border px-6 py-7 ${
                  isFeatured
                    ? "border-accent bg-[#20150f] text-[#f5ebda] shadow-[0_28px_80px_rgba(41,24,7,0.24)]"
                    : "glass-panel"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-[0.28em] ${
                        isFeatured ? "text-[#d4b081]" : "text-accent"
                      }`}
                    >
                      Тариф
                    </p>
                    <h2 className="mt-3 font-serif text-4xl">{plan.name}</h2>
                  </div>
                  {isFeatured ? (
                    <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs">
                      Оптимальный выбор
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <span className="font-serif text-6xl">{plan.priceLabel}</span>
                  <span
                    className={`pb-2 text-sm ${
                      isFeatured ? "text-[#d8c7b0]" : "text-muted"
                    }`}
                  >
                    {plan.cadenceLabel}
                  </span>
                </div>
                <p
                  className={`mt-4 text-sm leading-7 ${
                    isFeatured ? "text-[#d8c7b0]" : "text-muted"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="mt-8 space-y-3">
                  {plan.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isFeatured ? "text-[#d4b081]" : "text-accent"
                        }`}
                      />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  {isFree ? (
                    <Link
                      href="/register"
                      className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
                    >
                      Начать бесплатно
                    </Link>
                  ) : (
                    <CheckoutButton
                      productCode={plan.code}
                      label={`Выбрать ${plan.name}`}
                      variant={isFeatured ? "secondary" : "primary"}
                      fullWidth
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <SectionHeading
            eyebrow="Разовые покупки"
            title="Гибкий доступ без обязательной подписки"
            description="Если подписка не нужна, можно покупать пакеты разборов, отдельный матч-анализ или premium-материалы ровно тогда, когда они действительно нужны."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {billingOneTimeOffers.map((offer) => (
              <article
                key={offer.code}
                className="rounded-[28px] border border-line bg-white/70 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-accent">{offer.priceLabel}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {offer.description}
                </p>
                <div className="mt-6">
                  <CheckoutButton
                    productCode={offer.code}
                    label="Купить"
                    fullWidth
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-[30px] p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Зачем нужны оба сценария
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Один пользователь хочет работать с сервисом каждую неделю, другой
              приходит разобрать турнир, купить один материал или докинуть пакет
              анализов поверх лимита.
            </p>
          </div>
          <div className="glass-panel rounded-[30px] p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-accent">
              Почему это удобно
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Платформа уже поддерживает и подписку, и разовые платежи, поэтому
              доступ к анализу и материалам можно выдавать без ручной путаницы и
              искусственных ограничений для пользователя.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
