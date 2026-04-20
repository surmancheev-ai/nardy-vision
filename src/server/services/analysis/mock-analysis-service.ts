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
      costLabel: "Paid compute analysis",
      recognizedPosition: null,
      summary:
        "Mock match report: the production pipeline will import MAT files, run a local analysis worker, normalize the raw output, and return a web-friendly report.",
      metrics: {
        equity: mwcLikeScore,
        confidence,
        bestMoveScore: Number((Math.abs(mwcLikeScore) + 0.31).toFixed(2)),
        riskLevel:
          riskBucket === 0 ? "medium" : riskBucket === 1 ? "high" : "low",
      },
      recommendations: [
        {
          move: "Review the key match branches in a deeper pass",
          explanation:
            "The full match report works best as a map of the most expensive decisions before you spend more compute on a deeper run.",
          priority: "primary",
        },
        {
          move: "Show normalized error summaries by phase",
          explanation:
            "This is where paid match analysis starts feeling valuable: the player sees a structured report instead of a raw engine export.",
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
    costLabel: "Included in demo flow",
    recognizedPosition: {
      boardState:
        riskBucket === 0
          ? "Semi-contact race with external prime pressure"
          : riskBucket === 1
            ? "Containment structure with timing tension on the outer board"
            : "Closed race with a fragile transition into bear-off tempo",
      currentPlayer: seed % 2 === 0 ? "white" : "black",
    },
    summary:
      riskBucket === 0
        ? "The position rewards a careful balance between racing tempo and keeping pressure on the outer board."
        : riskBucket === 1
          ? "The system sees a structural edge, but it penalizes lines that break shape too early."
          : "The key factor here is not raw speed by itself, but the quality of the transition into the next two rolls.",
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
            ? "Keep the prime structure and avoid forcing the race"
            : riskBucket === 1
              ? "Protect the blocking structure and do not open contact early"
              : "Choose the move that keeps bear-off flexibility",
        explanation:
          "The best move keeps the position coordinated and avoids giving up initiative for short-term speed.",
        priority: "primary",
      },
      {
        move: "Avoid premature outer-board reconstruction",
        explanation:
          "The alternative line looks natural at first glance, but it worsens the next equity branch.",
        priority: "secondary",
      },
      {
        move: "Recheck the next roll sequence",
        explanation:
          "This type of position is ideal for training in short series where the value appears in comparing neighboring states.",
        priority: "secondary",
      },
    ],
  };
}
