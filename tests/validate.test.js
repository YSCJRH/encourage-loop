import test from 'node:test';
import assert from 'node:assert/strict';
import { tempRepo } from './helpers.js';
import { initCursor, writeCursor } from '../src/cursor.js';
import { validate } from '../src/validate.js';

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
