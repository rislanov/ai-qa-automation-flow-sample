# Automated TMS-To-Playwright Pipeline

Goal: describe a repeatable public-sample pipeline from TMS-authored cases to a draft PR containing Markdown cases, Playwright code, and verification evidence.

```text
TMS
  -> sync cases to Markdown
  -> validate Markdown
  -> run Markdown with playwright-mcp
  -> code Playwright tests
  -> verify tests and secrets
  -> create draft PR
```

## Automation Boundary

| Step Type | Good Fit | Examples |
|---|---|---|
| Deterministic script | Behavior can be described reliably in code | TMS API sync, Markdown generation, validation, `npm test`, secret scan |
| AI agent | Browser exploration or interpretation is useful | Running Markdown cases through `playwright-mcp`, drafting Playwright code from cases |
| Human review | Product intent or risk needs judgment | Approving ambiguous TMS cases, reviewing generated PRs |

## 1. TMS Authoring

QA writes a case in TMS using [TMS_RULES.MD](TMS_RULES.MD).

Required case qualities:

- business purpose;
- environment and start page;
- user alias and role;
- stable test data;
- atomic steps;
- observable expected results;
- evidence expectations;
- automation hints.

Output: case is ready for sync.

## 2. TMS Sync

Type: deterministic script, guided by [sync-testops-cases](skills/sync-testops-cases/SKILL.md).

Example command:

```bash
npm run tms:sync -- --suite Smoke --readiness automation:ai-ready
```

Expected sync behavior:

- authenticate with `TESTOPS_USER_API_KEY`;
- query the selected project or case IDs;
- fetch case metadata and normalized steps;
- validate required TMS structure;
- write `cases/<suite>/<area>/TC-<id>.MD`;
- report unchanged, updated, created, and needs-review cases.

Required env:

- `TESTOPS_ENDPOINT`
- `TESTOPS_USER_API_KEY`

Output examples:

- `cases/smoke/checkout/TC-0001.MD`;
- machine-readable sync report such as `reports/tms-sync.json`;
- human-readable summary for PR review.

## 3. Markdown Case Validation

Type: deterministic script.

Validation checks:

- frontmatter contains `case_id`, `suite`, `area`, `app`, `type`, `role`, `automation`, `data`, `source_updated_at_utc`;
- required sections exist;
- credentials are env aliases, not real values;
- steps are numbered;
- expected results are observable;
- cleanup is explicit.

Output: pass, or `automation:needs-review` feedback for TMS.

## 4. AI Run Through `playwright-mcp`

Type: AI agent, guided by [run-md-cases-ai](skills/run-md-cases-ai/SKILL.md).

Input:

- target Markdown cases;
- app credentials from env variables such as `ESHOP_BUYER_LOGIN` and `ESHOP_BUYER_PASSWORD`;
- base URLs such as `ESHOP_BASE_URL`.

The agent must:

- follow Markdown steps in order;
- respect constraints and cleanup;
- capture requested evidence;
- return a verdict per case.

Verdicts:

- `passed`;
- `failed`;
- `blocked`;
- `needs-data`;
- `needs-spec`;
- `needs-review`.

Output:

- verdict report;
- evidence paths or attachments;
- concise TMS feedback for failed, blocked, or ambiguous cases.

## 5. Playwright Code Generation

Type: AI agent plus deterministic verification, guided by [code-playwright-from-md](skills/code-playwright-from-md/SKILL.md).

Input:

- Markdown cases with successful `playwright-mcp` AI-run verdict;
- existing Playwright patterns under `tests/`;
- support helpers under `tests/support/`.

The generated test must:

- read scenario metadata and test data from Markdown;
- keep `test.step(...)` aligned with Markdown steps;
- use env variables for credentials;
- avoid product behavior not present in Markdown;
- attach evidence requested by the case.

Output:

- `tests/<suite>/<area>/TC-<id>.spec.ts`;
- any focused support helpers needed by multiple tests.

## 6. Verification

Type: deterministic checks, guided by [verify-playwright-cases](skills/verify-playwright-cases/SKILL.md).

Minimum checks:

```bash
npm run typecheck
npm test -- tests/support/case-md.spec.ts
npm run test:tc-0001
```

Run broader suites when shared support, config, or parser behavior changed:

```bash
npm test
```

Also check:

- no secrets in tracked files;
- generated artifacts remain ignored;
- README and skills match the current flow.

## 7. Draft PR

Type: deterministic shell/git plus human review.

PR should include:

- synced Markdown cases;
- coded Playwright specs;
- verification summary;
- case verdict notes;
- any TMS follow-up required.

Do not include:

- `.env`;
- API keys or JWTs;
- cookies or storage state;
- traces, videos, screenshots, HTML reports, or raw runtime output.

## Sample Status Mapping

| Status | Meaning | Next Action |
|---|---|---|
| `automation:ai-ready` | Case can be run by an AI agent from Markdown. | Run through `playwright-mcp`. |
| `automation:code-ready` | AI run passed and case is stable enough to code. | Generate or update Playwright test. |
| `automation:automated` | Playwright test exists and is verified. | Include in CI/CD. |
| `automation:needs-review` | Sync, AI run, or codegen found a case issue. | QA reviews TMS. |
| `automation:needs-data` | Stable data is missing. | QA or test data owner provides fixture/alias. |
| `automation:needs-spec` | Case text is ambiguous. | QA improves TMS description. |

## Open Decisions For Real Adoption

- Which TMS tags identify cases ready for AI execution?
- Should sync update TMS tags automatically, or only report recommended changes?
- Where should AI-run evidence be stored in CI?
- Which browser environments are required for the sample app?
