---
name: run-md-cases-ai
description: Use when executing repository Markdown test cases through playwright-mcp before converting them into coded Playwright tests.
---

# Run Markdown Cases AI

## Purpose

Execute one or more `cases/**/*.MD` files through `playwright-mcp` and produce a verdict with evidence. This is the quality gate between "case is written" and "case can be coded".

Use this skill for requests like:

- "run Markdown cases with the AI agent"
- "verify TC-0001 through playwright-mcp"
- "run updated cases"
- "give verdicts for automation:ai-ready cases"

## Inputs

Required:

- One or more Markdown case paths, or a selector such as changed files, suite, area, or case ID.
- Runtime credentials through env variables named in the case Markdown, for example `ESHOP_BUYER_LOGIN` and `ESHOP_BUYER_PASSWORD`.

Read before running:

- target `cases/**/*.MD` file;
- `.env.template` for required variable names;
- `TMS_RULES.MD` for readiness expectations.

## Workflow

1. Parse each Markdown case.
2. Confirm the case has enough information:
   - environment/base URL;
   - user alias and credentials env names;
   - test data;
   - steps;
   - expected results;
   - evidence expectations;
   - automation notes or hint tags.
3. Resolve credentials only from environment variables or a user-approved secret source.
4. Run the case through `playwright-mcp`:
   - follow Steps in order;
   - check Expected Results as observable assertions;
   - respect Constraints and Cleanup;
   - do not perform destructive actions outside the case.
5. Capture evidence:
   - screenshots requested by the case;
   - relevant URLs;
   - text/assertion values;
   - notes for blocked or failed behavior.
6. Produce a verdict:
   - `passed` — all required expected results verified;
   - `failed` — application behavior differs from the case;
   - `blocked` — environment, auth, data, or dependency prevents execution;
   - `needs-data` — stable test data is missing;
   - `needs-spec` — case description is ambiguous;
   - `needs-review` — case conflicts with `TMS_RULES.MD`.

## External Systems

If a case references an external system, verify only what the Markdown says to verify.

Example:

- OK: assert that a sandbox payment form opens and the URL host matches the sandbox host from Markdown.
- Not OK: submit real payment details or fail the eShop case because a third-party sandbox has cosmetic content changes, unless the case explicitly requires that check.

## Runner Requirement

Official verdicts and evidence for this repository must come from `playwright-mcp`.

Do not use the built-in Codex browser or Codex in-app browser as the official execution engine for this skill. It may be useful for quick exploration, but it is not acceptable for final case verdicts, evidence, or automated pipeline reports.

## Output

Report per case:

```text
TC-0001: passed
- evidence: screenshot path or attachment
- assertions: product name, SKU, quantity, price, checkout URL
- notes: order submission was intentionally not performed
```

For failures, include the exact step and the smallest useful observation. Avoid large DOM dumps in final summaries.

## Stop Conditions

Stop and return feedback instead of forcing execution when:

- credentials are unavailable;
- a step is unsafe or destructive without explicit approval;
- the case cannot be followed without product guesses;
- required test data does not exist;
- the UI contradicts the Markdown in a way that changes the test meaning.

## Safety

- Do not save credentials in repo files.
- Keep screenshots, videos, traces, and raw `playwright-mcp`/Playwright artifacts in ignored directories such as `output/`, `.playwright-cli/`, `test-results/`, or `playwright-report/`.
- Close authenticated browser sessions when the run is finished.
