import { readCursor, writeCursor, assertValidStatus } from './cursor.js';
import { appendJsonl } from './fsutil.js';
import { encouragePath, STATE_JSONL, VALIDATIONS_JSONL } from './paths.js';

export function checkpoint(options, cwd = process.cwd()) {
  const cursor = readCursor(cwd);
  const stage = options.stage || cursor.current_stage;
  const status = options.status || cursor.stage_status;
  assertValidStatus(status);
  const next = options.next || cursor.next_atomic_task;
  const evidence = [...(cursor.last_completed_evidence || [])];
  if (options.evidence) evidence.push(options.evidence);

  const validations = [...(cursor.last_validation || [])];
  for (const validationText of optionList(options.validation)) {
    const validation = parseValidation(validationText);
    validations.push(validation);
    appendJsonl(encouragePath(VALIDATIONS_JSONL, cwd), {
      type: 'validation',
      at: new Date().toISOString(),
      stage,
      ...validation
    });
  }

  const knownBlockers = [...(cursor.known_blockers || [])];
  if (options.blocker) knownBlockers.push(options.blocker);

  const updated = writeCursor({
    ...cursor,
    current_stage: stage,
    stage_status: status,
    next_atomic_task: next,
    last_completed_evidence: evidence,
    last_validation: validations,
    known_blockers: knownBlockers
  }, cwd);

  appendJsonl(encouragePath(STATE_JSONL, cwd), {
    type: 'checkpoint',
    at: new Date().toISOString(),
    stage,
    status,
    evidence: options.evidence || null,
    next,
    blocker: options.blocker || null
  });

  return updated;
}

function optionList(value) {
  if (value === undefined || value === null || value === false) return [];
  return Array.isArray(value) ? value : [value];
}

function parseValidation(text) {
  const parts = String(text).split(':');
  if (parts.length >= 2) {
    return { command: parts[0].trim(), result: parts.slice(1).join(':').trim() };
  }
  return { command: text, result: 'recorded' };
}
