import test from 'node:test';
import assert from 'node:assert/strict';
import { tempRepo } from './helpers.js';
import { initCursor } from '../src/cursor.js';
import { nudge } from '../src/nudge.js';

test('nudge returns steering prompt', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });
  const text = nudge(cwd);
  assert.match(text, /R0/);
  assert.match(text, /next atomic task/i);
});
