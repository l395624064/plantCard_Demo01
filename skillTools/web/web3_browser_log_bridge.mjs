import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    input: 'skillTools/web/runtime/browser_console_logs.json',
    output: 'skillTools/web/runtime/browser_console_bridge.jsonl',
    state: 'skillTools/web/runtime/web3_state.json',
    dedupe: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if (current === '--input' && next) {
      args.input = next;
      i += 1;
    } else if (current === '--output' && next) {
      args.output = next;
      i += 1;
    } else if (current === '--state' && next) {
      args.state = next;
      i += 1;
    } else if (current === '--dedupe' && next) {
      args.dedupe = next === 'true';
      i += 1;
    }
  }
  return args;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (text === '') {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function toArray(raw) {
  return Array.isArray(raw) ? raw : [];
}

function stableKey(entry) {
  return JSON.stringify(entry);
}

function toBridgeRecord(entry, ts, seq) {
  return {
    traceVersion: 'v1',
    runtime: 'web',
    sessionId: `web_bridge_${new Date(ts).toISOString().slice(0, 10)}`,
    feature: 'web_toolchain',
    unitId: 'WEB-3',
    stepId: 'WEB-3_bridge_console_to_jsonl',
    seq,
    prevSeq: null,
    phase: 'state',
    eventKind: 'system',
    actor: 'system',
    source: 'skillTools.web3_browser_log_bridge',
    action: 'bridge_console_log',
    effect: 'persist_to_jsonl',
    status: 'ok',
    ts,
    payload: { raw: entry },
  };
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);
  const statePath = path.resolve(args.state);

  ensureParent(outputPath);
  ensureParent(statePath);

  const state = readJsonFile(statePath, { seen: [] });
  const seen = new Set(Array.isArray(state.seen) ? state.seen : []);
  const entries = toArray(readJsonFile(inputPath, []));

  const now = Date.now();
  let seq = now;
  let appended = 0;
  const lines = [];
  for (const entry of entries) {
    const key = stableKey(entry);
    if (args.dedupe && seen.has(key)) {
      continue;
    }
    if (args.dedupe) {
      seen.add(key);
    }
    seq += 1;
    lines.push(`${JSON.stringify(toBridgeRecord(entry, now, seq))}\n`);
    appended += 1;
  }

  if (lines.length > 0) {
    fs.appendFileSync(outputPath, lines.join(''), 'utf8');
  }
  if (args.dedupe) {
    fs.writeFileSync(
      statePath,
      JSON.stringify({ seen: Array.from(seen), updatedAt: now }, null, 2),
      'utf8',
    );
  }
  process.stdout.write(
    `[WEB-3] dedupe=${args.dedupe} input=${entries.length} appended=${appended} output="${outputPath}"\n`,
  );
}

main();
