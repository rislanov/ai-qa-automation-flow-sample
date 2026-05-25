# Smoke Test Cases Export

This is a synthetic TestOps-style export for the public eShop sample repository.

Source: placeholder TMS API at `https://testops.example.test`.

Filter used:

```text
tag in ["Smoke"] and tag in ["automation:ai-ready"]
```

## Summary

| Metric | Value |
|---|---:|
| Projects | 1 |
| Cases | 3 |
| Active | 3 |
| Review | 0 |
| Automation-ready | 3 |

## Projects

| Project ID | Project | Cases |
|---:|---|---:|
| 100 | eShop Sample Manual Cases | 3 |

## Areas

| Area | Cases |
|---|---:|
| checkout | 1 |
| catalog | 1 |
| account | 1 |

## Case Index

| Case ID | Project | Status | Steps | Name |
|---:|---|---|---:|---|
| 0001 | eShop Sample Manual Cases | Active | 10 | Add a catalog product to the basket and start checkout |
| 2709 | eShop Sample Manual Cases | Active | 8 | Filter catalog products by category |
| 2710 | eShop Sample Manual Cases | Active | 7 | Sign in with a buyer account |

## TC-0001: Add a catalog product to the basket and start checkout

```yaml
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
```

### Purpose

Verify that a buyer can find a product, add it to the basket, confirm the basket line item, and open checkout without submitting an order.

### Preconditions

- Demo eShop environment is available.
- Buyer account `ESHOP_BUYER` exists.
- Product `SKU-DEMO-MUG` exists in the catalog.
- Basket can be reset before or after execution.

### Test Data

| Field | Value |
|---|---|
| Product SKU | `SKU-DEMO-MUG` |
| Product Name | `Demo Coffee Mug` |
| Product Price | `$12.00` |
| Quantity | `1` |

### Steps

1. Open the sign-in page.
2. Sign in as `ESHOP_BUYER`.
3. Open the catalog page.
4. Search for `Demo Coffee Mug`.
5. Open the product details page for SKU `SKU-DEMO-MUG`.
6. Click "Add to basket".
7. Open the basket page.
8. Verify product name, SKU, quantity, and price.
9. Click "Checkout".
10. Verify that the checkout page is opened.

### Expected Results

- Buyer signs in successfully.
- Product details are visible before adding to basket.
- Basket contains one line item for `Demo Coffee Mug`.
- Checkout page opens.
- No order is submitted.

## TC-2709: Filter catalog products by category

```yaml
case_id: 2709
project_id: 100
suite: smoke
area: catalog
app: storefront
type: ui
role: guest
automation: ai-ready
page: CatalogPage
flow: filterProductsByCategory
assertion: expectOnlySelectedCategoryProducts
data: ESHOP_CATALOG
cleanup: none
external: none
tms_url: "https://testops.example.test/project/100/test-cases/2709"
api_url: "https://testops.example.test/api/testcase/2709"
source_updated_at_utc: "2026-05-25T00:00:00Z"
```

Summary: a guest selects category `Accessories` and sees only matching catalog items.

## TC-2710: Sign in with a buyer account

```yaml
case_id: 2710
project_id: 100
suite: smoke
area: account
app: storefront
type: ui
role: buyer
automation: ai-ready
page: SignInPage
flow: signInBuyer
assertion: expectAccountMenuVisible
data: ESHOP_BUYER
cleanup: sign-out
external: none
tms_url: "https://testops.example.test/project/100/test-cases/2710"
api_url: "https://testops.example.test/api/testcase/2710"
source_updated_at_utc: "2026-05-25T00:00:00Z"
```

Summary: a buyer signs in with credentials from env variables and sees the account menu.
