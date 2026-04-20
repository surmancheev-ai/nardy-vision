import type {
  BillingOneTimeOffer,
  BillingPlanOffer,
  OneTimeOffer,
  PlanEntitlement,
} from "@/types/billing";
import { LONG_NARDY_TEXTBOOK_PDF_PRODUCT_CODE } from "@/server/content/long-nardy-textbook";

export const planCatalog: PlanEntitlement[] = [
  {
    tier: "FREE",
    monthlyAnalyses: 5,
    premiumContent: false,
    advancedMetrics: false,
  },
  {
    tier: "PRO",
    monthlyAnalyses: 60,
    premiumContent: true,
    advancedMetrics: true,
  },
  {
    tier: "PREMIUM",
    monthlyAnalyses: null,
    premiumContent: true,
    advancedMetrics: true,
  },
];

export const oneTimeOffers: OneTimeOffer[] = [
  {
    code: "position-pack-10",
    mode: "POSITION_PACK",
    credits: 10,
  },
  {
    code: "position-pack-50",
    mode: "POSITION_PACK",
    credits: 50,
  },
  {
    code: LONG_NARDY_TEXTBOOK_PDF_PRODUCT_CODE,
    mode: "CONTENT_ACCESS",
  },
  {
    code: "match-analysis-credit",
    mode: "MATCH_ANALYSIS",
    credits: 1,
  },
];

export const billingPlanOffers: BillingPlanOffer[] = [
  {
    code: "plan-free",
    tier: "FREE",
    name: "Бесплатно",
    priceLabel: "$0",
    cadenceLabel: "/ мес",
    description:
      "Для первого знакомства с сервисом: ограниченное число разборов и доступ к базовой библиотеке материалов.",
    highlights: [
      "До 5 разборов в месяц",
      "Недавняя история анализов",
      "Базовые учебные материалы",
    ],
  },
  {
    code: "plan-pro-monthly",
    tier: "PRO",
    name: "Pro",
    priceLabel: "$29",
    cadenceLabel: "/ мес",
    description:
      "Сбалансированный тариф для регулярной практики, повторного разбора и постоянной работы со своими позициями.",
    highlights: [
      "До 60 разборов в месяц",
      "Расширенные метрики и история",
      "Доступ к premium-библиотеке",
    ],
    featured: true,
  },
  {
    code: "plan-premium-monthly",
    tier: "PREMIUM",
    name: "Premium",
    priceLabel: "$79",
    cadenceLabel: "/ мес",
    description:
      "Для игроков, которым нужен полный доступ к аналитике, premium-материалам и будущим расширенным отчетам.",
    highlights: [
      "Практически безлимитная аналитика",
      "Полный доступ к библиотеке",
      "Приоритет для будущих продвинутых отчетов",
    ],
  },
];

export const billingOneTimeOffers: BillingOneTimeOffer[] = [
  {
    code: "position-pack-10",
    title: "Пакет на 10 разборов",
    priceLabel: "$9",
    description:
      "Разовые кредиты для игроков без подписки или как дополнительный пакет поверх месячного лимита.",
  },
  {
    code: "position-pack-50",
    title: "Пакет на 50 разборов",
    priceLabel: "$35",
    description:
      "Подходит для турнирных серий, тренировочных блоков и длинных сессий разбора.",
  },
  {
    code: "match-analysis-credit",
    title: "Платный разбор матча",
    priceLabel: "$15",
    description:
      "Отдельная вычислительно тяжелая покупка для анализа протоколов MAT или LMA.",
  },
  {
    code: LONG_NARDY_TEXTBOOK_PDF_PRODUCT_CODE,
    title: "PDF практического руководства",
    priceLabel: "$19",
    description:
      "Разовая покупка PDF-версии руководства. После оплаты файл можно скачать из кабинета, а сам материал останется в вашем доступе.",
  },
];
