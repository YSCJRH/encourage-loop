# EncourageLoop

**Gentle guardrails for long-running coding agents.**

EncourageLoop helps Codex keep moving without drifting. It gives long-running coding tasks a lightweight plan cursor, evidence gates, handoff notes, and gentle nudges.

It is not a whip. It is not a daemon. It does not shame the agent or inject commands into your terminal. It simply keeps the work aligned with the current plan and makes “done” evidence-based.

## Why

Long-running coding agents are useful, but they can drift:

- they forget the current phase,
- skip validation,
- stop after a small chunk,
- claim completion too early,
- expand scope,
- or lose continuity across sessions.

EncourageLoop adds a small project-local harness:

```text
.encourage/cursor.md
.encourage/cursor.json
.encourage/state.jsonl
.encourage/validations.jsonl
.encourage/handoff.md
```

## MVP features

- `encourage init --plan <path>` — create a project-local plan cursor.
- `encourage status [--json]` — show current stage, next task, warnings, and git state.
- `encourage checkpoint` — record progress and update the cursor.
- `encourage validate` — catch fake-done states before an agent claims completion.
- `encourage nudge` — generate a concise steering prompt.
- `encourage handoff` — generate a continuation prompt for the next Codex turn.
- Codex skill included under both `skills/encourage-loop` and `.agents/skills/encourage-loop`.
- Codex plugin manifest included under `.codex-plugin/plugin.json`.

## What this is not

- Not an autonomous agent framework.
- Not a background daemon.
- Not a Claude/Codex whip clone.
- Not keyboard injection.
- Not automatic merge/release.
- Not an LLM judge.
- Not a replacement for tests or review.

## Core loop

```text
Plan → Cursor → Work → Evidence → Validate → Checkpoint → Handoff
```

## Quick start

```bash
npm install
npm test
node bin/encourage.js init --plan plans/v0.1-mvp-execplan.md
node bin/encourage.js status
node bin/encourage.js nudge
node bin/encourage.js validate
node bin/encourage.js handoff
```

After installing globally or with `npm link`:

```bash
encourage init --plan plans/v0.1-mvp-execplan.md
encourage status
encourage checkpoint --stage R0 --status in_progress --evidence "Created CLI skeleton" --next "Run npm test"
encourage validate
encourage handoff
```

## Use with Codex App

1. Open this repository in Codex App.
2. Let Codex read `AGENTS.md` and `START_CODEX.md`.
3. Start with the prompt in `prompts/codex-startup.md`.
4. For long-running implementation turns, explicitly invoke the skill:

```text
$encourage-loop Continue the current MVP plan from .encourage/cursor.md. Do the next atomic task only, validate, checkpoint, and report evidence.
```

If you have not installed the plugin yet, Codex should still see the repo-scoped skill in `.agents/skills/encourage-loop/SKILL.md`.

## Repository shape

```text
bin/                  CLI entrypoint
src/                  Deterministic CLI implementation
schemas/              Cursor and event schemas
skills/               Skill packaged for plugin distribution
.agents/skills/       Repo-scoped skill for direct Codex use
.codex-plugin/        Plugin manifest
.agents/plugins/      Local marketplace example
plans/                MVP execution plan and cursor contract
prompts/              Codex startup and driver prompts
docs/blueprints/      Harness and product blueprints
harness/              Fixtures and smoke scripts
tests/                Node built-in test runner tests
examples/             Dogfood examples, including WinChronicle
```

## Product principles

- Keep it small and deterministic.
- Prefer evidence over vibes.
- Treat plans as contracts, not scripts.
- Let the agent adapt locally, but never silently drift.
- Do not claim done without validation evidence.
- Do not merge or release without explicit user approval.

## Development

```bash
npm test
npm run lint
node harness/scripts/run-harness.js
```

## Project status

Current published release and maintenance-candidate facts are tracked in
`docs/project-status.md`. Use that page to distinguish released package evidence from repository
readiness notes before preparing any future release.

## Release

Release remains manual-only. See `docs/release-checklist.md` before any tag, publish,
or GitHub release action.

## License

MIT
