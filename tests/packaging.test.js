import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function listFiles(relativeDir) {
  const dir = path.join(root, relativeDir);
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDir.replaceAll('\\', '/'), entry.name);
    if (entry.isDirectory()) files.push(...listFiles(relativePath));
    else files.push(relativePath);
  }

  return files.sort();
}

function collectStringValues(value, trail = []) {
  if (typeof value === 'string') return [{ path: trail.join('.'), value }];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectStringValues(entry, [...trail, String(index)]));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) => collectStringValues(entry, [...trail, key]));
  }
  return [];
}

function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  assert.equal(lines[0], '---');
  const end = lines.indexOf('---', 1);
  assert.ok(end > 1, 'frontmatter must have a closing delimiter');

  const entries = new Map();
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    assert.ok(match, `invalid frontmatter line: ${line}`);
    entries.set(match[1], match[2]);
  }
  return entries;
}

test('plugin manifest points to the packaged skills directory', () => {
  const manifest = readJson('.codex-plugin/plugin.json');
  const skillsPath = path.resolve(root, manifest.skills);

  assert.equal(manifest.name, 'encourage-loop');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.repository, 'https://github.com/YSCJRH/encourage-loop');
  assert.equal(manifest.skills, './skills/');
  assert.ok(fs.existsSync(skillsPath));
  assert.ok(fs.existsSync(path.join(skillsPath, 'encourage-loop/SKILL.md')));
  assert.equal(manifest.interface.displayName, 'EncourageLoop');
  assert.ok(manifest.interface.defaultPrompt.some((prompt) => prompt.includes('$encourage-loop')));
});

test('plugin manifest string values do not contain literal newlines', () => {
  const manifest = readJson('.codex-plugin/plugin.json');
  const stringValues = collectStringValues(manifest);

  assert.ok(stringValues.length > 0);
  for (const entry of stringValues) {
    assert.doesNotMatch(entry.value, /[\r\n]/, `${entry.path} contains a newline`);
  }
});

test('package manifest explicitly controls published files', () => {
  const packageJson = readJson('package.json');

  assert.deepEqual(packageJson.files, [
    '.agents/',
    '.codex-plugin/',
    'AGENTS.md',
    'START_CODEX.md',
    'bin/',
    'docs/',
    'examples/',
    'harness/',
    'hooks/',
    'plans/',
    'prompts/',
    'schemas/',
    'skills/',
    'src/',
    'tests/'
  ]);
});

test('package manifest exposes the encourage CLI without publish-time normalization', () => {
  const packageJson = readJson('package.json');

  assert.deepEqual(packageJson.bin, {
    encourage: 'bin/encourage.js'
  });
});

test('local marketplace entry points at this plugin root', () => {
  const manifest = readJson('.codex-plugin/plugin.json');
  const marketplace = readJson('.agents/plugins/marketplace.json');
  const entry = marketplace.plugins.find((plugin) => plugin.name === manifest.name);

  assert.equal(marketplace.name, 'encourage-loop-local');
  assert.ok(entry);
  assert.equal(entry.source.source, 'local');
  assert.equal(entry.source.path, './');
  assert.equal(entry.policy.installation, 'AVAILABLE');
  assert.equal(entry.category, manifest.interface.category);
});

test('repo-scoped skill stays in sync with packaged skill', () => {
  const packagedRoot = 'skills/encourage-loop';
  const repoScopedRoot = '.agents/skills/encourage-loop';
  const packagedFiles = listFiles(packagedRoot).map((file) => file.slice(packagedRoot.length + 1));
  const repoScopedFiles = listFiles(repoScopedRoot).map((file) => file.slice(repoScopedRoot.length + 1));

  assert.deepEqual(repoScopedFiles, packagedFiles);

  for (const file of packagedFiles) {
    const packagedText = fs.readFileSync(path.join(root, packagedRoot, file), 'utf8');
    const repoScopedText = fs.readFileSync(path.join(root, repoScopedRoot, file), 'utf8');
    assert.equal(repoScopedText, packagedText, `${file} differs between skill copies`);
  }
});

test('skill frontmatter is valid simple YAML in both skill copies', () => {
  const skillPaths = [
    'skills/encourage-loop/SKILL.md',
    '.agents/skills/encourage-loop/SKILL.md'
  ];

  for (const skillPath of skillPaths) {
    const text = read(skillPath);
    const frontmatter = parseFrontmatter(text);

    assert.equal(frontmatter.get('name'), 'encourage-loop');
    assert.match(frontmatter.get('description'), /\S/);
    assert.match(text, /^name: encourage-loop$/m);
    assert.match(text, /^description: .+$/m);
  }
});

test('CI workflow runs the required local validation commands only', () => {
  const workflow = read('.github/workflows/ci.yml');
  const required = [
    'npm ci',
    'npm test',
    'npm run lint',
    'node harness/scripts/run-harness.js',
    'npm pack --dry-run'
  ];

  let lastIndex = -1;
  for (const command of required) {
    const index = workflow.indexOf(command);
    assert.notEqual(index, -1, `${command} is missing from CI`);
    assert.ok(index > lastIndex, `${command} is out of order`);
    lastIndex = index;
  }

  assert.doesNotMatch(workflow, /npm publish|gh release|git tag|deploy/i);
});
