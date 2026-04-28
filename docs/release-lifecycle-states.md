# Release Lifecycle States

EncourageLoop treats release work as a sequence of explicit states. The goal is to avoid fake
completion and avoid improvising recovery steps when a release is only partly finished.

## States

- `release-candidate`: local and remote checks are ready, but no release command has run.
- `blocked-publish`: a manual publish attempt failed and the package is not visible.
- `tag-retarget`: a tag target and corrected release commit differ, so the exact corrective
  action needs maintainer review.
- `npm-published`: npm package evidence exists, but GitHub release evidence is still missing.
- `github-release-published`: npm and GitHub release evidence exist, but local cursor, plan, or
  handoff evidence is not complete yet.
- `released`: npm evidence, GitHub release evidence, local validation, and handoff evidence all
  exist.

## Partial Release Rule

When a release is blocked or partially released, stop and record facts:

- what command or manual step ran,
- what external artifact exists or does not exist,
- which commit, tag, package version, and release name were observed,
- what validation is fresh,
- what exact maintainer approval would be needed before the next release action.

Do not delete tags, unpublish packages, overwrite releases, move tags, or retry publish commands
as a default recovery step. Corrective release actions require explicit maintainer approval for
the exact action being taken.

## Evidence Fixtures

The examples in `harness/fixtures/release-lifecycle/` are deterministic cursor-state fixtures.
They do not perform network checks. In a real release, remote verification still needs fresh
operator evidence before claiming a package or GitHub release is available.
