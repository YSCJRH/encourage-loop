$encourage-loop Continue executing the current staged plan.

Do not re-design the whole project. Do not re-plan the whole round. Use the current repository state as the highest-priority fact, and use `.encourage/cursor.md` as the execution cursor.

Startup:
1. Read AGENTS.md.
2. Read `.encourage/cursor.md` and `.encourage/cursor.json`.
3. Read only the current stage in the plan referenced by the cursor.
4. Run `node bin/encourage.js status`.
5. Identify the next atomic task.

Execution:
- If the current stage is unfinished, continue the next atomic task.
- If the current stage is implemented but unvalidated, run validation and record evidence.
- If the current stage is complete, update the cursor and move to the next stage; do only the first atomic task in the next stage.
- If validation fails, fix the smallest relevant issue or report the blocker.
- If the cursor and repository state disagree, stop and report the evidence.

End:
1. Run `node bin/encourage.js validate`.
2. Run `node bin/encourage.js checkpoint --stage <stage> --status <status> --evidence "<evidence>" --next "<next atomic task>" --validation "<command>: <result>"` if appropriate.
3. Report what changed, tests run, risks, and next task.
