import { initCursor } from './cursor.js';
import { getStatus, renderStatus } from './status.js';
import { checkpoint } from './checkpoint.js';
import { validate, renderValidation } from './validate.js';
import { nudge } from './nudge.js';
import { handoff } from './handoff.js';

export async function main(argv) {
  const [command, ...rest] = argv;
  switch (command) {
    case 'init': {
      const args = parseArgs(rest);
      const cursor = initCursor({ plan: args.plan, force: Boolean(args.force) });
      console.log(`Initialized EncourageLoop cursor for ${cursor.plan}`);
      break;
    }
    case 'status': {
      const args = parseArgs(rest);
      const status = getStatus();
      if (args.json) console.log(JSON.stringify(status, null, 2));
      else process.stdout.write(renderStatus(status));
      break;
    }
    case 'checkpoint': {
      const args = parseArgs(rest);
      const updated = checkpoint(args);
      console.log(`Checkpoint recorded for ${updated.current_stage} (${updated.stage_status}).`);
      break;
    }
    case 'validate': {
      const result = validate();
      process.stdout.write(renderValidation(result));
      if (!result.ok) process.exitCode = result.level === 'RED' ? 3 : 2;
      break;
    }
    case 'nudge': {
      process.stdout.write(nudge());
      break;
    }
    case 'handoff': {
      const text = handoff();
      process.stdout.write(text);
      break;
    }
    case '--help':
    case '-h':
    case undefined: {
      process.stdout.write(helpText());
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}\n\n${helpText()}`);
  }
}

export function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2).replaceAll('-', '_');
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        setArg(result, key, true);
      } else {
        setArg(result, key, next);
        i += 1;
      }
    }
  }
  return result;
}

function setArg(result, key, value) {
  if (!Object.hasOwn(result, key)) {
    result[key] = value;
  } else if (Array.isArray(result[key])) {
    result[key].push(value);
  } else {
    result[key] = [result[key], value];
  }
}

function helpText() {
  return `EncourageLoop CLI

Commands:
  encourage init --plan <path> [--force]
  encourage status [--json]
  encourage checkpoint --stage <stage> --status <status> --evidence <text> --next <text> [--validation "cmd: result"] [--blocker <text>] [--resolve-blocker <exact text>]
  encourage validate
  encourage nudge
  encourage handoff
`;
}
