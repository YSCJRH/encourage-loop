import path from 'node:path';

export const ENCOURAGE_DIR = '.encourage';
export const CURSOR_JSON = 'cursor.json';
export const CURSOR_MD = 'cursor.md';
export const STATE_JSONL = 'state.jsonl';
export const VALIDATIONS_JSONL = 'validations.jsonl';
export const HANDOFF_MD = 'handoff.md';
export const CONFIG_JSON = 'config.json';

export function encourageDir(cwd = process.cwd()) {
  return path.join(cwd, ENCOURAGE_DIR);
}

export function encouragePath(file, cwd = process.cwd()) {
  return path.join(encourageDir(cwd), file);
}
