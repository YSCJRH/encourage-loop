import { getStatus } from './status.js';

export function nudge(cwd = process.cwd()) {
  const status = getStatus(cwd);
  const issues = status.warnings.map((w) => w.message);
  const stage = status.current_stage || 'the current stage';
  const next = status.next_atomic_task || 'define the next atomic task';

  if (issues.length === 0) {
    return `You are in ${stage}. Continue the next atomic task: ${next}. Keep the scope tight, validate the result, update the cursor, and stop with evidence.\n`;
  }

  return `You are still in ${stage}. ${issues[0]} Please re-align with the cursor, work only on the next atomic task (${next}), record evidence, run validation if applicable, and update the cursor before claiming completion.\n`;
}
