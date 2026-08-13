## 🤝 Contribution

In this guide we will provide you with all the relevant information for making contributions to this project.

### Types of Contributions

- **Opening issues:** Creating an issue for bug or a feature request; or just commenting how to we can make things better.
- **Commenting:** Leaving meaningful comments on existing issues and pull requests. Providing suggestions, trouble shooting, resolving issues or giving feedback.
- **PR Reviews:** Reviewing pull requests from other contributor like yourself. You may not have time to make your own pull requests but you could help someone else get one step closer to merging theirs.
- **Documentation:** Improving documentations and guide. Found something too hard to understand? or noticed some inconsistences or errors? Leave us a comment or open and issue/pull request to fix it.
- **Builds and Tests:** Improving build processes and tests/coverage. You think we could improve the way we build or test our components and sites? Kindly leave a suggestion.
- **Code changes:** You found a bug you'd like to fix or your have a feature/component you'd like to add? Raise a pull request and we'll get right to you.

### Code contribution guidelines

#### Branching model

- Feature branches should be prefixed with `feat/`.
- Bugfix branches should be prefixed with `bug/`.
- Documentation branches should be prefixed with `doc/`
- Build/test branches should be prefixed with `mnt/`
- After the prefix include a short description of what your branch is dedicated for. For example: `bug/fix-everything-that-was-broken`.
- If there's an issue filed that your branch is addressing, include the issue number directly after the prefix. For example: `bug/1234-fix-all-the-other-things`.

#### Committing

- Break your commits into logical atomic units. Well-segmented commits make it much easier for others to step through your changes.
- Limit your subject line to 69 characters as GitHub will truncates subjects more than 70 characters.
- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't use GitHub's magic words in your commits to close issues - do that in the pull request body instead.

Read [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guide before creating your first commit.

#### Commit linting

Commit messages are enforced with [commitlint](https://commitlint.js.org/), configured in
`commitlint.config.js` against `@commitlint/config-conventional`. This is checked in two places:

- **Locally**, via a husky `commit-msg` git hook (`.husky/commit-msg`). The hook is installed
  automatically the first time you run `yarn install` (it runs the `prepare` script), so you don't
  need to set anything up manually.
- **In CI**, via the `commitlint` job in `.github/workflows/pr.yaml`, which lints every commit on a
  pull request. Even if a local hook is bypassed (e.g. `--no-verify`), a non-conforming commit will
  fail CI.

Allowed commit types (from `@commitlint/config-conventional`): `feat`, `fix`, `docs`, `style`,
`refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. The header (type + optional scope +
subject) must also stay within **69 characters**, matching the subject-line limit above — this is
enforced by the `header-max-length` rule in `commitlint.config.js`.

#### Versioning & changelogs (Changesets)

This repo uses [Changesets](https://github.com/changesets/changesets) to manage version bumps and
`CHANGELOG.md` entries.

- Whenever your PR includes a user-facing change (new component, behavior change, bug fix, etc.),
  run `yarn changeset` and follow the prompts to describe the change and pick a bump type. Commit the
  generated `.changeset/*.md` file alongside your code changes.
- The package is still pre-1.0 (`0.1.0-alpha.x`), so per [0.x semver](https://semver.org/#spec-item-4)
  conventions, breaking changes are recorded as **minor** or **patch** bumps rather than major —
  there is no stable major version to protect yet.
- Purely internal changes (tooling, CI, docs, tests) generally don't need a changeset unless they
  affect what's published to npm.
- `yarn version-packages` (`changeset version`) consumes pending changesets to bump the version and
  update `CHANGELOG.md`. This is run by a maintainer, not on every PR.
- **Publishing to npm is not yet automated.** There is no release workflow wired up (it needs an
  `NPM_TOKEN` secret); for now a maintainer runs `yarn release` (`changeset publish`) manually once a
  version bump has been merged.

#### Making pull requests

- Summarize your changes in the PR body. When in doubt, write a list things .
- Include references to issues that your PR solves, and use GitHub's magic words to close the issues automatically when your PR is merged. Please add the references in the PR body and not the title.
- Include tests that cover new or changed functionality.
