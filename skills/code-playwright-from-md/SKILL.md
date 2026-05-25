---
name: code-playwright-from-md
description: Use when creating or updating TypeScript Playwright tests from repository Markdown cases under cases/, especially tests/<suite>/<area>/TC-<id>.spec.ts.
---

# Code Playwright From Markdown

## Purpose

Create or update TypeScript Playwright tests from Markdown case files. The Markdown case is the contract; the test code is the executable implementation.

Use this skill for requests like:

- "code TC-0001"
- "create Playwright tests from Markdown"
- "automate all code-ready cases"
- "update a test after changing cases/*.MD"

## Inputs

Required:

- One or more `cases/**/*.MD` files.
- Existing Playwright project files:
  - `playwright.config.ts`
  - `tests/support/case-md.ts`
  - existing `tests/**/*.spec.ts` patterns.

Read before coding:

- target Markdown case;
- nearby tests in the same `tests/<suite>/<area>/` folder;
- shared support files under `tests/support/`;
- `TMS_RULES.MD` if the Markdown seems ambiguous.

## Workflow

1. Load the Markdown case and treat it as the only source of scenario truth.
2. Check readiness:
   - `automation:ai-ready` is enough for `playwright-mcp` AI run;
   - prefer `automation:code-ready` for coding;
   - if data or expected results are missing, stop with `needs-spec` or `needs-data`.
3. Create or update the spec at:
   - `tests/<suite>/<area>/TC-<id>.spec.ts`.
4. Use the shared Markdown reader instead of hardcoding case metadata:
   - title;
   - environment;
   - credential env names;
   - test data;
   - steps;
   - expected URLs.
5. Keep selectors user-facing first:
   - roles;
   - labels;
   - visible text;
   - stable URLs from Markdown.
6. Use stable `data-testid` selectors when the sample app exposes them for repeated product or basket rows.
7. Add page objects or helpers only when at least two tests share the behavior or the test is becoming hard to read.
8. Include `test.step(...)` names from Markdown steps so reports map back to the case.
9. Attach evidence requested by the Markdown, usually screenshots or assertion notes.
10. Run the new or changed test.
11. Run typecheck and relevant regression subset.

## Code Rules

- Do not copy the full scenario into comments.
- Do not introduce test data that is absent from Markdown.
- Do not submit payment details unless Markdown explicitly covers order placement.
- Do not store credentials, cookies, storage state, or tokens.
- Prefer deterministic URL assertions for navigation and external boundaries.

## Expected Test Shape

```ts
const testCase = loadCaseFromMarkdown('cases/smoke/checkout/TC-0001.MD');

test.describe(testCase.title, () => {
  test('adds a catalog product to the basket and opens checkout', async ({ page }, testInfo) => {
    const baseUrl = resolveEnvTemplate(testCase.environment['Base URL']);
    const productSku = testCase.testData['Product SKU'];

    await test.step(testCase.steps[0], async () => {
      await page.goto(`${baseUrl}/account/sign-in`);
    });
  });
});
```

## Stop Conditions

Do not code the test when:

- the Markdown case has no atomic steps;
- credentials are named directly instead of by env aliases;
- expected results are not observable;
- test data is unstable and no fixture/data alias is provided;
- `playwright-mcp` AI run has not passed and the user has not explicitly approved coding anyway.

Return a concise review note explaining what must change in TMS or `cases/*.MD`.
