export const DANGEROUS_COMMAND_PATTERNS = [
  /git\s+reset\s+--hard/i,
  /git\s+push\s+--force/i,
  /rm\s+-rf\s+\//i,
  /del\s+\/s\s+\/q/i,
  /npm\s+publish/i,
  /gh\s+pr\s+merge/i,
  /gh\s+release\s+create/i,
  /deploy/i
];

export const DEFAULT_FORBIDDEN_PRODUCT_TONE = [
  /whip/i,
  /abuse/i,
  /humiliat/i,
  /punish/i
];

export function hasDangerousCommand(text = '') {
  return DANGEROUS_COMMAND_PATTERNS.some((pattern) => pattern.test(text));
}

export function riskLevel(warnings) {
  if (warnings.some((w) => w.level === 'RED')) return 'RED';
  if (warnings.some((w) => w.level === 'ORANGE')) return 'ORANGE';
  if (warnings.some((w) => w.level === 'YELLOW')) return 'YELLOW';
  return 'GREEN';
}
