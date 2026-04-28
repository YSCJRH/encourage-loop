import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { STAGE_STATUSES } from '../src/cursor.js';

const root = path.resolve(import.meta.dirname, '..');
const fixtureDir = path.join(root, 'harness/fixtures/release-lifecycle');
const fixtureNames = [
  'release-candidate',
  'blocked-publish',
  'tag-retarget',
  'npm-published',
  'github-release-published',
  'released'
];
const classifications = new Set(['release-candidate', 'blocked', 'partially-released', 'released']);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, `${name}.json`), 'utf8'));
}

test('release lifecycle fixture inventory is complete', () => {
  const files = fs.readdirSync(fixtureDir).filter((file) => file.endsWith('.json')).sort();

  assert.deepEqual(files, fixtureNames.map((name) => `${name}.json`).sort());
});

test('release lifecycle fixtures are deterministic cursor examples', () => {
  for (const name of fixtureNames) {
    const fixture = readFixture(name);
    const lifecycle = fixture.release_lifecycle;

    assert.equal(fixture.plan, 'plans/v0.1.1-post-release-hardening-execplan.md', name);
    assert.ok(STAGE_STATUSES.includes(fixture.stage_status), `${name} has an unknown status`);
    assert.equal(lifecycle.state, name);
    assert.ok(classifications.has(lifecycle.classification), `${name} has an unknown classification`);
    assert.equal(lifecycle.network_required, false, `${name} should not require network access`);
    assert.match(fixture.updated_at, /^2026-04-28T00:00:00\.000Z$/);
    assert.ok(fixture.next_atomic_task.length > 0, `${name} needs a next task`);
    assert.ok(fixture.last_completed_evidence.length > 0, `${name} needs evidence`);
    assert.ok(fixture.last_validation.length > 0, `${name} needs validation evidence`);
    assert.ok(fixture.scope_guard.length > 0, `${name} needs scope guards`);
    assert.ok(lifecycle.expected_evidence.length > 0, `${name} needs expected evidence`);
    assert.ok(lifecycle.stop_conditions.length > 0, `${name} needs stop conditions`);
    assert.ok(lifecycle.allowed_next_action.length > 0, `${name} needs an allowed next action`);

    for (const validation of fixture.last_validation) {
      assert.equal(typeof validation.command, 'string', `${name} validation command`);
      assert.equal(typeof validation.result, 'string', `${name} validation result`);
    }
  }
});

test('partial release fixtures require fact recording and explicit approval boundaries', () => {
  const partials = fixtureNames
    .map(readFixture)
    .filter((fixture) => fixture.release_lifecycle.classification === 'partially-released');

  assert.equal(partials.length, 3);
  for (const fixture of partials) {
    const text = JSON.stringify(fixture);

    assert.match(text, /Record|record/);
    if (fixture.release_lifecycle.manual_confirmation_required) {
      assert.match(text, /explicit|approval|confirmed/);
    }
    assert.doesNotMatch(text, /git push --delete|npm unpublish|git tag -d/);
  }
});

test('release lifecycle scorecard and docs distinguish release outcomes', () => {
  const scorecard = read('harness/scorecards/release-lifecycle.md');
  const docs = read('docs/release-lifecycle-states.md');

  for (const state of fixtureNames) {
    assert.match(scorecard, new RegExp(state));
    assert.match(docs, new RegExp(state));
  }

  assert.match(scorecard, /release-candidate/);
  assert.match(scorecard, /blocked/);
  assert.match(scorecard, /partially released/);
  assert.match(scorecard, /released/);
  assert.match(docs, /Corrective release actions require explicit maintainer approval/);
  assert.doesNotMatch(docs, /git push --delete|npm unpublish|git tag -d/);
});
