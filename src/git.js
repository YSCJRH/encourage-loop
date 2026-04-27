import { execFileSync } from 'node:child_process';

export function gitStatus(cwd = process.cwd()) {
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const porcelain = execFileSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return {
      available: true,
      branch,
      head,
      dirty_files: porcelain.split(/\r?\n/).filter(Boolean),
      dirty_count: porcelain.split(/\r?\n/).filter(Boolean).length
    };
  } catch {
    return { available: false, branch: null, head: null, dirty_files: [], dirty_count: 0 };
  }
}
