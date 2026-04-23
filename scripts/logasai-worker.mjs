import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { launchLogasAI, parseArgs, prepareAnalysisSession, resolveDefaultLogasAIPath } from "./logasai-analysis-session.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? process.env,
      windowsHide: options.windowsHide ?? true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with exit code ${code}\n${stderr || stdout}`.trim(),
        ),
      );
    });
  });
}

function resolveDefaultWorkspaceRoot() {
  return path.join(process.cwd(), ".logasai-worker");
}

function buildJobPaths(jobDir) {
  const inputDir = path.join(jobDir, "input");
  const outputDir = path.join(jobDir, "output");
  return {
    inputDir,
    outputDir,
    outputFilePath: path.join(outputDir, "result.lma"),
    resultJsonPath: path.join(jobDir, "result.json"),
    failFilePath: path.join(jobDir, "FAIL.txt"),
    windowCapturePath: path.join(jobDir, "window-capture.png"),
    statusJsonPath: path.join(jobDir, "status.json"),
    statusDebugDir: path.join(jobDir, "status-debug"),
  };
}

function buildHeaders(workerToken) {
  return {
    "content-type": "application/json",
    "x-logasai-worker-token": workerToken,
  };
}

async function apiJson(serverOrigin, workerToken, routePath, init = {}) {
  const response = await fetch(`${serverOrigin}${routePath}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...buildHeaders(workerToken),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : `HTTP ${response.status}`;
    throw new Error(`${routePath}: ${message}`);
  }

  return payload;
}

function resolveWorkerFetchUrl(serverOrigin, inputDownloadUrl) {
  if (!inputDownloadUrl.startsWith("http")) {
    return `${serverOrigin}${inputDownloadUrl}`;
  }

  const claimedUrl = new URL(inputDownloadUrl);
  return `${serverOrigin}${claimedUrl.pathname}${claimedUrl.search}`;
}

async function downloadJobInput(serverOrigin, workerToken, inputDownloadUrl) {
  const fetchUrl = resolveWorkerFetchUrl(serverOrigin, inputDownloadUrl);
  console.log(`[worker] downloading input: ${fetchUrl}`);

  let response;
  try {
    response = await fetch(fetchUrl, {
      headers: {
        "x-logasai-worker-token": workerToken,
      },
    });
  } catch (error) {
    throw new Error(`Could not download job input from ${fetchUrl}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Could not download job input from ${fetchUrl}: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function writeJobInstructions(jobDir, job, inputFilePath, outputFilePath) {
  const instructions = [
    "LogasAI Worker Job",
    "",
    `Job ID: ${job.jobId}`,
    `Analysis ID: ${job.analysisId}`,
    `Input file: ${inputFilePath}`,
    `Expected result: ${outputFilePath}`,
    "",
    "Шаги:",
    "1. Откройте LogasAI Analysis.",
    "2. Файл -> Импортировать и выберите MAT-файл из папки input.",
    "3. Анализ -> Выбрать все, затем Анализ -> Запустить.",
    "4. Сохраните итоговый матч как result.lma в папку output.",
    "5. При желании дополните result.json: summary, metrics, recommendations, matchReport.",
    "6. Если задача не удалась, создайте FAIL.txt и запишите туда причину.",
    "",
    "Worker сам следит за этой папкой и автоматически отправит результат на платформу.",
    "",
  ].join("\n");

  await fs.writeFile(path.join(jobDir, "README.txt"), instructions, "utf8");
}

async function writeResultTemplate(jobDir) {
  const template = {
    summary:
      "Отчет LogasAI сохранен. Подробный файл анализа приложен к заданию.",
    metrics: null,
    recommendations: [],
    matchReport: {
      protocolFormat: "MAT",
      analyzedWith: "LogasAI Analysis",
      totalPlies: 0,
      overallVerdict: "Краткий вывод по матчу.",
      phases: [],
      keyMoments: [],
      moveReviews: [],
      nextActions: [],
    },
    rawResponse: {
      source: "logasai-desktop-worker",
      note: "You can extend this object with parsed metadata later.",
    },
  };

  await fs.writeFile(
    path.join(jobDir, "result.template.json"),
    JSON.stringify(template, null, 2),
    "utf8",
  );
}

function buildAutoSummary(metricsPayload) {
  const masterValues = metricsPayload?.summary_metrics?.master?.values ?? [];
  const humanValues = metricsPayload?.summary_metrics?.human?.values ?? [];
  const metricsParts = [];

  if (masterValues.length > 0) {
    metricsParts.push(`Master: ${masterValues.join(", ")}`);
  }

  if (humanValues.length > 0) {
    metricsParts.push(`Human: ${humanValues.join(", ")}`);
  }

  if (metricsParts.length === 0) {
    return "Анализ LogasAI завершен. Метрики не удалось надежно распознать, но LMA-файл сохранен.";
  }

  return `Анализ LogasAI завершен. Ключевые метрики: ${metricsParts.join(" | ")}.`;
}

function buildAutoResultJson(metricsPayload) {
  return {
    summary: buildAutoSummary(metricsPayload),
    metrics: {
      state: metricsPayload.state,
      summaryMetrics: metricsPayload.summary_metrics,
      progressRegion: metricsPayload.progress_region,
      statusRegion: metricsPayload.status_region,
    },
    recommendations: [],
    rawResponse: {
      source: "logasai-status-detector",
      detection: metricsPayload,
    },
  };
}

async function captureLogasAIWindow(config, outFilePath) {
  const scriptPath = path.join(process.cwd(), "scripts", "logasai-window-capture.ps1");
  await runCommand(
    config.powershellPath,
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-OutFile",
      outFilePath,
    ],
    { windowsHide: true },
  );
}

async function detectLogasAIStatus(config, capturePath, statusJsonPath, debugDir) {
  const scriptPath = path.join(process.cwd(), "scripts", "logasai-status-detector.py");
  const { stdout } = await runCommand(
    config.pythonPath,
    [
      scriptPath,
      "--image",
      capturePath,
      "--output-json",
      statusJsonPath,
      "--debug-dir",
      debugDir,
    ],
    { windowsHide: true },
  );

  return JSON.parse(stdout);
}

async function automateLogasAISequence(config) {
  const importScriptPath = path.join(process.cwd(), "scripts", "logasai-analysis-automation.ps1");
  const dialogScriptPath = path.join(process.cwd(), "scripts", "logasai-dialog-click.ps1");
  const startScriptPath = path.join(process.cwd(), "scripts", "logasai-start-analysis.ps1");

  await runCommand(
    config.powershellPath,
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      importScriptPath,
      "-Action",
      "import-current-mat",
    ],
    { windowsHide: true },
  );

  const importDialog = await runCommand(
    config.powershellPath,
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      dialogScriptPath,
      "-ButtonRole",
      "primary",
    ],
    { windowsHide: true },
  );

  await sleep(config.afterImportDelayMs);

  const startSequence = await runCommand(
    config.powershellPath,
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      startScriptPath,
      "-Method",
      String(config.analysisMethod),
      "-BannerX",
      String(config.bannerX),
      "-BannerY",
      String(config.bannerY),
      "-PlayX",
      String(config.playX),
      "-PlayY",
      String(config.playY),
      "-MethodMenuOffsetX",
      String(config.methodMenuOffsetX),
      "-Method1OffsetY",
      String(config.method1OffsetY),
      "-Method2OffsetY",
      String(config.method2OffsetY),
      "-MenuOpenDelayMs",
      String(config.menuOpenDelayMs),
      "-AfterMethodDelayMs",
      String(config.afterMethodDelayMs),
      "-AfterPlayDelayMs",
      String(config.afterPlayDelayMs),
    ],
    { windowsHide: true },
  );

  const saveDialog = await runCommand(
    config.powershellPath,
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      dialogScriptPath,
      "-ButtonRole",
      "primary",
    ],
    { windowsHide: true },
  );

  return {
    importDialog: JSON.parse(importDialog.stdout),
    startSequence: JSON.parse(startSequence.stdout),
    saveDialog: JSON.parse(saveDialog.stdout),
  };
}

async function waitForJobOutcome({
  config,
  jobDir,
  pollSeconds,
}) {
  const {
    outputFilePath,
    resultJsonPath,
    failFilePath,
    windowCapturePath,
    statusJsonPath,
    statusDebugDir,
  } = buildJobPaths(jobDir);
  const startedAt = Date.now();

  for (;;) {
    if (await fileExists(failFilePath)) {
      const message = await fs.readFile(failFilePath, "utf8");
      return {
        type: "fail",
        errorMessage: message.trim() || "Worker marked the job as failed.",
      };
    }

    if (await fileExists(outputFilePath)) {
      let resultJson = null;
      let statusPayload = null;

      if (config.requireAnalysisComplete) {
        try {
          await captureLogasAIWindow(config, windowCapturePath);
          statusPayload = await detectLogasAIStatus(
            config,
            windowCapturePath,
            statusJsonPath,
            statusDebugDir,
          );
        } catch (error) {
          console.warn(`[worker] could not detect LogasAI status yet: ${error.message}`);
        }

        if (!statusPayload || statusPayload.state !== "complete") {
          if (
            config.analysisTimeoutSeconds > 0 &&
            Date.now() - startedAt > config.analysisTimeoutSeconds * 1000
          ) {
            return {
              type: "fail",
              errorMessage:
                "LogasAI analysis did not reach complete state before timeout.",
            };
          }

          await sleep(pollSeconds * 1000);
          continue;
        }

        const autoResultJson = buildAutoResultJson(statusPayload);
        await fs.writeFile(
          resultJsonPath,
          JSON.stringify(autoResultJson, null, 2),
          "utf8",
        );
        resultJson = autoResultJson;
      } else if (await fileExists(resultJsonPath)) {
        resultJson = JSON.parse(await fs.readFile(resultJsonPath, "utf8"));
      }

      return {
        type: "complete",
        artifactBase64: await fs.readFile(outputFilePath, { encoding: "base64" }),
        artifactFileName: path.basename(outputFilePath),
        resultJson,
      };
    }

    await sleep(pollSeconds * 1000);
  }
}

function normalizeCompletionPayload(outcome, workerId) {
  const resultJson = outcome.resultJson ?? {};
  const summary =
    typeof resultJson.summary === "string" && resultJson.summary.trim()
      ? resultJson.summary.trim()
      : "Отчет LogasAI сохранен. Подробный файл анализа приложен к заданию.";

  const metrics =
    resultJson.metrics &&
    typeof resultJson.metrics === "object"
      ? resultJson.metrics
      : null;

  const recommendations = Array.isArray(resultJson.recommendations)
    ? resultJson.recommendations
    : [];

  const matchReport =
    resultJson.matchReport &&
    typeof resultJson.matchReport === "object"
      ? resultJson.matchReport
      : null;

  const rawResponse =
    resultJson.rawResponse &&
    typeof resultJson.rawResponse === "object"
      ? resultJson.rawResponse
      : {};

  return {
    workerId,
    summary,
    metrics,
    recommendations,
    rawResponse: {
      source: "logasai-desktop-worker",
      artifactFileName: outcome.artifactFileName,
      ...(matchReport ? { matchReport } : {}),
      ...rawResponse,
    },
    artifactFileName: outcome.artifactFileName,
    artifactBase64: outcome.artifactBase64,
  };
}

async function processClaimedJob(config, job) {
  const jobDir = path.join(config.workspaceRoot, "jobs", job.jobId);
  const {
    inputDir,
    outputDir,
    outputFilePath,
  } = buildJobPaths(jobDir);
  const inputFilePath = path.join(inputDir, job.inputFileName || "match.mat");

  await ensureDir(inputDir);
  await ensureDir(outputDir);

  const inputBuffer = await downloadJobInput(
    config.serverOrigin,
    config.workerToken,
    job.inputDownloadUrl,
  );
  await fs.writeFile(inputFilePath, inputBuffer);
  await writeJobInstructions(jobDir, job, inputFilePath, outputFilePath);
  await writeResultTemplate(jobDir);

  console.log(`[worker] job claimed: ${job.jobId}`);
  console.log(`[worker] input saved to: ${inputFilePath}`);
  console.log(`[worker] output expected at: ${outputFilePath}`);

  if (config.prepareSession) {
    try {
      const session = await prepareAnalysisSession({
        matFilePath: inputFilePath,
        lmaFilePath: outputFilePath,
        windowLeft: config.windowLeft,
        windowTop: config.windowTop,
        windowWidth: config.windowWidth,
        windowHeight: config.windowHeight,
        windowState: config.windowState,
      });
      console.log(`[worker] session prepared: ${session.iniPath}`);
    } catch (error) {
      console.warn(`[worker] could not prepare LogasAI session: ${error.message}`);
    }
  }

  if (config.autoOpen && config.logasaiPath) {
    try {
      const launchedPath = launchLogasAI(config.logasaiPath);
      console.log(`[worker] LogasAI launched: ${launchedPath}`);
    } catch (error) {
      console.warn(`[worker] could not launch LogasAI: ${error.message}`);
    }
  }

  if (config.autoDrive) {
    try {
      const automationResult = await automateLogasAISequence(config);
      console.log(`[worker] automation sequence completed: ${JSON.stringify(automationResult)}`);
    } catch (error) {
      console.warn(`[worker] could not automate LogasAI GUI: ${error.message}`);
    }
  }

  const outcome = await waitForJobOutcome({
    config,
    jobDir,
    pollSeconds: config.pollSeconds,
  });

  if (outcome.type === "fail") {
    await apiJson(
      config.serverOrigin,
      config.workerToken,
      `/api/internal/logasai/jobs/${job.jobId}/fail`,
      {
        method: "POST",
        body: JSON.stringify({
          workerId: config.workerId,
          errorMessage: outcome.errorMessage,
        }),
      },
    );
    console.log(`[worker] job failed: ${job.jobId}`);
    return;
  }

  await apiJson(
    config.serverOrigin,
    config.workerToken,
    `/api/internal/logasai/jobs/${job.jobId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(
        normalizeCompletionPayload(outcome, config.workerId),
      ),
    },
  );

  console.log(`[worker] job completed: ${job.jobId}`);
}

async function runWorker(config) {
  await ensureDir(config.workspaceRoot);

  for (;;) {
    try {
      const claimed = await apiJson(
        config.serverOrigin,
        config.workerToken,
        "/api/internal/logasai/jobs/claim",
        {
          method: "POST",
          body: JSON.stringify({
            workerId: config.workerId,
          }),
        },
      );

      if (!claimed.item) {
        console.log("[worker] no queued jobs");
        if (config.once) {
          return;
        }
        await sleep(config.pollSeconds * 1000);
        continue;
      }

      await processClaimedJob(config, claimed.item);

      if (config.once) {
        return;
      }
    } catch (error) {
      console.error(`[worker] ${error.message}`);

      if (config.once) {
        process.exitCode = 1;
        return;
      }

      await sleep(config.pollSeconds * 1000);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const serverOrigin = String(args["server-origin"] || "").trim();
  const workerToken = String(
    args["worker-token"] || process.env.LOGASAI_WORKER_TOKEN || "",
  ).trim();

  if (!serverOrigin) {
    throw new Error("Missing --server-origin");
  }

  if (!workerToken) {
    throw new Error("Missing --worker-token or LOGASAI_WORKER_TOKEN");
  }

  const config = {
    serverOrigin: serverOrigin.replace(/\/+$/, ""),
    workerToken,
    workerId: String(args["worker-id"] || os.hostname()).trim(),
    pollSeconds: Number(args["poll-seconds"] || 15),
    workspaceRoot: path.resolve(
      String(args["workspace-root"] || resolveDefaultWorkspaceRoot()),
    ),
    logasaiPath: path.resolve(
      String(args["logasai-path"] || resolveDefaultLogasAIPath()),
    ),
    prepareSession: !("prepare-session" in args) || Boolean(args["prepare-session"]),
    autoOpen: Boolean(args["auto-open"]),
    autoDrive: !("auto-drive" in args) || Boolean(args["auto-drive"]),
    analysisMethod: Number(args["analysis-method"] || 2),
    bannerX: Number(args["banner-x"] || 0.075),
    bannerY: Number(args["banner-y"] || 0.085),
    playX: Number(args["play-x"] || 0.082),
    playY: Number(args["play-y"] || 0.028),
    methodMenuOffsetX: Number(args["method-menu-offset-x"] || 0.05),
    method1OffsetY: Number(args["method1-offset-y"] || 0.03),
    method2OffsetY: Number(args["method2-offset-y"] || 0.055),
    importDialogDelayMs: Number(args["import-dialog-delay-ms"] || 450),
    afterImportDelayMs: Number(args["after-import-delay-ms"] || 900),
    menuOpenDelayMs: Number(args["menu-open-delay-ms"] || 350),
    afterMethodDelayMs: Number(args["after-method-delay-ms"] || 350),
    afterPlayDelayMs: Number(args["after-play-delay-ms"] || 500),
    dialogTimeoutMs: Number(args["dialog-timeout-ms"] || 5000),
    dialogPollMs: Number(args["dialog-poll-ms"] || 150),
    requireAnalysisComplete:
      !("require-analysis-complete" in args) || Boolean(args["require-analysis-complete"]),
    analysisTimeoutSeconds: Number(args["analysis-timeout-seconds"] || 7200),
    pythonPath: String(args["python-path"] || "python"),
    powershellPath: String(args["powershell-path"] || "powershell"),
    windowLeft: args["window-left"],
    windowTop: args["window-top"],
    windowWidth: args["window-width"],
    windowHeight: args["window-height"],
    windowState: args["window-state"],
    once: Boolean(args.once),
  };

  console.log(`[worker] server: ${config.serverOrigin}`);
  console.log(`[worker] workerId: ${config.workerId}`);
  console.log(`[worker] workspace: ${config.workspaceRoot}`);

  await runWorker(config);
}

main().catch((error) => {
  console.error(`[worker] fatal: ${error.message}`);
  process.exit(1);
});
