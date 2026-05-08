import test from 'node:test';
import assert from 'node:assert/strict';
import { tempRepo } from './helpers.js';
import { initCursor, writeCursor } from '../src/cursor.js';
import { nudge } from '../src/nudge.js';

test('nudge returns steering prompt with the next task when no warnings exist', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    next_atomic_task: 'Keep the next task visible.',
    last_validation: [{ command: 'npm test', result: 'passed' }]
  }, cwd);

  const text = nudge(cwd);

  assert.match(text, /R0/);
  assert.match(text, /Keep the next task visible\./);
  assert.match(text, /validate the result/);
  assert.match(text, /cursor and current exec plan/);
  assert.match(text, /older blueprints as background/);
});

test('nudge keeps the warning and next task together', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    plan: 'missing-plan.md',
    next_atomic_task: 'Repair the cursor plan reference.',
    last_validation: [{ command: 'npm test', result: 'passed' }]
  }, cwd);

  const text = nudge(cwd);

  assert.match(text, /Plan file not found: missing-plan\.md/);
  assert.match(text, /Repair the cursor plan reference\./);
  assert.match(text, /before claiming completion/);
  assert.match(text, /cursor and current exec plan/);
  assert.match(text, /older blueprints as background/);
});
