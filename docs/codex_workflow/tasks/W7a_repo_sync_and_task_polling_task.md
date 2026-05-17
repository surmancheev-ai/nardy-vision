# W7a — repo sync and task polling helper

Owner context: ChatGPT can now create GitHub PRs, but the Codex workspace did not see the merged W7 task. The likely blocker is that the local/production workspace is not synced with GitHub main, or it points to a different remote/branch.

## Goal

Make Codex able to consume tasks created by ChatGPT through GitHub, and add a safe repo-level helper script for detecting pending workflow tasks.

## Safety rules

- Do not print or store secrets, tokens, private keys, environment values, raw user data, or raw provider payloads.
- Do not run deploy, restart, live search, or live providers.
- Do not change production systemd/nginx.
- Do not change Telegram runtime behavior.
- This stage is workflow/tooling only.

## Required first step: repo sync diagnosis

Run in the Codex workspace and, if relevant, production workspace:

```bash
pwd
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git rev-parse HEAD
git fetch origin main
git rev-parse origin/main
git status --short
```

Then verify whether this file exists after sync:

```bash
ls -la docs/codex_workflow/tasks/W7_web_real_search_integration_task.md
```

If the local workspace is behind GitHub main and has no conflicting changes, update it safely using the repository's normal workflow. If there are local uncommitted changes, do not overwrite them; report the exact safe blocker.

## Task polling helper

Create a conservative helper script, for example:

- `scripts/codex_task_check.py`

The script should:

1. Read `docs/codex_workflow/state.yaml` if present.
2. List task files in `docs/codex_workflow/tasks/`.
3. Print the latest pending/proposed task path in a human-readable way.
4. Never execute Codex automatically.
5. Never deploy/restart/call providers.
6. Never print secrets or environment values.
7. Exit 0 when a task is found and 2 when no task is found.

Optional but useful:

- Support `--json` output.
- Support `--tasks-dir` and `--state` arguments for local testing.
- Include clear output telling the operator what command/file Codex should use next.

## Documentation

Create/update:

- `docs/codex_workflow/task_polling.md`

Document:

- current problem;
- how ChatGPT creates task PRs;
- why Codex must sync repo before reading tasks;
- how to run the helper manually;
- safe future cron/systemd timer idea, detection only;
- limitation: the helper detects tasks but does not autonomously run Codex unless a separate Codex CLI/API is explicitly available and approved.

## Tests/checks

Run:

```bash
PYTHONPATH=. python -m compileall scripts
python scripts/codex_task_check.py || true
python scripts/codex_task_check.py --json || true
git diff --check
```

Run a sensitive pattern scan over new/modified workflow docs/scripts.

## Expected report

- Stage: W7a repo sync and task polling helper
- Git remote/branch/HEAD summary
- Whether W7 task is visible after sync
- Files changed
- Helper script path
- Helper output examples
- Tests/checks results
- Safety confirmation: no deploy/restart/live search/live providers/secrets
- Next recommended action: run W7 from `docs/codex_workflow/tasks/W7_web_real_search_integration_task.md` once the workspace is synced
