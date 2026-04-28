# EncourageLoop Project Status

Last verified: 2026-04-28.

This page separates released package facts from repository maintenance candidates. It is status
evidence only; it does not authorize a version bump, tag, npm publish, GitHub release, merge,
deployment, or automation.

## Published Release

- npm currently reports `encourage-loop` versions as `["0.1.0"]`.
- npm package `encourage-loop@0.1.0` is visible with tarball
  `https://registry.npmjs.org/encourage-loop/-/encourage-loop-0.1.0.tgz`.
- GitHub release `v0.1.0` exists, is not a draft, and is not a prerelease.
- GitHub release `v0.1.0` was published at `2026-04-28T11:16:17Z`.
- Remote tag `v0.1.0` points to `8ffd2cc023bffef061778f76e7299450654e0de6`.

## Repository Maintenance Candidates

- v0.1.1 is a repository maintenance candidate documented by
  `docs/v0.1.1-readiness-note.md`; it has not been released.
- v0.1.2 is a repository maintenance candidate documented by
  `docs/v0.1.2-ci-platform-maintenance-readiness-note.md`; it has not been released.
- v0.1.3 is a repository status snapshot candidate documented by
  `plans/v0.1.3-project-status-execplan.md`; it has not been released.
- v0.1.4 is a repository release-preparation guard candidate documented by
  `docs/future-release-preparation.md`; it has not been released.
- v0.1.5 is a repository status-stability candidate documented by
  `plans/v0.1.5-status-stability-execplan.md`; it has not been released.
- `package.json` remains at version `0.1.0` until a future release plan explicitly authorizes a
  version bump.

## Finding Current State

This page avoids pinning current `HEAD`, active cursor, or GitHub Actions run IDs because those
facts change after normal evidence commits. Use read-only checks when you need live state:

```bash
node bin/encourage.js status
git status --short --branch
git rev-parse HEAD
gh run list --repo YSCJRH/encourage-loop --branch main --limit 5
git ls-remote origin refs/heads/main refs/tags/v<target-version>
```

Keep current evidence in `.encourage/`, execution-plan evidence, readiness notes, or handoff
output. Update this page only for stable release facts, maintenance-candidate identity, and release
boundaries.

## Release Boundary

Future release preparation for v0.1.1, v0.1.2, v0.1.3, v0.1.4, v0.1.5, or any later version
requires a separate maintainer decision, fresh validation, and explicit manual confirmation for
each release command.
Use `docs/future-release-preparation.md` before preparing any future release.

Do not treat a readiness note, passing CI run, or maintenance plan completion as release
authorization.
