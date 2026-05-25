# Agent Instructions

This repository is a public sample for AI-assisted QA automation over a neutral e-commerce application.

## Mandatory Rule

Keep [README.MD](README.MD) up to date.

If you add, remove, or significantly change files, repository structure, document purpose, run commands, API rules, or the automation process, update README in the same change.

## Preserve These Principles

- TMS remains the source of truth for test cases.
- Do not store API keys, JWTs, logins, passwords, cookies, storage state, or other secrets in repository files.
- Real values belong only in local `.env`, CI secrets, or a password manager.
- Repository files may contain only `.env.template`, safe `.env.demo` values, and placeholder URLs such as `https://eshop-sample.app` or `https://testops.example.test`.
- New QA instructions must be understandable without private conversation context.
- Documents should be short, practical, and useful for QA and automation engineers.
- Do not add references to any real private product, customer, service URL, issue tracker, wiki, or domain-specific business data.
- If preparing a public sample from an internal repository, do not publish old commit history. Use a fresh repository or an orphan branch.

## Case Structure

Normalized case descriptions live here:

```text
cases/<suite>/<area>/TC-<id>.MD
```

Example:

```text
cases/smoke/checkout/TC-0001.MD
```

When adding or updating a case file:

- take facts from TMS/API, or clearly mark synthetic sample data;
- keep the TMS ID in the file name and frontmatter;
- do not add real credentials, API keys, JWTs, cookies, or storage state;
- use user aliases such as `ESHOP_BUYER`;
- update `source_updated_at_utc` when the file is synced from TMS;
- update `README.MD` if structure, file purpose, or run commands change.

## Playwright Test Structure

TypeScript Playwright tests mirror `cases`:

```text
tests/<suite>/<area>/TC-<id>.spec.ts
```

Rules:

- use the corresponding Markdown file from `cases` as the scenario contract;
- do not duplicate test data in code when it already exists in Markdown;
- read credentials only from env variables;
- do not commit screenshots, traces, videos, `test-results`, `playwright-report`, `output`, or `.playwright-cli`;
- update `README.MD` if test structure or run commands change.

## Repo-Local Skills

Use instructions from `skills/` for repeatable workflows:

- `skills/sync-testops-cases/SKILL.md` — sync TMS cases into `cases/*.MD`.
- `skills/run-md-cases-ai/SKILL.md` — run Markdown cases with `playwright-mcp`.
- `skills/code-playwright-from-md/SKILL.md` — code Playwright tests from Markdown.
- `skills/verify-playwright-cases/SKILL.md` — final verification before commit or PR.

If you change the end-to-end process, update the matching skill and links in `README.MD`.

Official AI case runs use `playwright-mcp`. Do not use the built-in Codex browser or in-app browser as the source of final verdicts or evidence for this repository.

## Current Key Documents

- `SMOKE_TEST_CASES.MD` — synthetic Smoke export from a TestOps-style TMS.
- `API_GUIDE.MD` — generic TestOps-style API guide with placeholder endpoints.
- `TMS_RULES.MD` — case-writing rules for AI and Playwright.
- `cases/` — normalized working case descriptions.
- `tests/` — TypeScript Playwright tests.
- `skills/` — repo-local Codex skills for the automation process.
- `.env.template` and `.env.demo` — env contract without real secrets.
- `README.MD` — user-friendly repository overview.
