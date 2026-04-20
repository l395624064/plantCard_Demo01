import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    state: 'skillTools/acceptance/acceptance_state.json',
    board: 'skillTools/acceptance/ACCEPTANCE_BOARD.md',
    bridge: 'skillTools/web/runtime/browser_console_bridge.jsonl',
    consoleLog: 'skillTools/web/runtime/browser_console_logs.json',
    intervalMs: 1000,
    once: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--state' && next) {
      args.state = next;
      i += 1;
    } else if (key === '--board' && next) {
      args.board = next;
      i += 1;
    } else if (key === '--bridge' && next) {
      args.bridge = next;
      i += 1;
    } else if (key === '--consoleLog' && next) {
      args.consoleLog = next;
      i += 1;
    } else if (key === '--intervalMs' && next) {
      args.intervalMs = Number(next);
      i += 1;
    } else if (key === '--once') {
      args.once = true;
    }
  }
  return args;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (raw === '') {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readJsonlRecords(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (text === '') {
    return [];
  }
  const records = [];
  for (const line of text.split('\n')) {
    const row = line.trim();
    if (row === '') {
      continue;
    }
    try {
      records.push(JSON.parse(row));
    } catch {
      // ignore malformed row
    }
  }
  return records;
}

function readConsoleRecords(filePath) {
  const data = readJson(filePath, []);
  return Array.isArray(data) ? data : [];
}

function updateByUnit(item, bridgeRecords, consoleRecords, bridgePath, consolePath) {
  const unit = item.unitId;

  if (unit === 'WEB-1') {
    const ok = consoleRecords.length > 0;
    return {
      aiAccepted: ok,
      evidenceRef: ok ? `${consolePath}#items=${consoleRecords.length}` : '',
      note: ok ? 'console-log-read-ok' : 'waiting-console-log',
    };
  }

  if (unit === 'WEB-2') {
    const ok = bridgeRecords.length > 0;
    return {
      aiAccepted: ok,
      evidenceRef: ok ? `${bridgePath}#lines=${bridgeRecords.length}` : '',
      note: ok ? 'fallback-trace-available' : 'waiting-trace-lines',
    };
  }

  if (unit === 'WEB-3') {
    const matched = bridgeRecords.filter((r) => r.unitId === 'WEB-3');
    const ok = matched.length > 0;
    return {
      aiAccepted: ok,
      evidenceRef: ok ? `${bridgePath}#WEB-3=${matched.length}` : '',
      note: ok ? 'bridge-write-ok' : 'waiting-bridge-write',
    };
  }

  if (unit === 'WEB-4') {
    const matched = bridgeRecords.filter((r) => r.unitId === 'WEB-3');
    const ok = matched.length > 0;
    return {
      aiAccepted: ok,
      evidenceRef: ok ? `${bridgePath}#poll-visible=${matched.length}` : '',
      note: ok ? 'polling-evidence-visible' : 'waiting-polling-evidence',
    };
  }

  return {
    aiAccepted: false,
    evidenceRef: '',
    note: 'unsupported-unit',
  };
}

function toMarkdown(state, bridgeCount, consoleCount) {
  const lines = [];
  lines.push('# Acceptance Board');
  lines.push('');
  lines.push(`- UpdatedAt: ${new Date(state.meta.updatedAt).toISOString()}`);
  lines.push(`- BridgeRecords: ${bridgeCount}`);
  lines.push(`- ConsoleItems: ${consoleCount}`);
  lines.push('');
  lines.push('| itemId | requirement | unitId | userAccepted | aiAccepted | mismatch | evidenceRef | note |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of state.items) {
    lines.push(
      `| ${item.itemId} | ${item.requirement.replaceAll('|', '\\|')} | ${item.unitId} | ${item.userAccepted} | ${item.aiAccepted} | ${item.mismatch} | ${item.evidenceRef.replaceAll('|', '\\|')} | ${item.note.replaceAll('|', '\\|')} |`,
    );
  }
  lines.push('');
  lines.push('## Summary');
  const total = state.items.length;
  const userPass = state.items.filter((i) => i.userAccepted).length;
  const aiPass = state.items.filter((i) => i.aiAccepted).length;
  const mismatch = state.items.filter((i) => i.mismatch).length;
  lines.push(`- total: ${total}`);
  lines.push(`- userAccepted: ${userPass}`);
  lines.push(`- aiAccepted: ${aiPass}`);
  lines.push(`- mismatch: ${mismatch}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function syncOnce(args) {
  const statePath = path.resolve(args.state);
  const boardPath = path.resolve(args.board);
  const bridgePath = path.resolve(args.bridge);
  const consolePath = path.resolve(args.consoleLog);

  ensureParent(statePath);
  ensureParent(boardPath);

  const state = readJson(statePath, { meta: { boardVersion: 'v1', updatedAt: 0 }, items: [] });
  const bridgeRecords = readJsonlRecords(bridgePath);
  const consoleRecords = readConsoleRecords(consolePath);

  const nextItems = state.items.map((item) => {
    const ai = updateByUnit(item, bridgeRecords, consoleRecords, bridgePath, consolePath);
    const aiAccepted = ai.aiAccepted;
    const mismatch = item.userAccepted !== aiAccepted;
    return {
      ...item,
      aiAccepted,
      mismatch,
      evidenceRef: ai.evidenceRef,
      note: ai.note,
    };
  });

  const nextState = {
    ...state,
    meta: {
      ...(state.meta ?? {}),
      updatedAt: Date.now(),
    },
    items: nextItems,
  };

  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2), 'utf8');
  fs.writeFileSync(
    boardPath,
    toMarkdown(nextState, bridgeRecords.length, consoleRecords.length),
    'utf8',
  );

  const mismatchCount = nextItems.filter((i) => i.mismatch).length;
  process.stdout.write(
    `[ACCEPTANCE] synced items=${nextItems.length} mismatch=${mismatchCount} board="${boardPath}"\n`,
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.once) {
    syncOnce(args);
    return;
  }

  process.stdout.write(
    `[ACCEPTANCE] daemon start interval=${args.intervalMs}ms state="${path.resolve(args.state)}"\n`,
  );
  while (true) {
    syncOnce(args);
    await sleep(args.intervalMs);
  }
}

await main();
