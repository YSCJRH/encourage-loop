import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { tempRepo } from './helpers.js';

const cli = path.resolve(import.meta.dirname, '../bin/encourage.js');

function runCli(cwd, args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });
}

test('CLI dispatches init and status through the bin entrypoint', () => {
  const cwd = tempRepo();

  const init = runCli(cwd, ['init', '--plan', 'plan.md']);
  assert.equal(init.status, 0);
  assert.match(init.stdout, /Initialized EncourageLoop cursor for plan\.md/);
  assert.equal(init.stderr, '');
  assert.ok(fs.existsSync(path.join(cwd, '.encourage/cursor.json')));

  const status = runCli(cwd, ['status']);
  assert.equal(status.status, 0);
  assert.match(status.stdout, /EncourageLoop status/);
  assert.match(status.stdout, /Plan: plan\.md/);
  assert.match(status.stdout, /Stage: R0/);
});

test('CLI reports a helpful missing-cursor error through the bin entrypoint', () => {
  const cwd = tempRepo();

  const status = runCli(cwd, ['status']);
  assert.equal(status.status, 1);
  assert.equal(status.stdout, '');
  assert.match(status.stderr, /No EncourageLoop cursor found/);
  assert.match(status.stderr, /encourage init --plan <path>/);
});

test('CLI checkpoint preserves repeated validation flags', () => {
  const cwd = tempRepo();

  const init = runCli(cwd, ['init', '--plan', 'plan.md']);
  assert.equal(init.status, 0);

  const checkpoint = runCli(cwd, [
    'checkpoint',
    '--stage',
    'R4',
    '--status',
    'release_candidate',
    '--evidence',
    'Recorded release-candidate checks.',
    '--next',
    'Maintainer review.',
    '--validation',
    'npm test: passed',
    '--validation',
    'npm run lint: passed'
  ]);
  assert.equal(checkpoint.status, 0);

  const cursor = JSON.parse(fs.readFileSync(path.join(cwd, '.encourage/cursor.json'), 'utf8'));
  assert.deepEqual(cursor.last_validation.slice(-2), [
    { command: 'npm test', result: 'passed' },
    { command: 'npm run lint', result: 'passed' }
  ]);
});
