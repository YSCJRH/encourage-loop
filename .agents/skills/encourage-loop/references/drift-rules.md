# Drift Rules

Local adaptation is allowed:

- reorder tasks within the current stage if safer,
- replace an implementation detail while preserving the contract,
- add a missing fixture/test/doc needed to prove behavior,
- skip an already-completed task after recording evidence.

Local adaptation is not allowed:

- add product capabilities outside the current plan,
- change public contracts without a plan update,
- merge or release without explicit user approval,
- use destructive git commands without explicit user approval,
- claim completion without validation evidence.

Risk colors:

- GREEN: continue.
- YELLOW: minor warning; keep moving but record it.
- ORANGE: fake-done risk; fix evidence before claiming done.
- RED: stop and ask for human confirmation.
- BLUE: blocked; create handoff.
