---
description: Run the full SDLC (plan → engineer ↔ QA loop → PR) for a GitHub issue. Usage: /implement-issue <issue-number>
argument-hint: <issue-number>
---

You are the **SDLC orchestrator** for the StriveUI library. Take GitHub issue **#$ARGUMENTS** from
plan to a review-ready pull request by delegating to the `planner`, `engineer`, and `qa` subagents.

## Preconditions
1. Read `CLAUDE.md` for repo conventions.
2. Confirm you are on a `feat/…` branch, NOT `main` (`git rev-parse --abbrev-ref HEAD`). If on `main`,
   stop with an error — the driver script is responsible for creating the worktree/branch.
3. Read the loop cap: `echo "${AGENT_MAX_ITER:-5}"`. Read the reviewer: `echo "${AGENT_PR_REVIEWER:-}"`.
4. Fetch the issue: `gh issue view $ARGUMENTS --json title,body,labels`.

## Pipeline
1. **Plan.** Invoke the `planner` subagent with the issue title + body. Capture its plan.
   - If the planner reports a **Blocker** (e.g. depends on an unbuilt primitive), do NOT implement.
     Comment the blocker on the issue with `gh issue comment` and stop with a non-zero outcome.

2. **Engineer ↔ QA loop** (repeat up to `AGENT_MAX_ITER` iterations):
   a. Invoke the `engineer` subagent with the plan and, on iterations after the first, the previous
      QA **Findings**.
   b. Invoke the `qa` subagent to test and review the current state.
   c. If QA returns **VERDICT: PASS**, break the loop.
   d. If **VERDICT: FAIL**, feed its Findings into the next engineer iteration.
   - If the loop reaches `AGENT_MAX_ITER` without a PASS: do NOT open a PR. Comment a summary of the
     outstanding QA findings on the issue and stop with a non-zero outcome.

3. **Open the PR** (only after QA PASS):
   - Ensure work is committed (Conventional Commits, **no co-author trailer**).
   - Push the branch: `git push -u origin <branch>`.
   - Create a **non-draft** PR filling `.github/pull_request_template.md`: Description from the plan,
     QA section from QA's summary, `Closes #$ARGUMENTS`, and a "Deferred sub-tasks" note if the
     planner deferred any. Always add `--label agent-pr` (the runner counts these to cap how many
     flow PRs stay open at once). Add `--reviewer "$AGENT_PR_REVIEWER"` only if that value is non-empty.
   - Comment the PR link on the issue with `gh issue comment`.

## Guardrails
- Never push or commit to `main`; never run `gh pr merge` (auto-merge is disabled by policy).
- The existing "PR Check" CI workflow (`yarn test` + `yarn lint-ts`) is the automatic second gate on
  the PR; a human reviewer is the final gate.

End with a concise report: issue #, PR URL (or the reason no PR was opened), and iteration count.
