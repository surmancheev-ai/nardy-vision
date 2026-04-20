import type { AnalysisMode, AnalysisResult } from "@/types/analysis";

type MockAnalysisInput = {
  mode: AnalysisMode;
  fileName: string;
  fileType: string;
  fileSize: number;
};

function buildDeterministicSeed(input: MockAnalysisInput) {
  return Array.from(
    `${input.mode}:${input.fileName}:${input.fileSize}:${input.fileType}`,
  ).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function buildMockAnalysis(input: MockAnalysisInput): AnalysisResult {
  const seed = buildDeterministicSeed(input);
  const riskBucket = seed % 3;

  if (input.mode === "MATCH_PROTOCOL") {
    const mwcLikeScore = Number((((seed % 100) - 32) / 100).toFixed(2));
    const confidence = Number((0.74 + (seed % 22) / 100).toFixed(2));

    return {
      id: `mock-match-${seed}`,
      analysisMode: "MATCH_PROTOCOL",
      status: "COMPLETED",
      inputLabel: input.fileName,
      costLabel: "списание: 1 платный расчет",
      recognizedPosition: null,
      summary:
        "Отчет выделяет самые дорогие по цене ошибки и помогает быстро понять, с каких эпизодов матча стоит начинать подробный разбор.",
      metrics: {
        equity: mwcLikeScore,
        confidence,
        bestMoveScore: Number((Math.abs(mwcLikeScore) + 0.31).toFixed(2)),
        riskLevel:
          riskBucket === 0 ? "medium" : riskBucket === 1 ? "high" : "low",
      },
      recommendations: [
        {
          move: "Начните с ключевых развилок матча",
          explanation:
            "Сначала разберите эпизоды с самой высокой ценой решения, а уже затем уходите в более глубокий повторный расчет.",
          priority: "primary",
        },
        {
          move: "Сравните ошибки по фазам партии",
          explanation:
            "Полезно видеть, где именно копится потеря качества: в дебюте, в борьбе за контакт или в переходе к гонке.",
          priority: "secondary",
        },
      ],
    };
  }

  const equity = Number((((seed % 80) - 25) / 100).toFixed(2));
  const confidence = Number((0.78 + (seed % 18) / 100).toFixed(2));
  const bestMoveScore = Number((Math.abs(equity) + 0.24).toFixed(2));

  return {
    id: `mock-position-${seed}`,
    analysisMode: "POSITION_IMAGE",
    status: "COMPLETED",
    inputLabel: input.fileName,
    costLabel: "без доплаты",
    recognizedPosition: {
      boardState:
        riskBucket === 0
          ? "Полуконтактная гонка с давлением внешнего прайма"
          : riskBucket === 1
            ? "Структура удержания с напряжением по таймингу на внешнем поле"
            : "Закрытая гонка с хрупким переходом к темпу на выбросе",
      currentPlayer: seed % 2 === 0 ? "white" : "black",
    },
    summary:
      riskBucket === 0
        ? "Позиция поощряет баланс между скоростью гонки и сохранением давления на внешнем поле."
        : riskBucket === 1
          ? "Сервис видит структурное преимущество, но штрафует варианты, которые слишком рано ломают форму."
          : "Здесь решает не только скорость, но и качество перехода к следующим двум броскам.",
    metrics: {
      equity,
      confidence,
      bestMoveScore,
      riskLevel:
        riskBucket === 0 ? "medium" : riskBucket === 1 ? "high" : "low",
    },
    recommendations: [
      {
        move:
          riskBucket === 0
            ? "Сохранить прайм и не форсировать гонку"
            : riskBucket === 1
              ? "Сохранить блокирующую структуру и не открывать контакт слишком рано"
              : "Выбрать ход, который оставляет гибкость на выбросе",
        explanation:
          "Лучший ход сохраняет координацию позиции и не отдает инициативу ради краткосрочной скорости.",
        priority: "primary",
      },
      {
        move: "Не перестраивать внешнее поле слишком рано",
        explanation:
          "Альтернативная линия выглядит естественно, но ухудшает следующее ветвление по эквити.",
        priority: "secondary",
      },
      {
        move: "Сравнить соседние броски",
        explanation:
          "Такие позиции особенно полезно тренировать сериями, сравнивая соседние состояния после одного-двух бросков.",
        priority: "secondary",
      },
    ],
  };
}
