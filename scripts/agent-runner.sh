#!/usr/bin/env bash
#
# StriveUI SDLC agent runner — triggers the plan → engineer↔QA loop → PR flow for
# GitHub issues labeled "agent-ready", running Claude Code locally (subscription auth).
#
# Each issue is processed in its own DISPOSABLE git worktree, so multiple issues can be
# worked on in parallel without colliding and your main checkout is never touched.
#
# Usage:
#   ./scripts/agent-runner.sh <issue#>     Run the SDLC flow for one specific issue (foreground)
#   ./scripts/agent-runner.sh              Run the next open "agent-ready" issue (foreground)
#   ./scripts/agent-runner.sh --all        Drain all "agent-ready" issues in parallel, then exit
#   ./scripts/agent-runner.sh --watch [s]  Poll every [s] seconds (default 300), keeping up to
#                                          AGENT_CONCURRENCY issues in flight at once
#
# Env:
#   AGENT_CONCURRENCY   Max issues processed in parallel in --all/--watch (default 3)
#   AGENT_MAX_OPEN_PRS  Cap on open SDLC PRs (labeled agent-pr) + in-flight issues (default 5).
#                       New pickups pause once this many are awaiting review; an explicit
#                       `<issue#>` run overrides the cap.
#   AGENT_MAX_ITER      Max engineer↔QA iterations per issue before giving up (default 5)
#   AGENT_PR_REVIEWER   GitHub login to request review from on the PR (optional)
#   AGENT_YOLO=1        Skip permission prompts (--dangerously-skip-permissions). Safe-ish because
#                       each run executes in an isolated worktree; use if a run stalls on prompts.
#   CLAUDE_CODE_OAUTH_TOKEN  Subscription auth for headless Claude Code (from `claude setup-token`).
#
set -euo pipefail

READY_LABEL="agent-ready"
WIP_LABEL="agent-in-progress"
DONE_LABEL="agent-done"
FAIL_LABEL="agent-failed"
PR_LABEL="agent-pr"
BASE_BRANCH="main"

REPO_ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")/.." rev-parse --show-toplevel)"
cd "$REPO_ROOT"

WORKTREE_ROOT="${REPO_ROOT}/.agent-worktrees"
LOG_DIR="${WORKTREE_ROOT}/logs"
CONCURRENCY="${AGENT_CONCURRENCY:-3}"
MAX_OPEN_PRS="${AGENT_MAX_OPEN_PRS:-5}"

log() { printf '\033[1;34m[agent-runner]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[agent-runner]\033[0m %s\n' "$*" >&2; }

claude_flags=(--permission-mode acceptEdits)
[ "${AGENT_YOLO:-}" = "1" ] && claude_flags=(--dangerously-skip-permissions)

# Lowest-numbered open agent-ready issue that isn't already in progress/done/failed.
pick_next() {
  gh issue list --label "$READY_LABEL" --state open --json number,labels \
    --jq "[.[] | select(([.labels[].name]
             | (index(\"$WIP_LABEL\") or index(\"$DONE_LABEL\") or index(\"$FAIL_LABEL\"))) | not)]
          | sort_by(.number) | .[0].number // empty"
}

# Backpressure: how much SDLC work is already awaiting review — open flow PRs (labeled agent-pr)
# plus issues currently in flight (which will become PRs). Keeps open PRs from exceeding the cap.
sdlc_active_count() {
  local prs wip
  prs="$(gh pr list --state open --label "$PR_LABEL" --json number --jq 'length' 2>/dev/null || echo 0)"
  wip="$(gh issue list --state open --label "$WIP_LABEL" --json number --jq 'length' 2>/dev/null || echo 0)"
  echo $(( prs + wip ))
}

# Claim the next issue by tagging it in-progress (so parallel schedulers don't double-pick it).
claim_next() {
  local n; n="$(pick_next)"
  [ -z "$n" ] && return 1
  gh issue edit "$n" --add-label "$WIP_LABEL" >/dev/null 2>&1 || true
  echo "$n"
}

# Full SDLC for one already-claimed issue, in a disposable worktree. Safe to run in the background.
process_issue() {
  local issue="$1"
  local title slug branch worktree rc

  title="$(gh issue view "$issue" --json title --jq '.title')"
  slug="$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g' | cut -c1-40)"
  branch="feat/issue-${issue}-${slug}"
  worktree="${WORKTREE_ROOT}/issue-${issue}"

  log "#${issue} → ${branch} — ${title}"

  git fetch origin "$BASE_BRANCH" --quiet
  git worktree remove "$worktree" --force >/dev/null 2>&1 || true
  git worktree add -B "$branch" "$worktree" "origin/${BASE_BRANCH}" >/dev/null

  set +e
  ( cd "$worktree" && \
      AGENT_MAX_ITER="${AGENT_MAX_ITER:-5}" AGENT_PR_REVIEWER="${AGENT_PR_REVIEWER:-}" \
      claude "${claude_flags[@]}" -p "/implement-issue ${issue}" )
  rc=$?
  set -e

  git worktree remove "$worktree" --force >/dev/null 2>&1 || true

  if [ "$rc" -eq 0 ]; then
    log "#${issue} completed."
    gh issue edit "$issue" --remove-label "$WIP_LABEL" --add-label "$DONE_LABEL" >/dev/null 2>&1 || true
  else
    err "#${issue} failed (exit ${rc})."
    gh issue edit "$issue" --remove-label "$WIP_LABEL" --add-label "$FAIL_LABEL" >/dev/null 2>&1 || true
  fi
  return "$rc"
}

# ---- parallel scheduler ----
PIDS=()
reap() { local p alive=(); for p in "${PIDS[@]:-}"; do [ -n "$p" ] && kill -0 "$p" 2>/dev/null && alive+=("$p"); done; PIDS=("${alive[@]:-}"); }
count() { reap; printf '%s' "${#PIDS[@]}"; }

launch() {
  local issue="$1" logf="${LOG_DIR}/issue-${1}.log"
  log "Launching #${issue} in parallel (log: ${logf})"
  ( process_issue "$issue" ) >"$logf" 2>&1 &
  PIDS+=("$!")
}

schedule() {
  local mode="$1" interval="${2:-300}"
  mkdir -p "$LOG_DIR"
  log "Parallel scheduler: up to ${CONCURRENCY} concurrent issues (mode: ${mode})."
  while true; do
    while [ "$(count)" -lt "$CONCURRENCY" ]; do
      if [ "$(sdlc_active_count)" -ge "$MAX_OPEN_PRS" ]; then
        log "Cap reached: ${MAX_OPEN_PRS} SDLC PRs/in-flight open — pausing new pickups until some merge/close."
        break
      fi
      local n; n="$(claim_next)" || break
      launch "$n"
    done
    if [ "$mode" = "once" ]; then
      [ "$(count)" -eq 0 ] && [ -z "$(pick_next)" ] && break
      sleep 3
    else
      [ "$(count)" -eq 0 ] && log "No ready issues; waiting ${interval}s."
      sleep "$interval"
    fi
  done
  wait
  log "Scheduler drained."
}

# ---- arg dispatch ----
case "${1:-}" in
  --watch) schedule watch "${2:-300}" ;;
  --all)   schedule once ;;
  "" )
    if [ "$(sdlc_active_count)" -ge "$MAX_OPEN_PRS" ]; then
      log "Cap reached: ${MAX_OPEN_PRS} open SDLC PRs/in-flight. Not picking up more (merge some first)."
      exit 0
    fi
    next="$(claim_next)" || { log "No open '${READY_LABEL}' issues to pick up."; exit 0; }
    process_issue "$next"
    ;;
  * )
    [ "$(sdlc_active_count)" -ge "$MAX_OPEN_PRS" ] && \
      log "Note: at/over the ${MAX_OPEN_PRS}-PR cap — running #$1 anyway as an explicit override."
    gh issue edit "$1" --add-label "$WIP_LABEL" >/dev/null 2>&1 || true
    process_issue "$1"
    ;;
esac
