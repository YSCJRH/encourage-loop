# EncourageLoop Cursor Contract

The cursor is the durable state anchor for long-running Codex work.

Required fields:

- `plan`: path to the current execution plan.
- `current_stage`: current stage label, such as `R0`.
- `stage_status`: one of `not_started`, `in_progress`, `validation_pending`, `complete`, `blocked`, `pushed`, `review_pending`, `release_candidate`, `released`.
- `next_atomic_task`: one small task Codex can complete now.
- `last_completed_evidence`: concrete evidence, not vibes.
- `last_validation`: command/result pairs.
- `known_blockers`: blockers that require human decision or later work.
- `scope_guard`: boundaries that must not be crossed.

The cursor should be updated at the end of every supervised turn.
