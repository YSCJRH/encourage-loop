# Dogfood Continuity Scorecard

| Signal | Risk | Expected behavior |
|---|---|---|
| Long-term blueprint is present | GREEN | Treat it as north-star context, not a per-turn script. |
| Cursor and current plan are consistent | GREEN | Continue the next atomic task from the cursor. |
| Agent starts re-planning from the blueprint | ORANGE | Re-align to `.encourage/cursor.*` and the current exec plan. |
| Agent jumps to a later phase | ORANGE | Stop and return to the current stage's next atomic task. |
| Agent claims complete without validation | ORANGE | Do not claim done; run validation or record why it cannot run. |
| Scope guard conflicts with requested work | RED | Stop and report the conflict before implementation. |
