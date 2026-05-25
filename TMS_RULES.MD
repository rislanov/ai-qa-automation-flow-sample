# TMS Test Case Writing Rules For AI And Playwright Automation

Goal: keep TMS as the source of truth while making cases clear enough for an AI agent with `playwright-mcp` and for later TypeScript + Playwright automation.

The examples in this repository use a neutral eShop checkout flow.

## Good Case Shape

A case is ready for AI automation when a reader can answer these questions without private context:

- What user goal is being tested?
- Which app, page, user role, and environment are required?
- Which stable test data is required?
- What exact steps must be performed?
- What visible or otherwise observable result proves success?
- What evidence should be captured?
- What cleanup is required?

## Tags

Use tags to make cases discoverable and routable:

```text
Smoke
app:storefront
area:checkout
type:ui
role:buyer
automation:ai-ready
```

Recommended tag families:

- `app:storefront`, `app:admin`, `app:api`
- `area:catalog`, `area:checkout`, `area:account`, `area:orders`, `area:payments`
- `type:ui`, `type:api`, `type:email`, `type:integration`
- `role:guest`, `role:buyer`, `role:admin`
- `automation:ai-ready`, `automation:code-ready`, `automation:automated`, `automation:needs-review`

## Required TMS Sections

### Purpose

State the business behavior in one or two sentences.

Good:

```text
Verify that a buyer can add one catalog product to the basket and open checkout without submitting an order.
```

Not good:

```text
Check basket.
```

### Preconditions

Include:

- environment name;
- start page;
- user alias and role;
- stable test data;
- restrictions;
- cleanup expectations.

Example:

```text
Environment: demo
Application: Storefront
Start page: /catalog
User: ESHOP_BUYER
Role: buyer
Product: SKU-DEMO-MUG
Restrictions: do not submit payment
Cleanup: reset basket
```

### Test Data

Use aliases and stable synthetic values. Do not paste real credentials.

Example:

```text
User alias: ESHOP_BUYER
Product SKU: SKU-DEMO-MUG
Product Name: Demo Coffee Mug
Quantity: 1
Expected Price: $12.00
```

### Steps

Make each step atomic and executable through a browser.

Good:

```text
1. Open /catalog.
2. Search for Demo Coffee Mug.
3. Open the product details page for SKU SKU-DEMO-MUG.
4. Click Add to basket.
5. Open /basket.
```

Not good:

```text
1. Add the product and check everything works.
```

### Expected Results

Expected results must be observable.

Good:

```text
The basket contains one line item with product name Demo Coffee Mug, SKU SKU-DEMO-MUG, quantity 1, and price $12.00.
```

Not good:

```text
The basket works correctly.
```

### Evidence

Say what evidence is useful:

- screenshot of the basket;
- current URL;
- visible text assertion;
- API response field, if the case is API-based;
- email subject, if the case is email-based.

### Automation Hints

Add a short technical hint block or equivalent tags:

```text
page: CatalogPage
flow: addProductToBasketAndStartCheckout
assertion: expectBasketLineItemAndCheckoutEntry
data: ESHOP_BUYER
cleanup: reset-basket
external: none
```

## Markdown Output Contract

Synced Markdown cases should use this structure:

```markdown
---
case_id: 0001
project_id: 100
project: "eShop Sample Manual Cases"
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

# TC-0001: Add a catalog product to the basket and start checkout

## Purpose

...

## Environment

...

## Test Data

...

## Constraints

...

## Cleanup

...

## Steps

...

## Expected Results

...

## Evidence

...

## Automation Notes

...
```

## Readiness Checklist

Before applying `automation:ai-ready`, confirm:

- case has a clear user goal;
- user is an alias, not a real login;
- credentials are referenced only through env variable names;
- data is stable and synthetic;
- each step has one action;
- expected results are visible or otherwise verifiable;
- destructive actions are forbidden or explicitly controlled;
- cleanup is described;
- evidence expectations are present.

## Common Problems

| Problem | Why It Blocks AI | Better Version |
|---|---|---|
| "Use any product" | AI cannot know which data is stable | "Use product SKU `SKU-DEMO-MUG`." |
| "Fill required fields" | Required fields may change | List each field and value. |
| "Check success" | Result is not observable | State the exact URL, heading, row, badge, or message. |
| Real login in case text | Secret leak | Use `ESHOP_BUYER` and env variables. |
| No cleanup | Re-runs may fail | Specify `reset-basket` or another safe cleanup. |

## External Systems

If a case touches a payment sandbox, email inbox, analytics system, or other dependency, state the boundary clearly.

Example:

```text
Payment provider: sandbox only
Allowed check: payment form opens
Forbidden action: submit real payment details
```

## When To Return A Case To Review

Use `automation:needs-review` when:

- required tags are missing;
- test data is unstable;
- credentials are written directly;
- steps rely on private knowledge;
- expected results are subjective;
- cleanup is missing for state-changing flows;
- the case asks the AI agent to guess product behavior.
