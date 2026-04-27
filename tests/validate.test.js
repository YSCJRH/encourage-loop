import test from 'node:test';
import assert from 'node:assert/strict';
import { tempRepo } from './helpers.js';
import { initCursor, writeCursor } from '../src/cursor.js';
import { validate } from '../src/validate.js';
import { appendJsonl } from '../src/fsutil.js';
import { encouragePath, STATE_JSONL } from '../src/paths.js';

test('validate passes in-progress cursor with warning', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });
  const result = validate(cwd);
  assert.equal(result.ok, true);
  assert.equal(result.level, 'YELLOW');
});

test('validate catches complete without validation', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({ ...cursor, stage_status: 'complete' }, cwd);
  const result = validate(cwd);
  assert.equal(result.ok, false);
  assert.equal(result.level, 'ORANGE');
});

test('validate fails red when the cursor plan is missing', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    plan: 'missing-plan.md',
    last_validation: [{ command: 'npm test', result: 'passed' }]
  }, cwd);

  const result = validate(cwd);

  assert.equal(result.ok, false);
  assert.equal(result.level, 'RED');
  assert.ok(result.warnings.some((warning) => warning.level === 'RED' && warning.message.includes('Plan file not found: missing-plan.md')));
});

test('validate fails red when state history command records dangerous commands', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    last_validation: [{ command: 'npm test', result: 'passed' }]
  }, cwd);
  appendJsonl(encouragePath(STATE_JSONL, cwd), {
    type: 'checkpoint',
    command: 'git push --force'
  });

  const result = validate(cwd);

  assert.equal(result.ok, false);
  assert.equal(result.level, 'RED');
  assert.ok(result.warnings.some((warning) => warning.level === 'RED' && warning.message.includes('dangerous command')));
});

test('validate does not treat prose evidence as a dangerous command', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    last_validation: [{ command: 'npm test', result: 'passed' }]
  }, cwd);
  appendJsonl(encouragePath(STATE_JSONL, cwd), {
    type: 'checkpoint',
    evidence: 'Avoided git push --force during release prep.',
    next: 'Keep npm publish as a manual-only maintainer action.',
    blocker: 'No blocker; destructive release commands remain out of scope.'
  });

  const result = validate(cwd);

  assert.equal(result.ok, true);
  assert.equal(result.level, 'GREEN');
  assert.equal(result.warnings.length, 0);
});
