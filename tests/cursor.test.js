import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tempRepo } from './helpers.js';
import { initCursor, readCursor, writeCursor } from '../src/cursor.js';

test('initCursor creates cursor files', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  assert.equal(cursor.plan, 'plan.md');
  assert.equal(cursor.current_stage, 'R0');
  assert.ok(fs.existsSync(path.join(cwd, '.encourage/cursor.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.encourage/cursor.json')));
  const read = readCursor(cwd);
  assert.equal(read.next_atomic_task, 'Do the first task.');
});

test('readCursor recovers cursor fields from markdown when JSON is missing', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    next_atomic_task: 'Harden the markdown fallback.',
    last_completed_evidence: [
      'Added focused cursor round-trip coverage.',
      'Confirmed markdown fallback keeps continuity.'
    ],
    last_validation: [
      { command: 'npm test', result: 'passed' },
      { command: 'node bin/encourage.js validate', result: 'GREEN' }
    ],
    known_blockers: ['Awaiting manual release approval.'],
    scope_guard: ['No daemon.', 'No network calls.']
  }, cwd);

  fs.rmSync(path.join(cwd, '.encourage/cursor.json'));
  const read = readCursor(cwd);

  assert.equal(read.plan, 'plan.md');
  assert.equal(read.current_stage, 'R0');
  assert.equal(read.stage_status, 'in_progress');
  assert.equal(read.next_atomic_task, 'Harden the markdown fallback.');
  assert.deepEqual(read.last_completed_evidence, [
    'Added focused cursor round-trip coverage.',
    'Confirmed markdown fallback keeps continuity.'
  ]);
  assert.deepEqual(read.last_validation, [
    { command: 'npm test', result: 'passed' },
    { command: 'node bin/encourage.js validate', result: 'GREEN' }
  ]);
  assert.deepEqual(read.known_blockers, ['Awaiting manual release approval.']);
  assert.deepEqual(read.scope_guard, ['No daemon.', 'No network calls.']);
  assert.match(read.updated_at, /^\d{4}-\d{2}-\d{2}T/);
});
