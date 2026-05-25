---
name: sync-testops-cases
description: Use when syncing TestOps/TMS test cases into repository Markdown files, especially Smoke or automation-ready cases that must become cases/<suite>/<area>/TC-<id>.MD.
---

# Sync TestOps Cases

## Purpose

Synchronize TMS cases into normalized Markdown files under `cases/` without changing the source of truth: TMS remains authoritative.

Use this skill for requests like:

- "sync Smoke cases"
- "update cases from TMS"
- "pull all automation:ai-ready cases"
- "refresh TC-0001 from TestOps"

## Inputs

Required:

- TMS API access through `TESTOPS_ENDPOINT` and `TESTOPS_USER_API_KEY`.
- Query scope: case IDs, tag filter, project IDs, or query language.

Defaults for this sample:

- `TESTOPS_ENDPOINT=https://testops.example.test`
- suite tag: `Smoke`
- readiness tag: `automation:ai-ready`
- output path: `cases/<suite>/<area>/TC-<id>.MD`

Read before syncing:

- `API_GUIDE.MD`
- `TMS_RULES.MD`
- existing `cases/**/*.MD`

## Workflow

1. Authenticate against the TMS API using the user API key.
2. Resolve the query scope:
   - explicit case IDs if provided;
   - otherwise query for `Smoke` and `automation:ai-ready`;
   - include tag variants only if the target TMS requires them.
3. Fetch each case with `GET /api/testcase/{id}`.
4. Fetch normalized steps with `GET /api/testcase/{id}/step`.
5. Validate against `TMS_RULES.MD`:
   - title exists and has area/action/result;
   - tags include suite, app, area, type, role, readiness;
   - description explains purpose;
   - preconditions include environment, start page, user alias, role, data, restrictions, cleanup;
   - steps are atomic;
   - expected results are observable;
   - evidence is specified;
   - automation hints exist as a text block or technical tags.
6. Map the case to a file path:
   - suite: from `Smoke` or another suite tag;
   - area: from `area:*`;
   - file: `TC-<id>.MD`.
7. Generate or update Markdown:
   - keep stable frontmatter keys;
   - include `source_updated_at_utc`;
   - include `tms_url` and `api_url`;
   - include Purpose, Environment, Test Data, Constraints, Cleanup, Steps, Expected Results, Evidence, Automation Notes.
8. Preserve hand-written repo-only notes only if they are in an explicitly marked section. Otherwise regenerate from TMS.
9. Report:
   - created files;
   - updated files;
   - unchanged files;
   - cases blocked as `automation:needs-review`.

## Output Contract

Each synced file must be usable by both the `playwright-mcp` AI runner and Playwright codegen. Prefer this structure:

```markdown
---
case_id: 0001
project_id: 100
suite: smoke
area: checkout
app: storefront
type: ui
role: buyer
automation: ai-ready
page: CatalogPage
flow: addProductToBasketAndStartCheckout
assertion: expectBasketLineItemAndCheckoutEntry
data: ESHOP_BUYER
cleanup: reset-basket
external: none
tms_url: "https://testops.example.test/project/100/test-cases/0001"
api_url: "https://testops.example.test/api/testcase/0001"
source_updated_at_utc: "2026-05-25T00:00:00Z"
---
```

## Stop Conditions

Do not invent missing product behavior.

Stop and mark `needs-review` when:

- required tags are missing;
- no user alias or role is present;
- test data is ambiguous;
- a step says "any product", "valid data", or "fill required fields" without details;
- expected result cannot be observed;
- external-system behavior is required but limitations are not described.

## Safety

- Never write API keys, JWTs, logins, passwords, cookies, local storage, or Playwright storage state to repo files.
- Store temporary API responses under `/private/tmp` if needed.
- Do not update `tests/*.spec.ts` in this skill; coding is handled by `code-playwright-from-md`.
