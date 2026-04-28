#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');

function run(command, args, options = {}) {
  const result = spawnSync(resolveCommand(command), args, {
    cwd: options.cwd || root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
    shell: Boolean(options.shell) || (process.platform === 'win32' && command === 'npm')
  });
  if (result.status !== 0) {
    const output = [result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${output}`);
  }
  return result;
}

function resolveCommand(command) {
  if (process.platform === 'win32' && command === 'npm') return 'npm.cmd';
  return command;
}

function parsePackOutput(stdout) {
  const packed = JSON.parse(stdout);
  const first = Array.isArray(packed) ? packed[0] : null;
  if (!first?.filename) throw new Error('npm pack did not return a tarball filename.');
  return first.filename;
}

function installedBin(installDir) {
  const filename = process.platform === 'win32' ? 'encourage.cmd' : 'encourage';
  return path.join(installDir, 'node_modules', '.bin', filename);
}

export function runInstallSmoke() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'encourage-install-smoke-'));
  const packDir = path.join(tmp, 'pack');
  const installDir = path.join(tmp, 'install');
  fs.mkdirSync(packDir, { recursive: true });
  fs.mkdirSync(installDir, { recursive: true });

  try {
    const pack = run('npm', ['pack', '--json', '--pack-destination', packDir], { cwd: root });
    const tarball = path.join(packDir, parsePackOutput(pack.stdout.trim()));
    if (!fs.existsSync(tarball)) throw new Error(`Packed tarball not found: ${tarball}`);

    fs.writeFileSync(path.join(installDir, 'package.json'), '{ "private": true }\n', 'utf8');
    run('npm', [
      'install',
      '--offline',
      '--no-audit',
      '--no-fund',
      '--ignore-scripts',
      tarball
    ], { cwd: installDir });

    const bin = installedBin(installDir);
    if (!fs.existsSync(bin)) throw new Error(`Installed encourage binary not found: ${bin}`);

    const help = run(bin, ['--help'], {
      cwd: installDir,
      shell: process.platform === 'win32'
    });
    if (!help.stdout.includes('EncourageLoop CLI')) {
      throw new Error('Installed encourage binary did not print the expected help text.');
    }

    console.log('Install smoke passed.');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

runInstallSmoke();
