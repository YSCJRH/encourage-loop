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
