# AGENTS.md — EncourageLoop Project Pact

EncourageLoop is a gentle guardrail layer for long-running coding-agent work.

## Non-negotiable principles

- Gentle, respectful, evidence-based tone.
- No abuse, humiliation, violent metaphors, or “whip” branding.
- No keyboard injection.
- No background daemon in the MVP.
- No LLM calls in the MVP.
- No network calls in the MVP.
- No automatic merge or release.
- No destructive git commands unless the user explicitly authorizes them.
- Do not overwrite unrelated user changes.
- Keep the CLI deterministic and boring.

## Product contract

EncourageLoop helps a coding agent:

1. recover the current plan state,
2. continue the next atomic task,
3. avoid scope drift,
4. avoid fake completion,
5. record evidence,
6. generate a handoff for the next turn.

## Development mode

This is a harness-first project. Before adding broad behavior, update or add:

1. cursor contracts,
2. fixtures,
3. tests,
4. docs or scorecards,
5. deterministic validation rules.

## Current MVP boundaries

Allowed:

- Node.js CLI.
- Project-local `.encourage/` state files.
- Repo-scoped Codex skill.
- Plugin manifest.
- Local marketplace example.
- Optional hooks examples as documentation only.

Not allowed in MVP:

- daemon,
- desktop overlay,
- keyboard injection,
- automatic interrupt/steer of Codex,
- LLM judge,
- MCP server implementation,
- automatic PR merge/release,
- cloud sync.

## Required report format for each Codex task

At the end of every task, report:

- What changed
- Tests run
- Tests not run and why
- Validation/evidence
- Scope or drift risks
- Next smallest implementation task

Do not claim success unless relevant tests were run or you clearly state why they could not run.
