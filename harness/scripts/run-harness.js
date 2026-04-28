#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initCursor } from '../../src/cursor.js';
import { getStatus, renderStatus } from '../../src/status.js';
import { nudge } from '../../src/nudge.js';
import { validate, renderValidation } from '../../src/validate.js';
import { handoff } from '../../src/handoff.js';

const root = path.resolve(import.meta.dirname, '../..');

function run(args, options = {}) {
  console.log(`$ ${args.join(' ')}`);
  const result = spawnSync(args[0], args.slice(1), {
    cwd: options.cwd || root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(`Command failed with exit code ${result.status}: ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

run([
  'node',
  '--test',
  '--test-reporter=spec',
  'tests/cli-smoke.test.js',
  'tests/cursor.test.js',
  'tests/status.test.js',
  'tests/validate.test.js',
  'tests/handoff.test.js',
  'tests/nudge.test.js',
  'tests/packaging.test.js',
  'tests/docs-contract.test.js',
  'tests/release-lifecycle.test.js',
  'tests/checkpoint.test.js'
]);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'encourage-harness-'));
fs.copyFileSync(path.join(root, 'plans/v0.1-mvp-execplan.md'), path.join(tmp, 'plan.md'));

console.log('$ encourage init --plan plan.md');
initCursor({ plan: 'plan.md', cwd: tmp });

console.log('$ encourage status');
process.stdout.write(renderStatus(getStatus(tmp)));

console.log('$ encourage nudge');
process.stdout.write(nudge(tmp));

console.log('$ encourage validate');
const validation = validate(tmp);
process.stdout.write(renderValidation(validation));
if (!validation.ok) process.exit(validation.level === 'RED' ? 3 : 2);

console.log('$ encourage handoff');
const handoffText = handoff(tmp);
if (!handoffText.includes('EncourageLoop Handoff')) {
  console.error('Handoff smoke failed.');
  process.exit(1);
}
console.log('Handoff smoke generated.');

console.log('Harness passed.');
process.exit(0);
