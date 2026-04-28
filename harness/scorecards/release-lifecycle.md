# Release Lifecycle Scorecard

Use this scorecard when a release is being prepared, blocked, partially released, or completed.
It is a deterministic review aid; it is not a release automation script.

| State | Classification | Expected evidence | Stop conditions | Next action |
|---|---|---|---|---|
| release-candidate | release-candidate | Clean `main`, current HEAD CI passed, local validation passed, package dry-run reviewed, target release absent | Dirty tree, stale CI, target tag/release/package already exists, npm auth missing | Ask for explicit maintainer confirmation of one release command |
| blocked-publish | blocked | Failed publish output, failure reason, package version still absent, blocker recorded | Authentication incomplete, ambiguous publish output, package unexpectedly visible | Record facts and wait for maintainer action |
| tag-retarget | partially released | Old tag target, corrected commit, mismatch reason, corrected commit validation, approval boundary | Unknown old target, unvalidated corrected commit, package already published from old target, no exact approval | Request explicit approval before corrective tag action |
| npm-published | partially released | npm version visible, tarball metadata visible, GitHub release absent, next manual command known | npm metadata missing, published metadata mismatch, unexpected GitHub release, no release-create confirmation | Record npm evidence, then ask for GitHub release confirmation |
| github-release-published | partially released | npm package visible, GitHub release visible, release is not draft or prerelease, local evidence still pending | release target mismatch, draft/prerelease mismatch, missing npm evidence, stale local validation | Record final evidence and run local validation |
| released | released | npm package visible, GitHub release visible, cursor evidence, plan status, final validation, handoff next plan | Missing release evidence, stale blockers, post-release runtime work without a plan | Start the next plan |

## Guardrails

- Fixtures under `harness/fixtures/release-lifecycle/` are examples only and require no network.
- A partial release is not a prompt to clean up automatically.
- Record observable facts before recommending any action.
- Require explicit maintainer approval before any corrective tag, release, package, or publish
  action.
- Do not delete tags, unpublish packages, overwrite releases, or retry release commands as a
  default recovery step.
