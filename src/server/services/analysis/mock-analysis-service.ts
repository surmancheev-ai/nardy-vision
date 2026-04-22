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
        "Отчет показывает, какие развилки матча дали максимальную потерю качества и с каких эпизодов стоит начинать повторный просмотр.",
      metrics: {
        equity: mwcLikeScore,
        confidence,
        bestMoveScore: Number((Math.abs(mwcLikeScore) + 0.31).toFixed(2)),
        riskLevel:
          riskBucket === 0 ? "medium" : riskBucket === 1 ? "high" : "low",
      },
      recommendations: [
        {
          move: "Разберите самые дорогие ошибки первыми",
          explanation:
            "Сначала пройдитесь по эпизодам с максимальной ценой решения, а уже потом углубляйтесь в тонкие альтернативы.",
          priority: "primary",
        },
        {
          move: "Сравните качество игры по фазам матча",
          explanation:
            "Отдельно посмотрите дебют, борьбу за контакт и переход к гонке: это помогает быстрее увидеть повторяющийся паттерн ошибки.",
          priority: "secondary",
        },
      ],
      workerState: {
        provider: "MOCK",
        status: "COMPLETED",
        detail:
          "Это демонстрационный матч-отчет. Реальный Windows-worker с LogasAI будет возвращать такой же экран, но с живыми данными.",
        artifactReady: false,
        artifactLabel: null,
      },
      artifactDownloadUrl: null,
      matchReport: {
        protocolFormat: input.fileName.split(".").pop()?.toUpperCase(),
        analyzedWith: "Демо-отчет платформы",
        totalPlies: 18,
        overallVerdict:
          "Матч лучше всего разбирать не целиком, а через три ключевые зоны: ранняя структура, борьба за темп и переход к гонке.",
        phases: [
          {
            title: "Дебют и первый контакт",
            moveRange: "Ходы 1–4",
            summary:
              "Первые решения задали слишком пассивную структуру и заставили входить в контакт из неудобного темпа.",
            focus: "Сравнить два первых безопасных плана развития.",
          },
          {
            title: "Средняя стадия",
            moveRange: "Ходы 5–7",
            summary:
              "Ключевая потеря качества пришлась на момент, где нужно было выбирать между сохранением формы и ускорением.",
            focus: "Пересмотреть один дорогой выбор под бросок давления.",
          },
          {
            title: "Переход к гонке",
            moveRange: "Ходы 8–9",
            summary:
              "Концовка проигрывается не из-за скорости, а из-за качества предыдущего перехода.",
            focus: "Проверить, можно ли было войти в гонку с лучшей координацией.",
          },
        ],
        keyMoments: [
          {
            title: "Слишком ранний размен структуры на темп",
            moveRange: "Ход 3",
            swing: 0.24,
            summary:
              "Раннее ускорение выглядело естественно, но оставило неудобное продолжение на следующем броске.",
          },
          {
            title: "Потеря гибкости на внешнем поле",
            moveRange: "Ход 6",
            swing: 0.31,
            summary:
              "Именно здесь матч резко уходит в менее комфортный сценарий для последующей гонки.",
          },
        ],
        moveReviews: [
          {
            ply: 3,
            side: "white",
            move: "13/8 8/6",
            phase: "Дебют и первый контакт",
            evaluationLoss: 0.24,
            severity: "medium",
            summary:
              "Ход ускоряет игру, но оставляет структуру слишком жесткой под ответный бросок.",
            recommendation:
              "Сравните с более спокойным вариантом, который сохраняет форму без потери темпа.",
          },
          {
            ply: 6,
            side: "black",
            move: "24/20 20/15",
            phase: "Средняя стадия",
            evaluationLoss: 0.31,
            severity: "high",
            summary:
              "Ключевая ошибка матча: разменял удобную структуру на краткосрочную активность.",
            recommendation:
              "Пересмотрите развилку в LogasAI Analysis по ходам и сравните два лучших альтернативных плана.",
          },
          {
            ply: 9,
            side: "white",
            move: "10/5 6/4",
            phase: "Переход к гонке",
            evaluationLoss: 0.17,
            severity: "low",
            summary:
              "Финальный ход лишь закрепляет проблему, созданную двумя решениями раньше.",
            recommendation:
              "Анализируйте этот момент в связке с предыдущим ключевым эпизодом, а не отдельно.",
          },
        ],
        nextActions: [
          "Откройте LogasAI Analysis и перепроверьте два самых дорогих эпизода по ходам.",
          "Соберите отдельную подборку похожих гонок и сравните переходы.",
          "После повтора вернитесь к этому отчету и отметьте, какие решения повторяются чаще всего.",
        ],
      },
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
          ? "Есть структурное преимущество, но ранний размен формы на темп заметно просаживает продолжение."
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
          "Лучший ход сохраняет координацию позиции и не отдает инициативу ради краткосрочного ускорения.",
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
    matchReport: null,
    workerState: null,
    artifactDownloadUrl: null,
  };
}
