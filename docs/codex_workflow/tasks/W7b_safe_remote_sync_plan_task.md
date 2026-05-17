# W7b — safe remote/sync plan

Owner approval:

> W7a принят. Подтверждаю W7b safe remote/sync plan без pull/reset/overwrite.

## Context

Codex workspace is currently detached from the GitHub workflow:

- local branch: master
- git remote: not configured
- many local W-stage modified/untracked files
- ChatGPT can create GitHub PRs in `surmancheev-ai/nardy-vision`, but Codex cannot see merged task files locally

## Goal

Prepare a safe, non-destructive remote/sync plan so the Codex workspace can eventually consume ChatGPT-created task files from GitHub without losing local W-stage changes.

## Hard safety rules

- Do not run `git pull`.
- Do not run `git reset`.
- Do not run destructive checkout.
- Do not overwrite local changes.
- Do not deploy, restart, run live search, or call live providers.
- Do not change `.env`, provider config, quota, beta access, systemd, nginx, or Telegram runtime.
- Do not print secrets, tokens, environment values, raw user data, or raw provider payloads.
- This stage is planning/diagnostics only, unless a command is explicitly read-only.

## Tasks

1. Re-run workspace diagnostics and save a concise summary in the result file:

```bash
pwd
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git branch --show-current
git rev-parse HEAD
git log --oneline -5
python scripts/codex_task_check.py || true
python scripts/codex_task_check.py --json || true
```

2. Create a safe sync plan document:

- `docs/codex_workflow/safe_remote_sync_plan.md`

It must include:

- current local state;
- current GitHub target repo: `surmancheev-ai/nardy-vision`;
- why direct pull is unsafe now;
- exact pre-sync backup steps;
- exact read-only comparison steps;
- exact remote setup command, but marked as owner-approved future action, not executed in this stage unless explicitly safe and approved;
- options for reconciliation:
  - archive local workspace then fresh clone;
  - add remote and fetch only;
  - create local safety branch before any merge;
  - manually copy selected GitHub task files;
  - use patches/cherry-pick only after review;
- recommended safest path.

Recommended default should likely be:

A. Keep current local workspace untouched.
B. Create a fresh clone of `surmancheev-ai/nardy-vision` in a separate directory.
C. Compare/copy only needed runtime/project changes deliberately.
D. Use fresh clone for future GitHub-based workflow once verified.

3. Create an operator checklist:

- `docs/codex_workflow/safe_remote_sync_checklist.md`

It should contain step-by-step commands for owner/admin, but no destructive command should be run automatically.

4. Update workflow files if safe:

- `docs/codex_workflow/results/W7b_safe_remote_sync_plan_result.md`
- `docs/codex_workflow/state.yaml`
- `docs/codex_workflow/approvals.md`
- `docs/COORDINATOR_HANDOFF.md`

If updating state is risky because local state is stale, document the risk and make minimal additive updates only.

5. Add next proposal:

- `docs/codex_workflow/proposals/W7c_safe_fresh_clone_or_remote_fetch_proposal.md`

W7c should be the first stage that actually creates a fresh clone or configures remote/fetch, only after owner approval.

## Checks

Run:

```bash
PYTHONPATH=. python -m compileall scripts
python scripts/codex_task_check.py || true
python scripts/codex_task_check.py --json || true
git diff --check
```

Run sensitive scan over new/modified docs/scripts.

## Expected report

- Stage: W7b safe remote/sync plan
- Workspace diagnostics summary
- Remote configured: yes/no
- Local changes present: yes/no
- Files changed
- Recommended sync path
- Whether any remote/pull/fetch was executed: must be no unless explicitly owner-approved and non-destructive
- Checks results
- Safety confirmation
- Next recommended owner action
