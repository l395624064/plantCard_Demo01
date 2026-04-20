import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    requirements: 'skillTools/acceptance/requirements_input.json',
    state: 'skillTools/acceptance/gameview_acceptance_state.json',
    board: 'skillTools/acceptance/GAMEVIEW_ACCEPTANCE_BOARD.md',
    bridge: 'skillTools/web/runtime/browser_console_bridge.jsonl',
    intervalMs: 1000,
    once: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--requirements' && next) {
      args.requirements = next;
      i += 1;
    } else if (key === '--state' && next) {
      args.state = next;
      i += 1;
    } else if (key === '--board' && next) {
      args.board = next;
      i += 1;
    } else if (key === '--bridge' && next) {
      args.bridge = next;
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
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) {
    return [];
  }
  const list = [];
  for (const line of text.split('\n')) {
    try {
      list.push(JSON.parse(line));
    } catch {
      // ignore malformed
    }
  }
  return list;
}

function readUserAcceptedFromBoard(boardPath) {
  if (!fs.existsSync(boardPath)) {
    return new Map();
  }
  const text = fs.readFileSync(boardPath, 'utf8').replaceAll('\r\n', '\n');
  const map = new Map();
  const marker = '## 用户验收勾选区';
  const start = text.indexOf(marker);
  if (start < 0) {
    return map;
  }
  const section = text.slice(start);
  for (const line of section.split('\n')) {
    const row = line.trim();
    if (!row.startsWith('- [')) {
      continue;
    }
    const taskMatch = row.match(/^- \[(?<flag>[xX ])\]\s+(?<itemId>REQ-[A-Za-z0-9_:-]+)/);
    if (!taskMatch?.groups) {
      continue;
    }
    map.set(taskMatch.groups.itemId, taskMatch.groups.flag.toLowerCase() === 'x');
  }
  return map;
}

function initializeItems(requirements, prevItems) {
  const prevMap = new Map(prevItems.map((item) => [item.itemId, item]));
  return requirements.items.map((req) => {
    const prev = prevMap.get(req.itemId);
    return {
      itemId: req.itemId,
      requirement: req.requirement,
      requirementZh: req.requirementZh ?? req.requirement,
      requirementEn: req.requirementEn ?? '',
      unitId: req.unitId,
      stepId: req.stepId ?? '',
      aiLogKeywords: Array.isArray(req.aiLogKeywords) ? req.aiLogKeywords : [req.unitId, req.stepId ?? ''],
      sourceFile: req.sourceFile ?? '',
      userAccepted: prev?.userAccepted ?? false,
      aiAccepted: false,
      mismatch: false,
      evidenceRef: '',
      note: '',
    };
  });
}

function extractText(rec) {
  const payload = rec?.payload ?? {};
  const raw = payload.raw ?? rec;
  return JSON.stringify(raw);
}

function updateItem(item, bridgePath, bridgeRecords) {
  const matched = bridgeRecords.filter((rec) => {
    const text = extractText(rec);
    return item.aiLogKeywords.some((keyword) => keyword && text.includes(keyword));
  });
  const aiAccepted = matched.length > 0;
  const mismatch = item.userAccepted !== aiAccepted;
  return {
    ...item,
    aiAccepted,
    mismatch,
    evidenceRef: aiAccepted ? `${bridgePath}#${item.unitId}=${matched.length}` : '',
    note: aiAccepted ? 'ai-evidence-found' : 'waiting-trace-evidence',
  };
}

function toMarkdown(state, bridgeCount) {
  const lines = [];
  lines.push('# 验收看板 / Acceptance Board');
  lines.push('');
  lines.push(`- UpdatedAt: ${new Date(state.meta.updatedAt).toISOString()}`);
  lines.push(`- BridgeRecords: ${bridgeCount}`);
  lines.push(`- RequirementSource: ${state.meta.sourceRequirements}`);
  lines.push('');
  lines.push('> 说明：此看板以“需求阶段已确认的需求清单”为唯一来源，不反向依赖 tmpTrace 文件。');
  lines.push('> 可选插件：Markdown Editor（可提升表格编辑体验，非必须）。');
  lines.push('> 常用快捷键：打开预览 `Ctrl+Shift+V`，侧边预览 `Ctrl+K V`。');
  lines.push('> 编辑/预览切换：在编辑器标签与预览页之间切换。');
  lines.push('');
  lines.push('## 用户验收勾选区');
  lines.push('- 使用方式：直接点击复选框，`[x]`=用户通过，`[ ]`=待验收。');
  for (const it of state.items) {
    const check = it.userAccepted ? 'x' : ' ';
    lines.push(`- [${check}] ${it.itemId} ${it.requirementZh}`);
  }
  lines.push('');
  lines.push('## 双轨状态明细');
  lines.push('| itemId | 需求项(中文) | requirement(EN) | unitId | userState | aiState | conflict | evidenceRef | note |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const it of state.items) {
    const userState = it.userAccepted ? '✅' : '⏳';
    const aiState = it.aiAccepted ? '✅' : '⏳';
    const conflict = it.userAccepted || it.aiAccepted ? (it.mismatch ? '❌' : '✅') : '⏳';
    lines.push(
      `| ${it.itemId} | ${it.requirementZh.replaceAll('|', '\\|')} | ${it.requirementEn.replaceAll('|', '\\|')} | ${it.unitId} | ${userState} | ${aiState} | ${conflict} | ${it.evidenceRef.replaceAll('|', '\\|')} | ${it.note} |`,
    );
  }
  lines.push('');
  lines.push('## Summary');
  lines.push(`- total: ${state.items.length}`);
  lines.push(`- userAccepted: ${state.items.filter((i) => i.userAccepted).length}`);
  lines.push(`- aiAccepted: ${state.items.filter((i) => i.aiAccepted).length}`);
  lines.push(`- mismatch: ${state.items.filter((i) => i.mismatch).length}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function syncOnce(args) {
  const reqPath = path.resolve(args.requirements);
  const statePath = path.resolve(args.state);
  const boardPath = path.resolve(args.board);
  const bridgePath = path.resolve(args.bridge);
  ensureParent(statePath);
  ensureParent(boardPath);

  const requirements = readJson(reqPath, { items: [] });
  const prevState = readJson(statePath, { meta: { updatedAt: 0 }, items: [] });
  const bridgeRecords = readJsonl(bridgePath);
  const userAcceptedMap = readUserAcceptedFromBoard(boardPath);
  const baseItems = initializeItems(requirements, prevState.items ?? []);
  const nextItems = baseItems.map((it) => {
    const userAccepted = userAcceptedMap.has(it.itemId)
      ? Boolean(userAcceptedMap.get(it.itemId))
      : it.userAccepted;
    return updateItem({ ...it, userAccepted }, bridgePath, bridgeRecords);
  });

  const nextState = {
    meta: {
      ...(prevState.meta ?? {}),
      sourceRequirements: args.requirements,
      updatedAt: Date.now(),
    },
    items: nextItems,
  };
  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2), 'utf8');
  fs.writeFileSync(boardPath, toMarkdown(nextState, bridgeRecords.length), 'utf8');

  process.stdout.write(
    `[GAMEVIEW_ACCEPTANCE] synced items=${nextItems.length} mismatch=${nextItems.filter((i) => i.mismatch).length}\n`,
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
  process.stdout.write(`[GAMEVIEW_ACCEPTANCE] daemon start interval=${args.intervalMs}ms\n`);
  while (true) {
    syncOnce(args);
    await sleep(args.intervalMs);
  }
}

await main();
