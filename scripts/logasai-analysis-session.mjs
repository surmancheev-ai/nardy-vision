import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function resolveDefaultLogasAIPath() {
  return path.join(process.cwd(), "LogasAI Analysis", "LogasAIA.exe");
}

export function resolveLogasAIIniPath() {
  const roaming = process.env.APPDATA;

  if (!roaming) {
    throw new Error("APPDATA is not available on this Windows machine.");
  }

  return path.join(roaming, "LogasAIA", "LogasAIA.INI");
}

function normalizeIniLine(key, value) {
  return `${key} = ${value}`;
}

export async function updateIniFile(iniPath, updates) {
  const existingText = fsSync.existsSync(iniPath)
    ? await fs.readFile(iniPath, "utf8")
    : "";

  const lines = existingText ? existingText.split(/\r?\n/) : [];
  const consumedKeys = new Set();
  const nextLines = lines.map((line) => {
    const match = /^([^=]+?)\s*=\s*(.*)$/.exec(line);

    if (!match) {
      return line;
    }

    const key = match[1].trim();

    if (!(key in updates)) {
      return line;
    }

    consumedKeys.add(key);
    return normalizeIniLine(key, updates[key]);
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!consumedKeys.has(key)) {
      nextLines.push(normalizeIniLine(key, value));
    }
  }

  await fs.mkdir(path.dirname(iniPath), { recursive: true });
  await fs.writeFile(iniPath, nextLines.join(os.EOL), "utf8");
}

export async function prepareAnalysisSession({
  matFilePath,
  lmaFilePath,
  iniPath = resolveLogasAIIniPath(),
  windowLeft,
  windowTop,
  windowWidth,
  windowHeight,
  windowState,
}) {
  if (!matFilePath) {
    throw new Error("matFilePath is required.");
  }

  if (!lmaFilePath) {
    throw new Error("lmaFilePath is required.");
  }

  const resolvedMatPath = path.resolve(matFilePath);
  const resolvedLmaPath = path.resolve(lmaFilePath);

  if (!fsSync.existsSync(resolvedMatPath)) {
    throw new Error(`MAT file was not found: ${resolvedMatPath}`);
  }

  await fs.mkdir(path.dirname(resolvedLmaPath), { recursive: true });

  const updates = {
    OpenImport: resolvedMatPath,
    LastFile: resolvedLmaPath,
  };

  if (windowLeft !== undefined) {
    updates.WindowLeft = String(windowLeft);
  }

  if (windowTop !== undefined) {
    updates.WindowTop = String(windowTop);
  }

  if (windowWidth !== undefined) {
    updates.WindowWidth = String(windowWidth);
  }

  if (windowHeight !== undefined) {
    updates.WindowHeight = String(windowHeight);
  }

  if (windowState !== undefined) {
    updates.WindowState = String(windowState);
  }

  await updateIniFile(iniPath, updates);

  return {
    iniPath,
    matFilePath: resolvedMatPath,
    lmaFilePath: resolvedLmaPath,
    windowLeft,
    windowTop,
    windowWidth,
    windowHeight,
    windowState,
  };
}

export function launchLogasAI(logasaiPath) {
  const resolvedPath = path.resolve(logasaiPath);

  if (!fsSync.existsSync(resolvedPath)) {
    throw new Error(`LogasAI executable was not found: ${resolvedPath}`);
  }

  const child = spawn(resolvedPath, [], {
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });

  child.unref();

  return resolvedPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const matFilePath = String(args["mat-file"] || "").trim();
  const lmaFilePath = String(args["lma-file"] || "").trim();

  if (!matFilePath) {
    throw new Error("Missing --mat-file");
  }

  if (!lmaFilePath) {
    throw new Error("Missing --lma-file");
  }

  const session = await prepareAnalysisSession({
    matFilePath,
    lmaFilePath,
    iniPath: String(args["ini-path"] || resolveLogasAIIniPath()).trim(),
    windowLeft: args["window-left"],
    windowTop: args["window-top"],
    windowWidth: args["window-width"],
    windowHeight: args["window-height"],
    windowState: args["window-state"],
  });

  if (args.launch) {
    session.logasaiPath = launchLogasAI(
      String(args["logasai-path"] || resolveDefaultLogasAIPath()).trim(),
    );
  }

  process.stdout.write(`${JSON.stringify(session, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[logasai-session] ${error.message}`);
    process.exit(1);
  });
}
