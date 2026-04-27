import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
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
