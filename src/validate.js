import path from 'node:path';
import { readCursor } from './cursor.js';
import { gitStatus } from './git.js';
import { fileExists, readJsonl } from './fsutil.js';
import { encouragePath, STATE_JSONL } from './paths.js';
import { hasDangerousCommandEvent, riskLevel } from './rules.js';

export function validate(cwd = process.cwd()) {
  const warnings = [];
  let cursor = null;

  try {
    cursor = readCursor(cwd);
  } catch (error) {
    warnings.push({ level: 'RED', message: error.message });
    return result(warnings, null);
  }

  if (!cursor.plan) warnings.push({ level: 'RED', message: 'Cursor does not reference a plan.' });
  else if (!fileExists(path.resolve(cwd, cursor.plan))) warnings.push({ level: 'RED', message: `Plan file not found: ${cursor.plan}` });
  if (!cursor.current_stage) warnings.push({ level: 'ORANGE', message: 'Current stage is missing.' });
  if (!cursor.next_atomic_task) warnings.push({ level: 'ORANGE', message: 'Next atomic task is missing.' });
  if (!cursor.last_validation || cursor.last_validation.length === 0) {
    warnings.push({ level: 'YELLOW', message: 'No validation recorded yet.' });
  }

  const terminalStatuses = new Set(['complete', 'pushed', 'review_pending', 'release_candidate', 'released']);
  if (terminalStatuses.has(cursor.stage_status) && (!cursor.last_validation || cursor.last_validation.length === 0)) {
    warnings.push({ level: 'ORANGE', message: `Stage is marked ${cursor.stage_status} but no validation evidence is recorded.` });
  }

  const git = gitStatus(cwd);
  const events = readJsonl(encouragePath(STATE_JSONL, cwd));
  if (git.dirty_count > 0 && events.length === 0) {
    warnings.push({ level: 'YELLOW', message: 'Working tree has changes but no checkpoint event exists yet.' });
  }

  if (events.some((event) => hasDangerousCommandEvent(event))) {
    warnings.push({ level: 'RED', message: 'State history contains a dangerous command or release/merge intent.' });
  }

  return result(warnings, cursor);
}

function result(warnings, cursor) {
  const level = riskLevel(warnings);
  return {
    ok: level === 'GREEN' || level === 'YELLOW',
    level,
    warnings,
    cursor
  };
}

export function renderValidation(validation) {
  const lines = [];
  if (validation.ok) {
    lines.push(`${validation.level}: validation passed${validation.level === 'YELLOW' ? ' with warnings' : ''}`);
  } else {
    lines.push(`${validation.level}: validation failed`);
  }
  if (validation.warnings.length === 0) {
    lines.push('- No issues detected.');
  } else {
    for (const warning of validation.warnings) lines.push(`- ${warning.level}: ${warning.message}`);
  }
  if (!validation.ok) {
    lines.push('');
    lines.push('Do not claim this task or stage is done yet. Fix the missing evidence or report the blocker.');
  }
  return `${lines.join('\n')}\n`;
}
