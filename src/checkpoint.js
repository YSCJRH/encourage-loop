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
  const newValidations = optionStringList('validation', options.validation).map(parseValidation);
  validations.push(...newValidations);

  const knownBlockers = unique(cursor.known_blockers || []);
  const blockers = optionStringList('blocker', options.blocker);
  for (const blocker of blockers) addUnique(knownBlockers, blocker);
  const resolvedBlockers = unique(optionStringList('resolve-blocker', options.resolve_blocker));
  const unknownBlocker = resolvedBlockers.find((blocker) => !knownBlockers.includes(blocker));
  if (unknownBlocker) throw new Error(`Cannot resolve unknown blocker: ${unknownBlocker}`);
  for (const blocker of resolvedBlockers) {
    const index = knownBlockers.indexOf(blocker);
    knownBlockers.splice(index, 1);
  }

  const updated = writeCursor({
    ...cursor,
    current_stage: stage,
    stage_status: status,
    next_atomic_task: next,
    last_completed_evidence: evidence,
    last_validation: validations,
    known_blockers: knownBlockers
  }, cwd);

  for (const validation of newValidations) {
    appendJsonl(encouragePath(VALIDATIONS_JSONL, cwd), {
      type: 'validation',
      at: new Date().toISOString(),
      stage,
      ...validation
    });
  }

  appendJsonl(encouragePath(STATE_JSONL, cwd), {
    type: 'checkpoint',
    at: new Date().toISOString(),
    stage,
    status,
    evidence: options.evidence || null,
    next,
    blocker: blockers.join('\n') || null,
    resolved_blockers: resolvedBlockers
  });

  return updated;
}

function addUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

function unique(list) {
  const result = [];
  for (const item of list) addUnique(result, item);
  return result;
}

function optionList(value) {
  if (value === undefined || value === null || value === false) return [];
  return Array.isArray(value) ? value : [value];
}

function optionStringList(name, value) {
  return optionList(value).map((item) => {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new Error(`--${name} requires a non-empty string value.`);
    }
    return item;
  });
}

function parseValidation(text) {
  const parts = String(text).split(':');
  if (parts.length >= 2) {
    return { command: parts[0].trim(), result: parts.slice(1).join(':').trim() };
  }
  return { command: text, result: 'recorded' };
}
