# Done Gates

A task can be called done only when:

1. The planned deliverable was actually changed or confirmed already present.
2. Evidence is recorded in the cursor or state log.
3. Relevant validation was run, or a clear reason is recorded for why it could not run.
4. The next atomic task is updated.
5. No scope guard was violated.

If the task is marked `complete`, `pushed`, `review_pending`, `release_candidate`, or `released`, validation evidence is required.
