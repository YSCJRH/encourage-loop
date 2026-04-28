import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tempRepo } from './helpers.js';
import { checkpoint } from '../src/checkpoint.js';
import { initCursor, readCursor, writeCursor } from '../src/cursor.js';
import { readJsonl } from '../src/fsutil.js';
import { encouragePath, STATE_JSONL, VALIDATIONS_JSONL } from '../src/paths.js';

test('checkpoint keeps repeated blockers unique in the current cursor', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });

  checkpoint({ blocker: 'npm publish requires two-factor authentication.' }, cwd);
  checkpoint({ blocker: 'npm publish requires two-factor authentication.' }, cwd);

  const cursor = readCursor(cwd);
  const events = readJsonl(encouragePath(STATE_JSONL, cwd));

  assert.deepEqual(cursor.known_blockers, ['npm publish requires two-factor authentication.']);
  assert.equal(events.filter((event) => event.blocker === 'npm publish requires two-factor authentication.').length, 2);
});

test('checkpoint resolves an exact current blocker without erasing history', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });

  checkpoint({ blocker: 'npm publish requires two-factor authentication.' }, cwd);
  checkpoint({
    evidence: 'Maintainer completed npm two-factor authentication.',
    validation: 'npm whoami: sycjrh',
    resolve_blocker: 'npm publish requires two-factor authentication.'
  }, cwd);

  const cursor = readCursor(cwd);
  const events = readJsonl(encouragePath(STATE_JSONL, cwd));
  const last = events.at(-1);

  assert.deepEqual(cursor.known_blockers, []);
  assert.match(cursor.last_completed_evidence.at(-1), /two-factor authentication/);
  assert.deepEqual(last.resolved_blockers, ['npm publish requires two-factor authentication.']);
  assert.ok(events.some((event) => event.blocker === 'npm publish requires two-factor authentication.'));
});

test('checkpoint normalizes repeated blockers from older cursors', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    known_blockers: [
      'CI is still running.',
      'CI is still running.',
      'npm publish requires two-factor authentication.'
    ]
  }, cwd);

  checkpoint({ evidence: 'Recorded current blocker hygiene.' }, cwd);

  assert.deepEqual(readCursor(cwd).known_blockers, [
    'CI is still running.',
    'npm publish requires two-factor authentication.'
  ]);
});

test('checkpoint resolves a blocker once after normalizing older duplicates', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    known_blockers: [
      'CI is still running.',
      'CI is still running.'
    ]
  }, cwd);

  checkpoint({ resolve_blocker: 'CI is still running.' }, cwd);

  assert.deepEqual(readCursor(cwd).known_blockers, []);
});

test('checkpoint rejects resolving an unknown blocker', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });

  assert.throws(
    () => checkpoint({ resolve_blocker: 'No matching blocker.' }, cwd),
    /Cannot resolve unknown blocker: No matching blocker\./
  );

  const cursor = readCursor(cwd);
  assert.deepEqual(cursor.known_blockers, []);
});

test('checkpoint unknown blocker resolution has no side effects', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });

  assert.throws(
    () => checkpoint({
      validation: 'npm test: passed',
      resolve_blocker: 'No matching blocker.'
    }, cwd),
    /Cannot resolve unknown blocker: No matching blocker\./
  );

  const cursor = readCursor(cwd);
  assert.deepEqual(cursor.last_validation, []);
  assert.deepEqual(cursor.known_blockers, []);
  assert.equal(fs.existsSync(encouragePath(STATE_JSONL, cwd)), false);
  assert.equal(fs.existsSync(encouragePath(VALIDATIONS_JSONL, cwd)), false);
});

test('checkpoint multiple blocker resolution is all or nothing', () => {
  const cwd = tempRepo();
  const cursor = initCursor({ plan: 'plan.md', cwd });
  writeCursor({
    ...cursor,
    known_blockers: [
      'CI is still running.',
      'npm publish requires two-factor authentication.'
    ]
  }, cwd);

  assert.throws(
    () => checkpoint({
      resolve_blocker: [
        'CI is still running.',
        'No matching blocker.'
      ]
    }, cwd),
    /Cannot resolve unknown blocker: No matching blocker\./
  );

  assert.deepEqual(readCursor(cwd).known_blockers, [
    'CI is still running.',
    'npm publish requires two-factor authentication.'
  ]);
  assert.equal(fs.existsSync(encouragePath(STATE_JSONL, cwd)), false);
});

test('checkpoint rejects non-string blocker values', () => {
  const cwd = tempRepo();
  initCursor({ plan: 'plan.md', cwd });

  assert.throws(
    () => checkpoint({ blocker: true }, cwd),
    /--blocker requires a non-empty string value\./
  );
  assert.throws(
    () => checkpoint({ resolve_blocker: true }, cwd),
    /--resolve-blocker requires a non-empty string value\./
  );

  assert.deepEqual(readCursor(cwd).known_blockers, []);
});
