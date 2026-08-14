# Running the SDLC agent runner unattended

Two ways to keep `scripts/agent-runner.sh` running without you: a **systemd user service**
(recommended) or **cron**. Both need the same one-time secret/config setup.

The runner still respects every guardrail — disposable per-issue worktrees, the 5-PR cap
(`AGENT_MAX_OPEN_PRS`), no pushes to `main`, no auto-merge. Your only job stays reviewing the PRs it opens.

Besides picking up `agent-ready` issues, the same runner also drains `agent-revise`-labeled PRs
(review feedback on an already-open `agent-pr` PR) via `--feedback` mode — `--watch`/`--all` pick
these up automatically alongside issues, interleaved ahead of new issue pickups.

## 0. One-time setup (both approaches)

```bash
cd <your clone of strive-ui.io>
cp scripts/systemd/agent-runner.env.example scripts/systemd/agent-runner.env
chmod 600 scripts/systemd/agent-runner.env
$EDITOR scripts/systemd/agent-runner.env   # set PATH (token usually not needed — see below)
```

- **Auth — usually nothing to do.** If you've already logged in with `claude` as this user, it's
  stored in `~/.claude/.credentials.json` (mode 600, auto-refreshed) and a **user** systemd service
  reuses it. Leave `CLAUDE_CODE_OAUTH_TOKEN` unset. Only set it (from `claude setup-token`) on a
  machine with no interactive login — CI, a container, or a different service user. Verify your
  headless auth works with: `env -i HOME="$HOME" PATH="$PATH" claude -p "say hi"`.
- `PATH` **matters**: services start with a minimal PATH. Run `which claude gh yarn git node` and make
  sure every one of those dirs is in the `PATH=` line. The `agent-runner.env` file is gitignored.
- Use the **`systemctl --user`** units below (not a system-level unit) so the runner runs as you and
  can read `~/.claude`.

## A. systemd user service (recommended)

Pick **one** of the two modes below.

### A1. Watch daemon (one long-lived process)

```bash
# Point the unit at your clone (replace the placeholder in-place):
REPO="$(pwd)"
sed "s#REPLACE_WITH_REPO_PATH#${REPO}#g" scripts/systemd/strive-agent-runner.service \
  > ~/.config/systemd/user/strive-agent-runner.service

systemctl --user daemon-reload
systemctl --user enable --now strive-agent-runner.service

# Keep it running even when you're not logged in:
loginctl enable-linger "$USER"

# Watch it:
systemctl --user status strive-agent-runner.service
journalctl --user -u strive-agent-runner.service -f
```

### A2. Timer + drain-once (no long-lived process)

```bash
REPO="$(pwd)"
for u in strive-agent-runner-oneshot.service strive-agent-runner.timer; do
  sed "s#REPLACE_WITH_REPO_PATH#${REPO}#g" "scripts/systemd/$u" > ~/.config/systemd/user/"$u"
done

systemctl --user daemon-reload
systemctl --user enable --now strive-agent-runner.timer
loginctl enable-linger "$USER"

systemctl --user list-timers strive-agent-runner.timer
journalctl --user -u strive-agent-runner-oneshot.service -f
```

Stop / remove either mode with `systemctl --user disable --now <unit>`.

## B. cron

cron gives you no PATH and no env, so source the env file and use absolute paths. `--all` drains the
queue and exits, which is what you want on a schedule:

```cron
# every 15 minutes — edit the path to your clone
*/15 * * * * cd /REPLACE/WITH/PATH/TO/strive-ui.io && set -a && . scripts/systemd/agent-runner.env && set +a && ./scripts/agent-runner.sh --all >> /tmp/strive-agent-runner.log 2>&1
```

## Notes

- **One approach at a time** — don't run the watch daemon *and* the timer; they'd double-pick (the
  in-progress label mostly prevents collisions, but it's wasteful).
- Logs per issue are also written under `.agent-worktrees/logs/issue-<n>.log` in the repo.
- Rotate `CLAUDE_CODE_OAUTH_TOKEN` if it ever leaks; update `agent-runner.env` and restart the unit.
