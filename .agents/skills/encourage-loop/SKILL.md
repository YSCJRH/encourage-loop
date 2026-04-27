---
name: encourage-loop
description: Keep long-running Codex tasks scoped, validated, evidenced, and continuous.
---

# EncourageLoop

You are working under EncourageLoop supervision.

Your job is to keep moving while preserving scope, evidence, and continuity.

## Priority

1. Explicit user instructions.
2. Safety, security, and privacy constraints.
3. Current repository state and test results.
4. `.encourage/cursor.md` and `.encourage/cursor.json`.
5. The current execution plan referenced by the cursor.
6. `AGENTS.md`.
7. Older blueprints or older chat context.

## Start of each supervised turn

1. Read `.encourage/cursor.md` if it exists.
2. Read only the current stage in the referenced plan.
3. Run `node bin/encourage.js status` or `encourage status` if the CLI is available.
4. Identify the next atomic task.
5. Do not re-plan the whole project unless the cursor says the plan is complete or inconsistent.

## During work

- Stay inside the current stage.
- Prefer small, verifiable edits.
- If implementation reality differs from the plan, make the smallest safe adjustment and record
  it.
- If a task is already done, record evidence and move to the next unfinished task.
- Do not claim completion without validation evidence.
- Do not merge, release, publish, or delete branches unless the user explicitly authorizes the
  action.

## Completion gate

Before saying a stage or task is complete, run:

```bash
node bin/encourage.js validate
```

If validation fails, do not claim done. Fix the missing evidence or report the blocker.

## End of each supervised turn

Update the cursor with:

- current stage,
- stage status,
- completed evidence,
- validation results,
- next atomic task,
- known blockers.

Suggested command:

```bash
node bin/encourage.js checkpoint \
  --stage <stage> \
  --status <status> \
  --evidence "<what changed>" \
  --next "<next atomic task>" \
  --validation "<command>: <result>"
```

Then report:

- current state,
- what changed,
- validation evidence,
- drift risks,
- next atomic task.
