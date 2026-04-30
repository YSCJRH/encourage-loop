# EncourageLoop Project Status

Last verified: 2026-05-01.

This page separates released package facts from repository maintenance candidates. It is status
evidence only; it does not authorize a version bump, tag, npm publish, GitHub release, merge,
deployment, or automation.

## Published Release

- Post-release verification on 2026-04-29 recorded npm versions as `["0.1.0","0.1.5"]`.
- Post-release verification on 2026-04-29 recorded the npm `latest` dist-tag as `0.1.5`.
- Post-release verification on 2026-05-01 recorded npm versions as
  `["0.1.0","0.1.5","0.1.6"]`.
- Post-release verification on 2026-05-01 recorded the npm `latest` dist-tag as `0.1.6`.
- npm package `encourage-loop@0.1.0` is visible with tarball
  `https://registry.npmjs.org/encourage-loop/-/encourage-loop-0.1.0.tgz`.
- npm package `encourage-loop@0.1.5` is visible with tarball
  `https://registry.npmjs.org/encourage-loop/-/encourage-loop-0.1.5.tgz`.
- npm package `encourage-loop@0.1.6` is visible with tarball
  `https://registry.npmjs.org/encourage-loop/-/encourage-loop-0.1.6.tgz`.
- GitHub release `v0.1.0` exists, is not a draft, and is not a prerelease.
- GitHub release `v0.1.0` was published at `2026-04-28T11:16:17Z`.
- Remote tag `v0.1.0` points to `8ffd2cc023bffef061778f76e7299450654e0de6`.
- GitHub release `v0.1.5` exists, is not a draft, and is not a prerelease.
- GitHub release `v0.1.5` was published at `2026-04-29T05:58:50Z`.
- Remote tag `v0.1.5` points to `23281c46f1a97a780a7c59be4557aeb954d9fcf2`.
- GitHub release `v0.1.6` exists, is not a draft, and is not a prerelease.
- GitHub release `v0.1.6` was published at `2026-04-30T23:19:19Z`.
- Remote tag `v0.1.6` points to `d54edc946fb7a20de56091c3275d3a15e9592a52`.

## Repository Maintenance Candidates

- v0.1.1 is a repository maintenance candidate documented by
  `docs/v0.1.1-readiness-note.md`; it has not been released.
- v0.1.2 is a repository maintenance candidate documented by
  `docs/v0.1.2-ci-platform-maintenance-readiness-note.md`; it has not been released.
- v0.1.3 is a repository status snapshot candidate documented by
  `plans/v0.1.3-project-status-execplan.md`; it has not been released.
- v0.1.4 is a repository release-preparation guard candidate documented by
  `docs/future-release-preparation.md`; it has not been released.
- v0.1.5 has been released. Its status-stability and release-preparation evidence is documented by
  `plans/v0.1.5-status-stability-execplan.md` and `docs/v0.1.5-release-notes.md`.
- v0.1.6 has been released. Its post-release status readability evidence is documented by
  `plans/v0.1.6-post-release-status-readability-execplan.md` and
  `docs/v0.1.6-release-notes.md`.

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

Future release preparation for v0.1.7 or any later version requires a separate maintainer
decision, fresh validation, and explicit manual confirmation for each release command.
Use `docs/future-release-preparation.md` before preparing any future release.

Do not treat a readiness note, passing CI run, or maintenance plan completion as release
authorization.
