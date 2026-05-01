# Future Release Preparation Guard

Use this document only after the maintainer explicitly asks to prepare a specific future release.
It is documentation only; it does not authorize Codex, CI, scripts, or any automation to bump a
version, tag, publish, merge, deploy, or create a GitHub release.

## Required Inputs

Before preparation starts, the maintainer must name:

- target version, such as `<target-version>`,
- intended release notes file,
- expected package version after any separately approved version bump,
- expected tag name, such as `v<target-version>`,
- whether the preparation is for npm, GitHub release, or both.

If any input is missing, stop and record a blocker.

## Read First

Review these files before any future release preparation:

- `docs/project-status.md`
- `docs/release-checklist.md`
- the execution plan for the target version
- the readiness note or release notes file for the target version

Do not treat a readiness note, passing CI run, package dry-run, or completed maintenance plan as
release authorization.

## Preparation Checks

Use read-only checks first:

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git ls-remote origin refs/heads/main refs/tags/v<target-version>
gh run list --repo YSCJRH/encourage-loop --branch main --limit 10
npm view encourage-loop versions --json
npm pack --dry-run
node bin/encourage.js validate
```

Stop if the worktree is dirty, the branch is not `main`, local `HEAD` differs from `origin/main`,
the target tag already exists unexpectedly, current `HEAD` does not have passing CI, validation
fails, or package contents do not match the intended surface.

## Version Boundary

Package metadata remains at the current checked-in version unless a target-version execution plan
or release-preparation addendum explicitly authorizes a version bump. Do not run `npm version`,
custom release scripts, or package publish tooling as a shortcut.

If a version bump is separately authorized, it must be reviewed as a normal code change, validated,
committed, pushed, and checked in CI before any tag or publish command is considered.

## Manual Release Actions

Only after fresh maintainer confirmation for the exact target version, release actions may proceed
one command at a time.

Each confirmation covers exactly one command. Do not combine commands with `&&`, `;`, scripts,
force flags, or automatic release tools.

Nominal command template:

```bash
git tag v<target-version>
git push origin v<target-version>
npm publish
gh release create v<target-version> --title "v<target-version>" --notes-file <approved-notes-file>
```

If any command fails, stop. Record the exact output, release state, and blocker. Do not delete a
tag, retarget a tag, unpublish, force-push, or retry with force flags unless the maintainer
separately approves that exact corrective action.

## Release Recovery

Release recovery starts from evidence, not from another write command. Treat any failed release
command as a partial release until read-only checks prove otherwise. A common partial release is
where the tag exists but npm or GitHub release is incomplete.

Distinguish npm authentication failures from publish authorization failures:

- `E401` means the local npm CLI identity is not authorized. Re-authenticate with
  `npm login --auth-type=web`, then verify `npm whoami` before retrying any publish command.
- `EOTP` means npm accepted the identity but requires a publish-time OTP. The OTP is manual,
  short-lived, and should be supplied only for the single publish command being retried.

Before retrying anything, run read-only checks and compare them with the target execution plan:

```bash
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/tags/v<target-version>
npm view encourage-loop versions --json
npm view encourage-loop dist-tags --json
npm view encourage-loop@<target-version> version dist.tarball --json
gh release view v<target-version>
node bin/encourage.js validate
```

Record the exact output, release state, and blocker before stopping or proceeding. If the npm
package is published but the GitHub release is missing, verify the npm tarball and dist-tag before
creating the GitHub release. If the tag exists but npm is missing, verify the tag target and package
metadata before retrying publish.

Do not delete tags, retarget tags, force-push, unpublish, or retry publish unless the maintainer
has reviewed the read-only evidence and given explicit maintainer approval for that exact action.
If the intended corrective action is unclear, stop and keep the cursor blocked with the observed
state.

## Post-Release Evidence

After a successful manual release, verify and record:

```bash
npm view encourage-loop@<target-version> version dist.tarball --json
gh release view v<target-version> --repo YSCJRH/encourage-loop --json tagName,name,isDraft,isPrerelease,url,publishedAt,targetCommitish
git status --short --branch
node bin/encourage.js validate
node bin/encourage.js handoff
```

Then update `docs/project-status.md`, the target execution plan, docs contract tests, and
`.encourage/` evidence before starting post-release work.
