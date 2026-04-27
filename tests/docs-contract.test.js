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
