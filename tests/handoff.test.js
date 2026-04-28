import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tempRepo } from './helpers.js';
import { initCursor, writeCursor } from '../src/cursor.js';
import { handoff } from '../src/handoff.js';

test('handoff writes handoff file', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });
  const text = handoff(cwd);
  assert.match(text, /EncourageLoop Handoff/);
  assert.ok(fs.existsSync(path.join(cwd, '.encourage/handoff.md')));
});

test('handoff preserves continuity fields and current warnings', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    plan: 'missing-plan.md',
    next_atomic_task: 'Write the next focused harness test.',
    last_completed_evidence: ['Recorded deterministic validation evidence.'],
    last_validation: [{ command: 'npm test', result: 'passed' }],
    known_blockers: ['Waiting for manual release approval.']
  }, cwd);

  const text = handoff(cwd);

  assert.match(text, /Recorded deterministic validation evidence\./);
  assert.match(text, /npm test: passed/);
  assert.match(text, /Waiting for manual release approval\./);
  assert.match(text, /RED: Plan file not found: missing-plan\.md/);
  assert.match(text, /Write the next focused harness test\./);
});

test('released handoff stays readable with long history and no current blockers', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    stage_status: 'released',
    next_atomic_task: 'Start the next post-release plan.',
    last_completed_evidence: Array.from({ length: 12 }, (_, index) => `Release evidence ${index + 1}.`),
    last_validation: Array.from({ length: 11 }, (_, index) => ({
      command: `validation ${index + 1}`,
      result: 'passed'
    })),
    known_blockers: []
  }, cwd);

  const text = handoff(cwd);

  assert.match(text, /Showing latest 8 of 12 entries/);
  assert.match(text, /Showing latest 8 of 11 entries/);
  assert.doesNotMatch(text, /Release evidence 1\./);
  assert.match(text, /Release evidence 12\./);
  assert.match(text, /## Known blockers\n\n- None\./);
  assert.match(text, /Start the next post-release plan\./);
});
