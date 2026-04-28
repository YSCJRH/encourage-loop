import fs from 'node:fs';
import { readCursor } from './cursor.js';
import { getStatus } from './status.js';
import { encouragePath, HANDOFF_MD } from './paths.js';

export function handoff(cwd = process.cwd()) {
  const cursor = readCursor(cwd);
  const status = getStatus(cwd);
  const text = renderHandoff(cursor, status);
  fs.writeFileSync(encouragePath(HANDOFF_MD, cwd), text, 'utf8');
  return text;
}

export function renderHandoff(cursor, status) {
  const evidence = renderRecentList(cursor.last_completed_evidence || [], (e) => e, '- None yet.');
  const validation = renderRecentList(cursor.last_validation || [], (v) => typeof v === 'string' ? v : `${v.command}: ${v.result}${v.notes ? ` (${v.notes})` : ''}`, '- None yet.');
  const blockers = (cursor.known_blockers || []).length ? cursor.known_blockers.map((b) => `- ${b}`).join('\n') : '- None.';
  const warnings = status.warnings.length ? status.warnings.map((w) => `- ${w.level}: ${w.message}`).join('\n') : '- None.';

  return `# EncourageLoop Handoff

Continue this task under EncourageLoop supervision.

## Current plan

${cursor.plan}

## Current stage

${cursor.current_stage}

## Current status

${cursor.stage_status}

## Completed evidence

${evidence}

## Last validation

${validation}

## Known blockers

${blockers}

## Current warnings

${warnings}

## Next atomic task

${cursor.next_atomic_task || 'Define the next atomic task.'}

## Do not

- Re-plan the whole project unless the cursor is inconsistent or complete.
- Jump to another phase without updating the cursor.
- Add unrelated product capabilities.
- Claim done without validation evidence.
- Merge or release without explicit user approval.

## Suggested Codex prompt

\`\`\`text
$encourage-loop Continue from .encourage/cursor.md. Work only on the next atomic task, validate, checkpoint, and report evidence.
\`\`\`
`;
}

function renderRecentList(items, renderItem, empty, limit = 8) {
  if (!items.length) return empty;
  const visible = items.slice(-limit);
  const lines = [];
  if (items.length > visible.length) {
    lines.push(`- Showing latest ${visible.length} of ${items.length} entries; older entries remain in .encourage history.`);
  }
  for (const item of visible) lines.push(`- ${renderItem(item)}`);
  return lines.join('\n');
}
