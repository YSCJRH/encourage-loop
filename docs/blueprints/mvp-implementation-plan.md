# MVP Implementation Plan

## Phase 0 — Repo bootstrap

- README.md
- AGENTS.md
- package.json
- basic directory layout
- START_CODEX.md
- prompts

## Phase 1 — CLI cursor loop

- init
- status
- checkpoint
- validate
- nudge
- handoff

## Phase 2 — Codex integration

- repo skill under `.agents/skills`
- plugin skill under `skills`
- `.codex-plugin/plugin.json`
- local marketplace example

## Phase 3 — Harness and tests

- cursor tests
- status tests
- validate tests
- handoff tests
- harness smoke script

## Phase 4 — Future integration specs

- hooks example
- MCP plan
- app-server plan
- dashboard plan

## Done means

- `npm test` passes.
- `npm run lint` passes.
- `node harness/scripts/run-harness.js` passes.
- README and AGENTS clearly explain the non-goals.
- Codex can directly use the repo-scoped skill.
