import fs from 'node:fs';
import path from 'node:path';
import { encouragePath, CURSOR_JSON, CURSOR_MD, CONFIG_JSON } from './paths.js';
import { ensureDir, fileExists, readJson, writeJson } from './fsutil.js';

export const STAGE_STATUSES = [
  'not_started',
  'in_progress',
  'validation_pending',
  'complete',
  'blocked',
  'pushed',
  'review_pending',
  'release_candidate',
  'released'
];

export function defaultCursor(plan) {
  return {
    plan,
    current_stage: inferFirstStage(plan),
    stage_status: 'in_progress',
    next_atomic_task: inferNextTask(plan),
    last_completed_evidence: [],
    last_validation: [],
    known_blockers: [],
    scope_guard: [
      'Do not expand product scope.',
      'Do not skip validation before claiming done.',
      'Do not merge or release without explicit user approval.',
      'Do not use abuse, humiliation, violent metaphors, or keyboard injection.'
    ],
    updated_at: new Date().toISOString()
  };
}

export function inferFirstStage(plan) {
  if (!plan || !fileExists(plan)) return 'R0';
  const text = fs.readFileSync(plan, 'utf8');
  const phase = text.match(/(?:^|\n)#+\s*(?:Phase\s+)?([A-Z]?\d+|R\d+)\b/i);
  if (phase) return phase[1].toUpperCase();
  const current = text.match(/Current stage:\s*([^\n]+)/i);
  if (current) return current[1].trim();
  return 'R0';
}

export function inferNextTask(plan) {
  if (!plan || !fileExists(plan)) return 'Define the first atomic task.';
  const text = fs.readFileSync(plan, 'utf8');
  const explicit = text.match(/Next atomic task:\s*\n?\s*-?\s*([^\n]+)/i);
  if (explicit) return explicit[1].trim();
  const bullet = text.match(/(?:^|\n)\s*- \[ \]\s*([^\n]+)/);
  if (bullet) return bullet[1].trim();
  const firstReq = text.match(/(?:^|\n)\s*-\s+([^\n]{8,160})/);
  if (firstReq) return firstReq[1].trim();
  return 'Continue the first unfinished deliverable in the plan.';
}

export function initCursor({ plan, cwd = process.cwd(), force = false }) {
  if (!plan) throw new Error('Missing required --plan <path>.');
  const absPlan = path.resolve(cwd, plan);
  if (!fileExists(absPlan)) {
    throw new Error(`Plan file not found: ${plan}`);
  }
  const dir = path.join(cwd, '.encourage');
  ensureDir(dir);
  const cursorFile = encouragePath(CURSOR_JSON, cwd);
  if (fileExists(cursorFile) && !force) {
    throw new Error('.encourage/cursor.json already exists. Pass --force to overwrite.');
  }
  const relativePlan = path.relative(cwd, absPlan).replaceAll('\\', '/');
  const cursor = { ...defaultCursor(absPlan), plan: relativePlan };
  writeCursor(cursor, cwd);
  writeJson(encouragePath(CONFIG_JSON, cwd), {
    schema_version: 1,
    created_at: new Date().toISOString(),
    plan: relativePlan,
    release_policy: 'manual-confirm'
  });
  return cursor;
}

export function readCursor(cwd = process.cwd()) {
  const jsonFile = encouragePath(CURSOR_JSON, cwd);
  if (fileExists(jsonFile)) return readJson(jsonFile);
  const mdFile = encouragePath(CURSOR_MD, cwd);
  if (!fileExists(mdFile)) throw new Error('No EncourageLoop cursor found. Run `encourage init --plan <path>`.');
  const text = fs.readFileSync(mdFile, 'utf8');
  return parseCursorMarkdown(text);
}

export function writeCursor(cursor, cwd = process.cwd()) {
  const updated = { ...cursor, updated_at: new Date().toISOString() };
  writeJson(encouragePath(CURSOR_JSON, cwd), updated);
  fs.writeFileSync(encouragePath(CURSOR_MD, cwd), renderCursorMarkdown(updated), 'utf8');
  return updated;
}

export function renderCursorMarkdown(cursor) {
  const evidence = recentList(cursor.last_completed_evidence, renderListItem);
  const validation = recentList(cursor.last_validation || [], renderValidationItem);
  const blockers = list(cursor.known_blockers);
  const guard = list(cursor.scope_guard);
  return `# EncourageLoop Cursor

Plan: ${cursor.plan}
Current stage: ${cursor.current_stage}
Stage status: ${cursor.stage_status}

Next atomic task:
${cursor.next_atomic_task || 'Define the next atomic task.'}

Last completed evidence:
${evidence}

Last validation:
${validation}

Known blockers:
${blockers}

Scope guard:
${guard}

Updated at: ${cursor.updated_at || new Date().toISOString()}
`;
}

function list(items = []) {
  if (!items || items.length === 0) return '- None yet.';
  return items.map((item) => `- ${item}`).join('\n');
}

function recentList(items = [], renderItem, limit = 8) {
  if (!items || items.length === 0) return '- None yet.';
  const visible = items.slice(-limit);
  const prefix = items.length > visible.length
    ? [`- Showing latest ${visible.length} of ${items.length} entries; older entries remain in .encourage/ history.`]
    : [];
  return [
    ...prefix,
    ...visible.map((item) => `- ${renderItem(item)}`)
  ].join('\n');
}

function renderListItem(item) {
  return item;
}

function renderValidationItem(item) {
  if (typeof item === 'string') return item;
  return `${item.command}: ${item.result}${item.notes ? ` (${item.notes})` : ''}`;
}

function parseCursorMarkdown(text) {
  const get = (label) => {
    const re = new RegExp(`${escapeRegExp(label)}:\\s*([^\\n]+)`, 'i');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };
  const block = (label) => {
    const re = new RegExp(`${escapeRegExp(label)}:\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z][^\\n:]+:|$)`, 'i');
    const m = text.match(re);
    if (!m) return '';
    return m[1].trim();
  };
  const listBlock = (label) => block(label)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^-\s*/, '').trim())
    .filter((line) => line && line !== 'None yet.' && line !== 'None.' && !isRecentListSummary(line));
  const validation = listBlock('Last validation').map(parseValidationLine);
  return {
    plan: get('Plan'),
    current_stage: get('Current stage') || 'R0',
    stage_status: get('Stage status') || 'in_progress',
    next_atomic_task: listBlock('Next atomic task').join('\n') || block('Next atomic task') || 'Continue the next unfinished task.',
    last_completed_evidence: listBlock('Last completed evidence'),
    last_validation: validation,
    known_blockers: listBlock('Known blockers'),
    scope_guard: listBlock('Scope guard'),
    updated_at: get('Updated at')
  };
}

function isRecentListSummary(line) {
  return /^Showing latest \d+ of \d+ entries; older entries remain in \.encourage\/ history\.$/.test(line);
}

function parseValidationLine(line) {
  const index = line.indexOf(':');
  if (index === -1) return { command: line, result: 'recorded' };
  return {
    command: line.slice(0, index).trim(),
    result: line.slice(index + 1).trim()
  };
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function assertValidStatus(status) {
  if (!STAGE_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Expected one of: ${STAGE_STATUSES.join(', ')}`);
  }
}
