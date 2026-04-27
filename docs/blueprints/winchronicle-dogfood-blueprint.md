# WinChronicle Dogfood Blueprint

This is a dogfood example for EncourageLoop, based on the user-provided WinChronicle harness blueprint.

## Why WinChronicle is a good dogfood project

WinChronicle is a long-running, phase-based, privacy-sensitive open-source project. It has:

- a long-term blueprint,
- per-round execution plans,
- strict privacy boundaries,
- harness-first implementation rules,
- staged verification gates,
- manual release gates.

That is exactly the kind of project where EncourageLoop should help.

## Desired behavior

EncourageLoop should let Codex:

1. Treat the WinChronicle blueprint as a north star, not a per-turn script.
2. Treat the current phased plan as the execution contract.
3. Treat repository state and test results as the highest-priority facts.
4. Use a cursor to avoid re-reading or re-planning everything each turn.
5. Stop fake completion before validation evidence exists.
6. Preserve privacy/scope boundaries.

## Dogfood prompt

```text
$encourage-loop Continue the WinChronicle beta-hardening plan from .encourage/cursor.md. Do not re-read the whole long-term blueprint unless scope or privacy boundaries are unclear. Work only on the current phase's next atomic task, validate, checkpoint, and report evidence.
```

## Dogfood success criteria

- The agent does not jump phases.
- The agent does not implement screenshot/OCR when the plan says privacy spec only.
- The agent does not claim complete without running validation or recording why validation cannot run.
- The agent updates the cursor at the end of each turn.
