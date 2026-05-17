# W7c — fresh clone for GitHub-based workflow

Owner approval:

> W7b принят. Подтверждаю W7c fresh clone для GitHub-based workflow, текущий workspace не трогать.

## Goal

Create and verify a separate fresh clone of `surmancheev-ai/nardy-vision` for future GitHub-based Codex workflow, without touching or overwriting the current dirty Codex workspace.

## Context

Current Codex workspace is local-only:

- path: `C:\Users\PC-Sergey\Documents\CodexProject\radar`
- branch: `master`
- remote: not configured
- many W-stage local modified/untracked files

ChatGPT creates task PRs in GitHub, but the current workspace cannot see them. The safer path is a separate fresh clone.

## Hard safety rules

- Do not modify, reset, pull, or clean the current workspace.
- Do not overwrite local W-stage changes.
- Do not deploy/restart/run live search/call live providers.
- Do not change `.env`, provider config, quota, beta access, systemd, nginx, or Telegram runtime.
- Do not print secrets, tokens, environment values, raw user data, or raw provider payloads.
- This stage is workflow/bootstrap only.

## Tasks

1. Choose a separate clone path outside the existing workspace, for example:
   - `C:\Users\PC-Sergey\Documents\CodexProject\radar-github`

2. Before cloning, confirm current workspace remains untouched:

```bash
pwd
git rev-parse --show-toplevel
git status --short --branch
git remote -v
```

3. Create fresh clone in the separate path:

```bash
git clone https://github.com/surmancheev-ai/nardy-vision.git C:\Users\PC-Sergey\Documents\CodexProject\radar-github
```

If clone path exists, do not overwrite it. Report and stop unless it is clearly safe.

4. Verify fresh clone:

```bash
cd C:\Users\PC-Sergey\Documents\CodexProject\radar-github
git branch --show-current
git remote -v
git rev-parse HEAD
ls -la docs/codex_workflow/tasks
ls -la docs/codex_workflow/results
python scripts/codex_task_check.py || true
python scripts/codex_task_check.py --json || true
```

5. Confirm the following task files are visible in fresh clone:

- `docs/codex_workflow/tasks/W7_web_real_search_integration_task.md`
- `docs/codex_workflow/tasks/W7a_repo_sync_and_task_polling_task.md`
- `docs/codex_workflow/tasks/W7b_safe_remote_sync_plan_task.md`
- `docs/codex_workflow/tasks/W7c_fresh_clone_github_workflow_task.md` if this PR has been merged before running

6. Create a result file in the original workspace, not by modifying the fresh clone unless explicitly safe:

- `docs/codex_workflow/results/W7c_fresh_clone_github_workflow_result.md`

Include:

- fresh clone path;
- whether clone succeeded;
- remote/branch/HEAD in fresh clone;
- task files visible yes/no;
- current workspace untouched yes/no;
- recommended next action.

7. Update workflow docs in the current workspace only if safe:

- `docs/codex_workflow/state.yaml`
- `docs/codex_workflow/approvals.md`
- `docs/COORDINATOR_HANDOFF.md`

If unsafe or confusing due stale state, document instead of editing.

8. Checks:

```bash
PYTHONPATH=. python -m compileall scripts
python scripts/codex_task_check.py || true
python scripts/codex_task_check.py --json || true
git diff --check
```

Run a sensitive scan over new/modified docs/scripts.

## Expected report

- Stage: W7c fresh clone for GitHub-based workflow
- Current workspace path and confirmation it was not modified destructively
- Fresh clone path
- Clone success yes/no
- Fresh clone branch/remote/HEAD
- Task files visible in fresh clone yes/no
- Files changed in current workspace
- Any changes in fresh clone yes/no
- Checks results
- Safety confirmation
- Next recommended owner action: run W7 real search integration from the fresh clone if ready
