import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { tempRepo } from './helpers.js';
import { initCursor, writeCursor } from '../src/cursor.js';
import { getStatus, renderStatus } from '../src/status.js';

const cli = path.resolve(import.meta.dirname, '../bin/encourage.js');

function runCli(cwd, args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });
}

test('status reads cursor and warnings', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });
  const status = getStatus(cwd);
  assert.equal(status.plan, 'plan.md');
  assert.equal(status.current_stage, 'R0');
  assert.ok(status.warnings.some((w) => w.message.includes('No validation')));
});

test('text status keeps long validation history readable', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    last_validation: Array.from({ length: 11 }, (_, index) => ({
      command: `validation ${index + 1}`,
      result: `passed ${index + 1}`
    }))
  }, cwd);

  const status = getStatus(cwd);
  const text = renderStatus(status);

  assert.equal(status.last_validation.length, 11);
  assert.match(text, /Last validation:\n/);
  assert.match(text, /Showing latest 8 of 11 entries/);
  assert.match(text, /older entries remain in \.encourage\/ history/);
  assert.doesNotMatch(text, /validation 1: passed 1/);
  assert.match(text, /validation 11: passed 11/);
  assert.doesNotMatch(text, /validation 4: passed 4; validation 5: passed 5/);
  assert.match(text, /Warnings:\n- none/);
});

test('json status preserves the full validation history', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    last_validation: Array.from({ length: 11 }, (_, index) => ({
      command: `validation ${index + 1}`,
      result: `passed ${index + 1}`
    }))
  }, cwd);

  const result = runCli(cwd, ['status', '--json']);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  const status = JSON.parse(result.stdout);
  assert.equal(status.last_validation.length, 11);
  assert.deepEqual(status.last_validation.at(0), {
    command: 'validation 1',
    result: 'passed 1'
  });
  assert.deepEqual(status.last_validation.at(-1), {
    command: 'validation 11',
    result: 'passed 11'
  });
});
