# Blocker Hygiene

Blockers in `cursor.known_blockers` are current blockers. They should describe what prevents the
next atomic task from continuing right now.

Historical evidence belongs in checkpoint history, validation history, release notes, or handoff
evidence. Do not keep a resolved blocker in `known_blockers` just because it was important.

## Adding Blockers

Use `--blocker` when work is currently stopped:

```bash
node bin/encourage.js checkpoint --blocker "npm publish requires two-factor authentication."
```

Repeated `--blocker` text is kept once in the current cursor so status and handoff remain
readable. Each checkpoint event still records the blocker text as history.

## Resolving Blockers

Use `--resolve-blocker` with the exact text of a current blocker after evidence shows the blocker
is no longer active:

```bash
node bin/encourage.js checkpoint \
  --evidence "Maintainer completed npm two-factor authentication." \
  --validation "npm whoami: sycjrh" \
  --resolve-blocker "npm publish requires two-factor authentication."
```

Resolving an unknown blocker fails instead of silently changing the cursor. This keeps cleanup
explicit and prevents accidental removal of active blockers.

## What To Preserve

Do not delete historical evidence from `.encourage/state.jsonl`, `.encourage/validations.jsonl`,
release notes, or plan evidence when clearing a current blocker. The cursor should show the
current state; the history should explain how it got there.

## When A Blocker Should Stay Current

Keep a blocker in `known_blockers` when:

- the next command or task cannot safely run,
- the maintainer still needs to make a decision,
- required validation is missing or stale,
- release artifacts disagree and no exact corrective action has been approved.

Clear a blocker when:

- the blocking condition has direct evidence of resolution,
- the next atomic task can continue,
- the resolved issue is still preserved in evidence or event history.
