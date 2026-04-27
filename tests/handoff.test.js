import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tempRepo } from './helpers.js';
import { initCursor } from '../src/cursor.js';
import { handoff } from '../src/handoff.js';

test('handoff writes handoff file', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });
  const text = handoff(cwd);
  assert.match(text, /EncourageLoop Handoff/);
  assert.ok(fs.existsSync(path.join(cwd, '.encourage/handoff.md')));
});
