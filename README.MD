# eShop Sample QA AI Tests

Public sample repository for AI-assisted QA automation over a neutral e-commerce storefront. The sample flow is intentionally generic and can be adapted to demo applications such as [dotnet/eShop](https://github.com/dotnet/eShop) or any internal shopping-cart demo.

The repository demonstrates a practical workflow:

1. test cases are authored in a TMS;
2. selected cases are synced into Markdown;
3. Markdown cases are executed by an AI agent through `playwright-mcp`;
4. stable cases are converted into TypeScript + Playwright tests;
5. coded tests are verified before commit or PR.

TMS remains the source of truth for case meaning. Files under `cases/` are synchronized working contracts. Files under `tests/` are executable Playwright implementations of those contracts.

## End-To-End Flow

1. **QA writes a case in TMS.**
   Use [TMS_RULES.MD](TMS_RULES.MD). A case should include purpose, preconditions, test data, atomic steps, expected results, evidence, and automation hints.

2. **QA marks the case as ready for AI.**
   Minimal tags: `Smoke`, `app:*`, `area:*`, `type:*`, `role:*`, `automation:ai-ready`.

3. **Sync TMS cases into Markdown.**
   Ask Codex: `Use skill sync-testops-cases and sync all Smoke automation:ai-ready cases`.

   Skill: [sync-testops-cases](skills/sync-testops-cases/SKILL.md)

   Output: created or updated `cases/<suite>/<area>/TC-<id>.MD` files and a list of unchanged or needs-review cases.

4. **Run Markdown cases through `playwright-mcp`.**
   Ask Codex: `Use skill run-md-cases-ai and run the updated Markdown cases`.

   Skill: [run-md-cases-ai](skills/run-md-cases-ai/SKILL.md)

   Output: a verdict per case (`passed`, `failed`, `blocked`, `needs-data`, `needs-spec`, `needs-review`) and evidence.

   Official AI runs for this repository use `playwright-mcp`. The built-in Codex browser is not used as the source of final verdicts or evidence.

5. **Return unclear cases to TMS.**
   If the AI run finds missing data, ambiguous steps, or behavior that does not match the case, update the source case in TMS and sync again. Do not silently change the case meaning only in Markdown or code.

6. **Code Playwright tests from passed Markdown cases.**
   Ask Codex: `Use skill code-playwright-from-md and code TC-0001`.

   Skill: [code-playwright-from-md](skills/code-playwright-from-md/SKILL.md)

   Output: TypeScript specs under `tests/<suite>/<area>/TC-<id>.spec.ts` that read scenario metadata and data from the matching Markdown file.

7. **Verify coded tests.**
   Ask Codex: `Use skill verify-playwright-cases and verify the changed cases`.

   Skill: [verify-playwright-cases](skills/verify-playwright-cases/SKILL.md)

   Output: typecheck, targeted Playwright run, broader regression subset when needed, secret scan, and artifact check.

8. **Commit only source files.**
   Commit `cases/*.MD`, `tests/*.spec.ts`, support code, and documentation. Do not commit `.env`, storage state, traces, reports, screenshots, or runtime output.

9. **Run Playwright in CI/CD.**
   CI receives credentials and base URLs from secret variables or another approved secret store.

Recommended automation statuses:

- `automation:ai-ready` — case can be executed by an AI agent from Markdown.
- `automation:code-ready` — case is stable enough to implement in Playwright.
- `automation:automated` — Playwright test exists and can run in CI/CD.
- `automation:needs-review` — sync, AI run, or codegen found a case issue.

## Repository Contents

- [SMOKE_TEST_CASES.MD](SMOKE_TEST_CASES.MD) — synthetic Smoke export for the sample eShop domain.
- [API_GUIDE.MD](API_GUIDE.MD) — generic TestOps-style API guide using placeholder endpoints.
- [TMS_RULES.MD](TMS_RULES.MD) — rules for writing TMS cases that AI agents and Playwright can use safely.
- [AUTOMATED_PIPELINE.MD](AUTOMATED_PIPELINE.MD) — target automation pipeline from TMS to draft PR.
- [cases](cases) — normalized Markdown cases for AI runs and Playwright implementation.
- [tests](tests) — TypeScript Playwright tests built from the matching Markdown cases.
- [skills](skills) — repo-local Codex skills for sync, AI execution, code generation, and verification.
- [.env.template](.env.template) — environment variable contract without values.
- [.env.demo](.env.demo) — safe sample env file without real secrets.
- [AGENTS.MD](AGENTS.MD) — instructions for AI agents working in this repository.

## Codex Skills

Repo-local skills live in [skills](skills). They are normally invoked by asking Codex to use a skill, not by running shell commands directly.

Example prompts:

```text
Use skill sync-testops-cases and sync all Smoke automation:ai-ready cases.
Use skill run-md-cases-ai and run cases/smoke/checkout/TC-0001.MD.
Use skill code-playwright-from-md and code TC-0001.
Use skill verify-playwright-cases and verify changes before commit.
```

| Skill | Use When |
|---|---|
| [sync-testops-cases](skills/sync-testops-cases/SKILL.md) | Sync `automation:ai-ready` cases from TMS into `cases/*.MD`. |
| [run-md-cases-ai](skills/run-md-cases-ai/SKILL.md) | Execute Markdown cases through `playwright-mcp` and collect evidence. |
| [code-playwright-from-md](skills/code-playwright-from-md/SKILL.md) | Create or update TypeScript Playwright tests from `cases/*.MD`. |
| [verify-playwright-cases](skills/verify-playwright-cases/SKILL.md) | Check type safety, Playwright tests, artifacts, and secrets before commit or PR. |

Skill index: [skills/README.MD](skills/README.MD).

## Case Structure

Recommended Markdown case path:

```text
cases/
  <suite>/
    <area>/
      TC-<id>.MD
```

Sample:

```text
cases/
  smoke/
    checkout/
      TC-0001.MD
```

The file name keeps the TMS case ID so the path remains stable even if the case title changes.

## Test Structure

Playwright tests mirror `cases`:

```text
tests/
  <suite>/
    <area>/
      TC-<id>.spec.ts
```

Sample:

```text
tests/
  smoke/
    checkout/
      TC-0001.spec.ts
```

The test reads case data from the corresponding Markdown file instead of duplicating scenario details in code.

## Local Secrets

Real logins, passwords, API keys, JWTs, cookies, and Playwright storage state must not be committed.

For local work:

```bash
cp .env.demo .env
```

Then fill `.env` with local values. `.env` is ignored by git.

## Running Tests

Install dependencies and a browser:

```bash
npm install
npx playwright install chromium
```

Run the Markdown parser unit check:

```bash
npm test -- tests/support/case-md.spec.ts
```

Run TC-0001 against a demo eShop target:

```bash
ESHOP_BASE_URL=https://eshop-sample.app \
ESHOP_BUYER_LOGIN=<login> \
ESHOP_BUYER_PASSWORD=<password> \
npm run test:tc-0001
```

Run typecheck:

```bash
npm run typecheck
```

## Current Sample

The repository contains one synthetic automated Smoke case:

- `TC-0001`: add a catalog product to the basket and open checkout.

Additional sample cases can be added by creating new Markdown files under `cases/<suite>/<area>/` and matching Playwright specs under `tests/<suite>/<area>/`.

## Security

This repository is safe for public use by design:

- all service URLs are placeholders or demo sample URLs;
- all credentials are env aliases;
- `.env.demo` contains only fake values;
- runtime artifacts are ignored;
- TMS remains the source of truth for test-case meaning.
