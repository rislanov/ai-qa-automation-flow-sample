---
name: verify-playwright-cases
description: Use when validating Markdown cases, TypeScript Playwright tests, changed automation files, or readiness before commit, pull request, or CI handoff.
---

# Verify Playwright Cases

## Purpose

Verify that synced cases and coded Playwright tests are safe, consistent, and runnable before commit or CI/CD handoff.

Verification of coded tests uses `@playwright/test`. Verification of Markdown case execution reports must rely on `playwright-mcp` AI-run outputs, not the built-in Codex browser.

Use this skill for requests like:

- "проверь тесты"
- "прогони все измененные кейсы"
- "готово ли к коммиту"
- "verify TC-0001"
- "перед PR проверь"

## Inputs

Required:

- Changed files or target case IDs.
- Runtime env vars for any browser tests that need auth.

Read before verifying:

- `README.MD` for commands;
- `package.json` scripts;
- changed `cases/**/*.MD`;
- changed `tests/**/*.spec.ts`;
- `.gitignore` for ignored artifacts.

## Workflow

1. Inspect changed files with `git status --short`.
2. Map affected case IDs:
   - changed `cases/**/TC-*.MD`;
   - changed `tests/**/TC-*.spec.ts`;
   - changed support/config files that affect all tests.
3. Run static checks:
   - `npm run typecheck`.
4. Run Markdown reader/unit checks if case parsing changed:
   - `npm test -- tests/support/case-md.spec.ts`.
5. Run targeted browser tests:
   - `npm run test:tc-0001` for TC-0001;
   - or `npx playwright test tests/<suite>/<area>/TC-<id>.spec.ts`.
6. Run the broader relevant suite when support/config changes:
   - `npm test` for the current repo.
7. Scan for leaked secrets:
   - known API keys/JWT patterns;
   - real logins/passwords from the session;
   - `access_token`, `bearer`, cookies, storage state.
8. Confirm artifacts are ignored:
   - `test-results/`;
   - `playwright-report/`;
   - `output/`;
   - `.playwright-cli/`;
   - `node_modules/`.
9. Report exact commands and outcomes.

## Success Criteria

Before saying the work is ready:

- typecheck passes;
- targeted tests pass;
- full relevant suite passes when needed;
- secret scan has no hits in tracked/untracked repo files;
- generated artifacts are ignored;
- README/AGENTS are updated if structure or commands changed.

## Failure Handling

If a browser test fails:

- identify the failing case ID and step;
- inspect the Playwright error context or trace when useful;
- determine whether the issue is product behavior, stale Markdown, missing data, flaky external dependency, or test code;
- do not "fix" the test by changing behavior away from Markdown;
- if Markdown is wrong, mark the case `needs-review` and explain the needed TMS change.

## Safety

- Never print full secrets in final output.
- Avoid committing test artifacts.
- Do not claim tests pass without fresh command output from this verification run.
