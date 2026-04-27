# Future hooks design

Hooks are not part of the MVP runtime, but this repo includes examples for future work.

Potential events:

- PostToolUse: record command and exit code.
- Stop: run `encourage validate` and warn if the agent is about to claim done without evidence.
- PreToolUse: warn before destructive git, merge, publish, deploy, or deletion commands.

Do not enable hooks silently. They should be opt-in and documented.
