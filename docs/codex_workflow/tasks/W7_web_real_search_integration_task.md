# W7 — web real search integration

Owner approval:

> Trusted beta откладываем. Подтверждаю W7 web real search integration до тестирования.

## Goal

Make the WEB-first PublicTrace product useful before beta testing: the web UI/API must run the existing real search/report pipeline instead of only the null-provider preview.

Current public web URL: http://72.56.235.237/publictrace/

## Safety rules

- Trusted beta is paused until real web search works.
- Wider beta remains closed.
- Do not change or restart the Telegram bot service.
- Reuse the existing core pipeline; do not rewrite it.
- Do not use prohibited sources such as breach/leak databases, phonebook/contact-book sources, closed social sources, auth/CAPTCHA bypass, or search-engine HTML scraping.
- Do not collect, store, log, or show phone, email, home address, documents, exact date of birth, relatives, or children data.
- Do not log raw user input or raw provider payloads.
- Do not expose internal tracebacks or debug details in UI/API.
- User-facing reports may only use the generic safety notice: «Некоторые источники или данные были исключены по правилам безопасности и приватности.»
- Do not print environment values or credentials.

## Required reads

- docs/operations/publictrace_codex_standing.md
- docs/operations/publictrace_codex_ssh_access.md
- docs/COORDINATOR_HANDOFF.md
- docs/operations/publictrace_web_transition_plan.md
- docs/operations/publictrace_web_deploy_plan.md
- docs/codex_workflow/results/W6f_trusted_beta_web_rollout_result.md
- docs/codex_workflow/proposals/W6g_beta_feedback_review_iteration_proposal.md
- docs/codex_workflow/state.yaml
- docs/codex_workflow/approvals.md

## Tasks

1. Inspect the real pipeline.
   - Identify the canonical real search entrypoint.
   - Identify its required inputs and safe output object.
   - Identify where Telegram currently calls real search.
   - Decide how web can reuse core without Telegram coupling.

2. Implement web real search mode.
   - Keep input_quality validation.
   - Reject forbidden/sensitive requests safely.
   - Valid web request should call the existing real pipeline.
   - Render only safe report content.
   - Keep null-provider mode as dev/fallback.
   - Preserve /publictrace prefix support.
   - Preserve beta session/report limit behavior unless there is a clear documented reason.
   - Keep Telegram behavior unchanged.

3. Add explicit mode control.
   - dev/test null-provider mode;
   - real provider mode for production when existing config is available;
   - safe disabled/error state when config is unavailable;
   - document how to enable and disable web real search.

4. Add tests with fakes/mocks, not live providers.
   - fake pipeline is called from web adapter;
   - forbidden/sensitive input is rejected;
   - provider exception becomes safe UI/API error;
   - null-provider fallback still works;
   - prefix-aware UI still works;
   - Telegram regression tests still pass.

5. Run safe checks.
   - PYTHONPATH=. python -m compileall web osint tests
   - PYTHONPATH=. pytest tests/test_web_api.py tests/test_web_ui.py tests/test_web_access_feedback.py
   - PYTHONPATH=. pytest tests/test_search_input_quality_ux.py
   - core/safety/report tests used in prior stages
   - any new web real search tests
   - git diff --check
   - sensitive scan over changed files

6. Production deploy only if tests pass.
   - Deploy minimal changed web/core/docs/tests files.
   - Restart only user-level publictrace-web.service if needed.
   - Do not restart Telegram service.
   - Do not change nginx/systemd unless required.

7. Controlled smoke.
   - publictrace.service active
   - publictrace-web.service active
   - /publictrace/health -> 200
   - /publictrace/ -> 200
   - /publictrace/request -> 200
   - /publictrace/feedback -> 200
   - /publictrace/static/styles.css -> 200
   - one owner-approved safe real-search test through web only if allowed by safety rules
   - no Telegram live /search
   - no prohibited sources

8. Update workflow docs.
   - docs/codex_workflow/results/W7_web_real_search_integration_result.md
   - docs/codex_workflow/state.yaml
   - docs/codex_workflow/approvals.md
   - docs/COORDINATOR_HANDOFF.md
   - docs/operations/publictrace_web_transition_plan.md
   - docs/operations/publictrace_web_deploy_plan.md
   - docs/operations/publictrace_trusted_beta_instructions.md
   - docs/operations/publictrace_trusted_beta_checklist.md
   - docs/codex_workflow/proposals/W7b_real_web_search_beta_readiness_proposal.md

## Expected report

- Stage
- Required reads yes/no
- Real pipeline entrypoint identified
- Files changed
- Runtime code changed summary
- Web real search implemented yes/no
- Null-provider fallback preserved yes/no
- Tests/checks results
- Production deploy/restart yes/no
- Service statuses
- Public smoke results
- Controlled live web search smoke result
- Safety confirmation
- Known limitations
- Next recommended owner action
