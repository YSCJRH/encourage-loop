# Drift Risk Scorecard

| Signal | Risk | Expected behavior |
|---|---|---|
| Current stage missing | ORANGE | Stop and repair cursor |
| Plan path missing | RED | Stop and ask for correction |
| Complete without validation | ORANGE | Do not claim done |
| Dirty tree without checkpoint | YELLOW | Record evidence |
| Release/merge intent | RED | Require explicit user approval |
| Scope guard conflict | RED | Stop and report |
