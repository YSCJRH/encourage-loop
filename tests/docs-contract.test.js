import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('README keeps the public tone gentle and evidence-based', () => {
  const readme = read('README.md');

  assert.match(readme, /Gentle guardrails for long-running coding agents/);
  assert.match(readme, /gentle nudges/);
  assert.match(readme, /does not shame the agent/);
  assert.match(readme, /makes .done. evidence-based/);
  assert.match(readme, /Prefer evidence over vibes/);
});

test('README states MVP non-goals explicitly', () => {
  const readme = read('README.md');

  assert.match(readme, /Not a background daemon/);
  assert.match(readme, /Not keyboard injection/);
  assert.match(readme, /Not automatic merge\/release/);
  assert.match(readme, /Not an LLM judge/);
  assert.match(readme, /Not a replacement for tests or review/);
});

test('AGENTS defines deterministic MVP boundaries and required report headings', () => {
  const agents = read('AGENTS.md');
  const requiredHeadings = [
    'What changed',
    'Tests run',
    'Tests not run and why',
    'Validation/evidence',
    'Scope or drift risks',
    'Next smallest implementation task'
  ];

  assert.match(agents, /Gentle, respectful, evidence-based tone/);
  assert.match(agents, /No keyboard injection/);
  assert.match(agents, /No background daemon in the MVP/);
  assert.match(agents, /No LLM calls in the MVP/);
  assert.match(agents, /No network calls in the MVP/);
  assert.match(agents, /No automatic merge or release/);
  assert.match(agents, /Keep the CLI deterministic and boring/);
  for (const heading of requiredHeadings) assert.match(agents, new RegExp(heading.replaceAll('/', '\\/')));
});

test('future integration docs remain future-only and constrained', () => {
  const hooks = read('docs/future-hooks.md');
  const mcp = read('docs/future-mcp.md');
  const appServer = read('docs/future-app-server.md');

  assert.match(hooks, /Hooks are not part of the MVP runtime/);
  assert.match(hooks, /Do not enable hooks silently/);
  assert.match(hooks, /opt-in and documented/);

  assert.match(mcp, /MVP does not implement MCP/);
  assert.match(mcp, /only read\/write `.encourage\/` state/);
  assert.match(mcp, /must not control the desktop, merge PRs, publish packages, or call external LLMs/);

  assert.match(appServer, /intentionally out of MVP scope/);
  assert.match(appServer, /only after the CLI \+ skill loop is trusted/);
});

test('operator docs stay readable multi-line Markdown', () => {
  const docs = [
    'AGENTS.md',
    'START_CODEX.md',
    'prompts/codex-startup.md',
    'docs/release-checklist.md',
    'skills/encourage-loop/SKILL.md',
    '.agents/skills/encourage-loop/SKILL.md'
  ];

  for (const doc of docs) {
    const text = read(doc);
    const lines = text.split(/\r?\n/);
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    let inFence = false;

    assert.ok(lines.length >= 12, `${doc} appears collapsed`);
    assert.ok(lines.some((line) => /^#{1,3}\s+\S/.test(line)), `${doc} is missing Markdown headings`);
    assert.ok(lines.some((line) => line.trim() === ''), `${doc} is missing paragraph breaks`);
    assert.ok(nonEmptyLines.length >= 8, `${doc} has too little structured content`);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.startsWith('```')) inFence = !inFence;
      if (!inFence && line.length > 120) {
        assert.fail(`${doc}:${index + 1} exceeds 120 characters`);
      }
    }
  }
});

test('release checklist keeps release actions manual-only', () => {
  const checklist = read('docs/release-checklist.md');

  assert.match(checklist, /v0\.1\.0 Manual Release Checklist/);
  assert.match(checklist, /docs\/future-release-preparation\.md/);
  assert.match(checklist, /documentation only/);
  assert.match(checklist, /does not authorize Codex, CI, or any automation/);
  assert.match(checklist, /Only after explicit maintainer confirmation/);
  assert.match(checklist, /Each confirmation covers only one command/);
  assert.match(checklist, /git tag v0\.1\.0/);
  assert.match(checklist, /npm publish/);
  assert.match(checklist, /gh release create v0\.1\.0/);
  assert.match(checklist, /npm two-factor authentication/);
  assert.match(checklist, /retargeted only after explicit maintainer approval/);
  assert.match(checklist, /post-release evidence/);
  assert.match(checklist, /Do not retry with force flags/);
});

test('future release preparation guard stays manual-only and version-specific', () => {
  const readme = read('README.md');
  const status = read('docs/project-status.md');
  const guard = read('docs/future-release-preparation.md');

  assert.match(readme, /docs\/future-release-preparation\.md/);
  assert.match(status, /docs\/future-release-preparation\.md/);
  assert.match(guard, /maintainer explicitly asks to prepare a specific future release/);
  assert.match(guard, /target version, such as `<target-version>`/);
  assert.match(guard, /docs\/project-status\.md/);
  assert.match(guard, /Do not treat a readiness note, passing CI run, package dry-run, or completed maintenance plan as/);
  assert.match(guard, /git ls-remote origin refs\/heads\/main refs\/tags\/v<target-version>/);
  assert.match(guard, /`package\.json` remains at version `0\.1\.0` unless/);
  assert.match(guard, /Do not run `npm version`/);
  assert.match(guard, /Each confirmation covers exactly one command/);
  assert.match(guard, /Do not combine commands with `&&`, `;`, scripts/);
  assert.match(guard, /git tag v<target-version>/);
  assert.match(guard, /gh release create v<target-version>/);
  assert.match(guard, /Do not delete a\s+tag, retarget a tag, unpublish, force-push/);
  assert.doesNotMatch(guard, /--force|git push -f|npm publish --dry-run/);
});

test('readiness review separates pre-release readiness from release evidence', () => {
  const review = read('docs/v0.1-readiness-review.md');

  assert.match(review, /## Pre-release readiness evidence/);
  assert.match(review, /## Completed release evidence/);
  assert.match(review, /npm publish --dry-run/);
  assert.match(review, /npm view encourage-loop@0\.1\.0 version dist\.tarball --json/);
  assert.match(review, /gh release view v0\.1\.0/);
});

test('startup prompts route post-release work through a plan first', () => {
  const startup = read('prompts/codex-startup.md');
  const driver = read('prompts/execution-driver.md');
  const startCodex = read('START_CODEX.md');

  assert.match(startup, /plans\/v0\.1\.1-post-release-hardening-execplan\.md/);
  assert.match(startup, /If v0\.1 is already released, start or follow a post-release plan/);
  assert.match(driver, /If a release is complete, start or follow a post-release plan/);
  assert.match(startCodex, /plan referenced by \.encourage\/cursor\.md/);
  assert.match(startCodex, /After a release, start or follow a post-release plan/);
});

test('v0.1.1 readiness note is explicit evidence without release action', () => {
  const note = read('docs/v0.1.1-readiness-note.md');

  assert.match(note, /readiness evidence only/);
  assert.match(note, /passed with 49 tests/);
  assert.match(note, /including install smoke/);
  assert.match(note, /No v0\.1\.1 release action has been performed/);
  assert.match(note, /No version bump was performed/);
  assert.match(note, /No `v0\.1\.1` tag was created/);
  assert.match(note, /No npm publish was run/);
  assert.match(note, /No GitHub release was created/);
  assert.match(note, /requires a separate maintainer decision/);
});

test('project status separates published release from maintenance candidates', () => {
  const readme = read('README.md');
  const status = read('docs/project-status.md');

  assert.match(readme, /docs\/project-status\.md/);
  assert.match(status, /versions as `\["0\.1\.0"\]`/);
  assert.match(status, /GitHub release `v0\.1\.0` exists/);
  assert.match(status, /v0\.1\.1 is a repository maintenance candidate/);
  assert.match(status, /v0\.1\.2 is a repository maintenance candidate/);
  assert.match(status, /v0\.1\.3 is a repository status snapshot candidate/);
  assert.match(status, /v0\.1\.4 is a repository release-preparation guard candidate/);
  assert.match(status, /has not been released/);
  assert.match(status, /There is no remote `v0\.1\.1` tag, `v0\.1\.2` tag, `v0\.1\.3` tag, or `v0\.1\.4` tag/);
  assert.match(status, /`package\.json` remains at version `0\.1\.0`/);
  assert.match(status, /requires a separate\s+maintainer decision/);
  assert.match(status, /Do not treat a readiness note, passing CI run, or maintenance plan completion as release/);
});

test('blocker hygiene docs distinguish current blockers from historical evidence', () => {
  const docs = read('docs/blocker-hygiene.md');

  assert.match(docs, /current blockers/);
  assert.match(docs, /historical evidence/);
  assert.match(docs, /--resolve-blocker/);
  assert.match(docs, /exact text/);
  assert.match(docs, /Do not delete historical evidence/);
});
