# v0.1 Manual Release Checklist

This checklist is for the maintainer who decides whether EncourageLoop v0.1.0 should be
released. It is documentation only; it does not authorize Codex, CI, or any automation to tag,
publish, merge, deploy, or create a GitHub release.

## Release Gate

Before any release action, confirm:

- the repository is on `main`,
- the working tree is clean,
- the latest GitHub Actions CI run passed,
- local package dry-run evidence has been reviewed,
- the package contents match the intended MVP surface,
- no daemon, MCP server, app-server, desktop overlay, keyboard injection, LLM judge, network
  feature, automatic steer, automatic merge, or automatic release was added.

## Evidence To Review

Use these read-only checks to inspect the current candidate:

```bash
git status --short --branch
git log -1 --oneline --decorate
gh run list --repo YSCJRH/encourage-loop --branch main --limit 3
npm pack --dry-run
node bin/encourage.js validate
```

For the current candidate, the known passing evidence is:

- `npm ci`: passed in CI.
- `npm test`: passed locally and in CI.
- `npm run lint`: passed locally and in CI.
- `node harness/scripts/run-harness.js`: passed locally and in CI.
- `npm pack --dry-run`: passed locally and in CI.
- `node bin/encourage.js validate`: passed locally with GREEN/no warnings.

## Manual Release Actions

Only after explicit maintainer confirmation, the maintainer may choose to run release commands
manually from a clean `main` checkout.

Each confirmation covers only one command. Do not combine commands with `&&`, `;`, release
scripts, force flags, or automatic publish tooling.

Nominal sequence:

```bash
git tag v0.1.0
git push origin v0.1.0
npm publish
gh release create v0.1.0 --title "v0.1.0" --notes-file docs/v0.1-readiness-review.md
```

If any command fails, stop and record the blocker. Do not retry with force flags unless the
maintainer has separately reviewed and approved the exact corrective action.

## Actual v0.1.0 Path

The completed v0.1.0 release followed the manual-only path with these notable facts:

- npm authentication had to be completed by the maintainer on this machine.
- npm two-factor authentication was required before `npm publish` could succeed.
- `npm publish` exposed package manifest normalization, so the bin path was fixed before publish.
- the `v0.1.0` tag was retargeted only after explicit maintainer approval of that exact action.
- npm publication and GitHub release creation were run manually.
- post-release evidence was recorded in `.encourage/`, the execution plan, and readiness notes.

This history is evidence, not standing permission to retarget tags, force-push, publish, or create
GitHub releases. Future release actions require fresh maintainer confirmation.

## After Release

After a successful manual release:

- verify the published package page,
- verify the GitHub release page,
- update `.encourage/` with release evidence,
- update the execution plan status to `released`,
- start a new plan before adding any post-v0.1 runtime scope.
