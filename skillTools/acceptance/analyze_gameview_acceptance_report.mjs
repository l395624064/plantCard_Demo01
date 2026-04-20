import fs from 'node:fs';
import path from 'node:path';

const statePath = path.resolve('skillTools/acceptance/gameview_acceptance_state.json');
const outputPath = path.resolve('skillTools/acceptance/GAMEVIEW_ACCEPTANCE_REPORT.md');

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

const state = readJson(statePath, { meta: { updatedAt: 0 }, items: [] });
const mismatchItems = state.items.filter((item) => item.mismatch);

const lines = [];
lines.push('# GameView Acceptance Report');
lines.push('');
lines.push(`- generatedAt: ${new Date().toISOString()}`);
lines.push(`- stateUpdatedAt: ${new Date(state.meta.updatedAt || 0).toISOString()}`);
lines.push(`- total: ${state.items.length}`);
lines.push(`- mismatch: ${mismatchItems.length}`);
lines.push('');
lines.push('## Conflict Analysis');

if (mismatchItems.length === 0) {
  lines.push('- No mismatch found between userAccepted and aiAccepted.');
} else {
  for (const item of mismatchItems) {
    lines.push(
      `- ${item.unitId}: userAccepted=${item.userAccepted}, aiAccepted=${item.aiAccepted}, evidence=${item.evidenceRef || 'none'}`,
    );
    lines.push(
      `  - locate: ${item.sourceFile} (search unitId="${item.unitId}" or stepId="${item.stepId}")`,
    );
    lines.push('  - action: verify corresponding tmpTrace point and runtime interaction path.');
  }
}
lines.push('');
lines.push('## Suggested Next Step');
lines.push('- If aiAccepted=true and userAccepted=false: replay UI path and verify expected visual behavior.');
lines.push('- If aiAccepted=false and userAccepted=true: check tmpTrace call is triggered and bridge captures logs.');
lines.push('- After fixes, rerun `run_gameview_acceptance_once.bat` to refresh board and report.');
lines.push('');

fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
process.stdout.write(`[GAMEVIEW_ACCEPTANCE] report generated -> ${outputPath}\n`);
