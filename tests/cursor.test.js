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

test('cursor markdown stays readable with long evidence and validation history', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    next_atomic_task: 'Keep the cursor readable.',
    last_completed_evidence: Array.from({ length: 12 }, (_, index) => `Evidence ${index + 1}.`),
    last_validation: Array.from({ length: 11 }, (_, index) => ({
      command: `validation ${index + 1}`,
      result: `passed ${index + 1}`
    })),
    known_blockers: ['Keep blocker context visible.'],
    scope_guard: ['No daemon.', 'No network calls.']
  }, cwd);

  const markdown = fs.readFileSync(path.join(cwd, '.encourage/cursor.md'), 'utf8');
  const json = JSON.parse(fs.readFileSync(path.join(cwd, '.encourage/cursor.json'), 'utf8'));

  assert.equal(json.last_completed_evidence.length, 12);
  assert.equal(json.last_validation.length, 11);
  assert.match(markdown, /Last completed evidence:\n- Showing latest 8 of 12 entries/);
  assert.match(markdown, /Last validation:\n- Showing latest 8 of 11 entries/);
  assert.match(markdown, /older entries remain in \.encourage\/ history/);
  assert.doesNotMatch(markdown, /Evidence 1\./);
  assert.match(markdown, /Evidence 12\./);
  assert.doesNotMatch(markdown, /validation 1: passed 1/);
  assert.match(markdown, /validation 11: passed 11/);
  assert.match(markdown, /Known blockers:\n- Keep blocker context visible\./);
  assert.match(markdown, /Scope guard:\n- No daemon\.\n- No network calls\./);

  fs.rmSync(path.join(cwd, '.encourage/cursor.json'));
  const fallback = readCursor(cwd);

  assert.equal(fallback.next_atomic_task, 'Keep the cursor readable.');
  assert.equal(fallback.last_completed_evidence.length, 8);
  assert.deepEqual(fallback.last_completed_evidence[0], 'Evidence 5.');
  assert.deepEqual(fallback.last_completed_evidence.at(-1), 'Evidence 12.');
  assert.equal(fallback.last_validation.length, 8);
  assert.deepEqual(fallback.last_validation[0], {
    command: 'validation 4',
    result: 'passed 4'
  });
  assert.deepEqual(fallback.last_validation.at(-1), {
    command: 'validation 11',
    result: 'passed 11'
  });
});
