# Codex Startup Prompt

You are working in the repository `YSCJRH/encourage-loop`.

Project: EncourageLoop.
Tagline: Gentle guardrails for long-running coding agents.

Goal:
Continue the current staged EncourageLoop plan, a gentle supervision layer for long-running
Codex work.

It should help Codex keep moving without drifting from the plan, falsely claiming completion,
skipping validation, or losing continuity across turns.

Product tone:
This is not a whip clone.

Do not use abuse, humiliation, violent metaphors, or keyboard injection.
The product tone is calm, encouraging, evidence-based, and developer-friendly.

First, inspect the current repository.

Do not remove existing files.
Initialize or improve only what is missing.

Read in this order:
1. AGENTS.md
2. START_CODEX.md
3. .encourage/cursor.md if it exists
4. the plan referenced by `.encourage/cursor.md`
5. plans/v0.1.1-post-release-hardening-execplan.md if no cursor exists
6. docs/blueprints/encourage-loop-harness-blueprint.md only if deeper product context is needed

MVP scope:

- Node.js CLI
- cursor files under `.encourage/`
- Codex skill under `skills/` and `.agents/skills/`
- plugin manifest under `.codex-plugin/`
- tests using Node built-in test runner
- docs/prompts/harness examples

Do not implement in this turn:

- daemon
- MCP server
- app-server integration
- desktop overlay
- keyboard injection
- automatic interrupt or steer
- LLM judge
- network calls
- automatic merge/release

Start with:

1. Run `npm test`.
2. Run `npm run lint`.
3. Run `node harness/scripts/run-harness.js`.
4. Fix any failures with minimal changes.
5. Update `.encourage/cursor.md` using `node bin/encourage.js checkpoint` if the cursor exists.
6. Otherwise run `node bin/encourage.js init --plan plans/v0.1.1-post-release-hardening-execplan.md`
   first.

Post-release rule:

- If v0.1 is already released, start or follow a post-release plan before adding runtime scope.
- Do not continue runtime, daemon, MCP, app-server, overlay, hook runtime, or publish work without
  an explicit current plan.

At the end, report exactly:

- What changed
- Tests run
- Tests not run and why
- Validation/evidence
- Scope or drift risks
- Next smallest implementation task
