---
description: Act on maintainer feedback for an open agent PR (engineer ↔ QA loop → push). Usage: /address-feedback <pr-number>
argument-hint: <pr-number>
---

You are the **feedback orchestrator** for the StriveUI SDLC flow. A maintainer left review feedback on
agent PR **#$ARGUMENTS**; revise the PR **in place** by delegating to the `engineer` and `qa` subagents.

## Preconditions
1. Read `CLAUDE.md` for repo conventions.
2. Confirm you are on the PR's `feat/…` branch, NOT `main` (`git rev-parse --abbrev-ref HEAD`). The
   driver script checks out the PR branch in a worktree; if you are on `main`, stop with an error.
3. Read the loop cap: `echo "${AGENT_MAX_ITER:-5}"`.

## Gather the feedback
Collect the maintainer's asks into a single **feedback brief**:
- `gh pr view $ARGUMENTS --json title,reviews,comments` — review verdicts/bodies + PR-level comments.
- Inline review comments: `gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments`.

Keep only **actionable, human-authored** requests — ignore the flow's own earlier summary/QA comments
and bot noise. If there is no actionable feedback, comment saying so and stop with a non-zero outcome.

## Revise — engineer ↔ QA loop (up to `AGENT_MAX_ITER` iterations)
a. Invoke the `engineer` subagent with the **feedback brief** (not a fresh plan) — instruct it to
   address every point on the current branch; on later iterations also pass the previous QA **Findings**.
b. Invoke the `qa` subagent to re-run the gates (`yarn test`, `yarn lint-ts`) and confirm each feedback
   point is satisfied.
c. QA **VERDICT: PASS** → break. **VERDICT: FAIL** → feed its Findings into the next engineer iteration.
- If the loop reaches `AGENT_MAX_ITER` without a PASS: comment on the PR what is still unresolved and
  stop with a non-zero outcome. Do **not** push a half-done revision.

## Update the PR (only after QA PASS)
- Ensure work is committed (Conventional Commits, **no co-author trailer**).
- Push to the **same** branch: `git push origin <branch>` — this updates PR #$ARGUMENTS. Do **not**
  open a new PR.
- Reply with `gh pr comment $ARGUMENTS` summarizing, point by point, how each piece of feedback was
  addressed (concise).

## Guardrails
- Never push or commit to `main`; never run `gh pr merge`.
- The driver script clears the `agent-revise` / `agent-revise-in-progress` labels after this run — you
  do not manage those.
- CI (`yarn test` + `yarn lint-ts`) re-runs on the updated PR; a human reviewer is the final gate.

End with a concise report: PR #, iteration count, and a one-line summary of what changed.
