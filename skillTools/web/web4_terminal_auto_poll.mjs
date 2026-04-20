import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    file: 'skillTools/web/runtime/browser_console_bridge.jsonl',
    intervalMs: 1000,
    durationMs: 0,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if (current === '--file' && next) {
      args.file = next;
      i += 1;
    } else if (current === '--intervalMs' && next) {
      args.intervalMs = Number(next);
      i += 1;
    } else if (current === '--durationMs' && next) {
      args.durationMs = Number(next);
      i += 1;
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs(process.argv);
  const filePath = path.resolve(args.file);
  const start = Date.now();
  let cursor = 0;

  const infinite = args.durationMs <= 0;
  process.stdout.write(
    `[WEB-4] polling "${filePath}" interval=${args.intervalMs}ms duration=${infinite ? 'infinite' : `${args.durationMs}ms`}\n`,
  );

  while (infinite || Date.now() - start < args.durationMs) {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > cursor) {
        const fd = fs.openSync(filePath, 'r');
        const chunkSize = stat.size - cursor;
        const buffer = Buffer.alloc(chunkSize);
        fs.readSync(fd, buffer, 0, chunkSize, cursor);
        fs.closeSync(fd);
        cursor = stat.size;

        const text = buffer.toString('utf8').trim();
        if (text !== '') {
          for (const line of text.split('\n')) {
            process.stdout.write(`[WEB-4][NEW] ${line}\n`);
          }
        }
      }
    }
    await sleep(args.intervalMs);
  }

  process.stdout.write('[WEB-4] polling finished\n');
}

await main();
