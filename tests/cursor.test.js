import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tempRepo } from './helpers.js';
import { initCursor, readCursor } from '../src/cursor.js';

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
