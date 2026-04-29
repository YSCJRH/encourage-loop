import path from 'node:path';
import { readCursor } from './cursor.js';
import { gitStatus } from './git.js';
import { encouragePath, STATE_JSONL } from './paths.js';
import { fileExists, readJsonl } from './fsutil.js';

export function getStatus(cwd = process.cwd()) {
  const cursor = readCursor(cwd);
  const git = gitStatus(cwd);
  const stateFile = encouragePath(STATE_JSONL, cwd);
  const events = readJsonl(stateFile);
  const warnings = [];
  const planPath = path.resolve(cwd, cursor.plan || '');

  if (!cursor.plan) warnings.push({ level: 'RED', message: 'Cursor does not reference a plan.' });
  else if (!fileExists(planPath)) warnings.push({ level: 'RED', message: `Plan file not found: ${cursor.plan}` });
  if (!cursor.current_stage) warnings.push({ level: 'ORANGE', message: 'Current stage is missing.' });
  if (!cursor.next_atomic_task) warnings.push({ level: 'ORANGE', message: 'Next atomic task is missing.' });
  if (!cursor.last_validation || cursor.last_validation.length === 0) warnings.push({ level: 'YELLOW', message: 'No validation recorded yet.' });
  if (git.dirty_count > 0 && events.length === 0) warnings.push({ level: 'YELLOW', message: 'Working tree has changes but no checkpoint events recorded.' });

  return {
    plan: cursor.plan,
    current_stage: cursor.current_stage,
    stage_status: cursor.stage_status,
    next_atomic_task: cursor.next_atomic_task,
    last_completed_evidence: cursor.last_completed_evidence || [],
    last_validation: cursor.last_validation || [],
    known_blockers: cursor.known_blockers || [],
    updated_at: cursor.updated_at,
    git,
    event_count: events.length,
    warnings
  };
}

export function renderStatus(status) {
  const lines = [
    'EncourageLoop status',
    '',
    `Plan: ${status.plan || '(missing)'}`,
    `Stage: ${status.current_stage || '(missing)'}`,
    `Status: ${status.stage_status || '(missing)'}`,
    `Next task: ${status.next_atomic_task || '(missing)'}`,
    `Git: ${status.git.available ? `${status.git.branch}@${status.git.head}, dirty files: ${status.git.dirty_count}` : 'not available'}`,
    'Last validation:',
    ...renderRecentList(status.last_validation || [], renderValidationEntry, 'none'),
    'Warnings:'
  ];
  if (status.warnings.length === 0) lines.push('- none');
  else for (const warning of status.warnings) lines.push(`- ${warning.level}: ${warning.message}`);
  return `${lines.join('\n')}\n`;
}

function renderRecentList(items, renderItem, empty, limit = 8) {
  if (!items || items.length === 0) return [`- ${empty}`];
  const visible = items.slice(-limit);
  const prefix = items.length > visible.length
    ? [`- Showing latest ${visible.length} of ${items.length} entries; older entries remain in .encourage/ history.`]
    : [];
  return [
    ...prefix,
    ...visible.map((item) => `- ${renderItem(item)}`)
  ];
}

function renderValidationEntry(validation) {
  if (typeof validation === 'string') return validation;
  const note = validation.notes ? ` (${validation.notes})` : '';
  return `${validation.command}: ${validation.result}${note}`;
}
