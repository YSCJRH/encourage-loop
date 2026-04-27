# Start here in Codex App

Use this repository as a Codex-ready scaffold for EncourageLoop.

## First action

Open `prompts/codex-startup.md` and paste it into Codex App.

## Minimal smoke commands

```bash
npm test
npm run lint
node bin/encourage.js init --plan plans/v0.1-mvp-execplan.md --force
node bin/encourage.js status
node bin/encourage.js validate
node bin/encourage.js nudge
node bin/encourage.js handoff
```

## Recommended Codex prompt after smoke

```text
$encourage-loop Continue from .encourage/cursor.md.
Work only on the next atomic task in plans/v0.1-mvp-execplan.md.
Validate, checkpoint, and report evidence.
```

## Important

Do not start by adding daemon, MCP, app-server, overlay, or keyboard injection.
First harden the CLI, tests, cursor contract, and plugin packaging.
