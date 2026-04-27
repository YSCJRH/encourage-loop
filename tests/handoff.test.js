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
