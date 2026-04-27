# EncourageLoop Harness Blueprint

## North star

EncourageLoop is a gentle guardrail layer for long-running coding agents.

It helps Codex continue useful work without drifting, skipping validation, falsely claiming completion, or losing continuity across sessions.

## Harness definition

```text
Harness = contracts + cursor + fixtures + tests + scorecards + checklists + safety rails + handoff
```

The harness is not a single test script. It is the engineering exoskeleton that lets a coding agent keep working safely for a long time.

## Core product loop

```text
Plan → Cursor → Work → Evidence → Validate → Checkpoint → Handoff
```

## User pain points

1. Long tasks drift from the original plan.
2. Agents claim completion too early.
3. Agents skip validation.
4. Agent work stops after a small chunk.
5. Handoffs across turns lose context.
6. Users cannot see whether the agent is blocked, done, or drifting.

## MVP answer

- Project-local cursor file.
- Deterministic validation rules.
- Gentle nudges.
- Handoff prompt generation.
- Codex skill that teaches the loop.
- Plugin manifest for distribution.

## Explicit non-goals

- No abuse/whip framing.
- No keyboard injection.
- No background daemon in MVP.
- No automatic interruption in MVP.
- No LLM judge in MVP.
- No automatic merge/release.

## Risk colors

- GREEN: continue.
- YELLOW: warning but safe to keep moving.
- ORANGE: fake-done risk; evidence required.
- RED: stop and ask for human confirmation.
- BLUE: blocked; create handoff.

## Product differentiator

EncourageLoop is not an autonomous agent framework. It is the missing guardrail layer between a plan and a long-running Codex session.
