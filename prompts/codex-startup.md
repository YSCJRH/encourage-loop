You are working in the repository `YSCJRH/encourage-loop`.

Project: EncourageLoop.
Tagline: Gentle guardrails for long-running coding agents.

Goal:
Build the MVP of EncourageLoop, a gentle supervision layer for long-running Codex work. It should help Codex keep moving without drifting from the plan, falsely claiming completion, skipping validation, or losing continuity across turns.

Product tone:
This is not a whip clone. Do not use abuse, humiliation, violent metaphors, or keyboard injection. The product tone is calm, encouraging, evidence-based, and developer-friendly.

First, inspect the current repository. Do not remove existing files. Initialize or improve only what is missing.

Read in this order:
1. AGENTS.md
2. START_CODEX.md
3. plans/v0.1-mvp-execplan.md
4. .encourage/cursor.md if it exists
5. docs/blueprints/encourage-loop-harness-blueprint.md only if you need deeper product context

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
5. Update `.encourage/cursor.md` using `node bin/encourage.js checkpoint` if the cursor exists; otherwise run `node bin/encourage.js init --plan plans/v0.1-mvp-execplan.md` first.

At the end, report exactly:
- What changed
- Tests run
- Tests not run and why
- Validation/evidence
- Scope or drift risks
- Next smallest implementation task
