# Future MCP design

MVP does not implement MCP. A later version may expose deterministic local tools:

- `encourage_status()`
- `encourage_next_task()`
- `encourage_validate_done()`
- `encourage_checkpoint(stage, status, evidence, next)`
- `encourage_handoff()`

MCP tools should only read/write `.encourage/` state. They must not control the desktop, merge PRs, publish packages, or call external LLMs.
