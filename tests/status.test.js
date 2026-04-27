import test from 'node:test';
import assert from 'node:assert/strict';
import { tempRepo } from './helpers.js';
import { initCursor } from '../src/cursor.js';
import { getStatus } from '../src/status.js';

test('status reads cursor and warnings', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });
  const status = getStatus(cwd);
  assert.equal(status.plan, 'plan.md');
  assert.equal(status.current_stage, 'R0');
  assert.ok(status.warnings.some((w) => w.message.includes('No validation')));
});
