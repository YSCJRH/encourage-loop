import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function tempRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'encourage-test-'));
  fs.writeFileSync(path.join(dir, 'plan.md'), '# Test Plan\n\n## Phase R0\n\n- [ ] Do the first task.\n', 'utf8');
  return dir;
}
