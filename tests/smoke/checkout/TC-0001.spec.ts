import { expect, test } from '@playwright/test';
import { loadCaseFromMarkdown, requireEnv, resolveEnvTemplate } from '../../support/case-md.js';

const testCase = loadCaseFromMarkdown('cases/smoke/checkout/TC-0001.MD');

test.describe(testCase.title, () => {
  test('adds a catalog product to the basket and opens checkout', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'case_id', description: testCase.frontmatter.case_id },
      { type: 'tms_url', description: testCase.frontmatter.tms_url },
      { type: 'source', description: testCase.path }
    );

    const [loginEnv, passwordEnv] = testCase.credentials;
    const login = requireEnv(loginEnv);
    const password = requireEnv(passwordEnv);
    const baseUrl = resolveEnvTemplate(testCase.environment['Base URL']);
    const startPath = testCase.environment['Start page'];
    const productSku = testCase.testData['Product SKU'];
    const productName = testCase.testData['Product Name'];
    const productPrice = testCase.testData['Product Price'];
    const quantity = testCase.testData['Quantity'];
    const productPath = testCase.testData['Product URL'];
    const cartPath = testCase.testData['Cart URL'];
    const checkoutPath = testCase.testData['Checkout URL'];

    await test.step(testCase.steps[0], async () => {
      await page.goto(`${baseUrl}/account/sign-in`);
      await expect(page.getByLabel('Email')).toBeVisible();
    });

    await test.step(testCase.steps[1], async () => {
      await page.getByLabel('Email').fill(login);
      await page.getByLabel('Password').fill(password);
      await Promise.all([
        page.waitForURL(url => !url.toString().includes('/account/sign-in')),
        page.getByRole('button', { name: 'Sign in' }).click()
      ]);
    });

    await test.step(testCase.steps[2], async () => {
      await page.goto(`${baseUrl}${startPath}`);
      await expect(page.getByRole('searchbox', { name: 'Search catalog' })).toBeVisible();
    });

    await test.step(testCase.steps[3], async () => {
      await page.getByRole('searchbox', { name: 'Search catalog' }).fill(productName);
      await page.getByRole('button', { name: 'Search' }).click();
    });

    const productCard = page.locator(`[data-testid="product-card"][data-sku="${productSku}"]`);

    await test.step(testCase.steps[4], async () => {
      await expect(productCard).toContainText(productName);
      await productCard.getByRole('link', { name: productName }).click();
      await expect(page).toHaveURL(`${baseUrl}${productPath}`);
    });

    await test.step(testCase.steps[5], async () => {
      await expect(page.getByText(productSku)).toBeVisible();
      await page.getByRole('button', { name: 'Add to basket' }).click();
    });

    await test.step(testCase.steps[6], async () => {
      await page.goto(`${baseUrl}${cartPath}`);
      await expect(page.getByRole('heading', { name: 'Basket' })).toBeVisible();
    });

    const basketLine = page.locator(`[data-testid="basket-line"][data-sku="${productSku}"]`);

    await test.step(testCase.steps[7], async () => {
      await expect(basketLine).toBeVisible();
      await expect(basketLine).toContainText(productName);
      await expect(basketLine).toContainText(productSku);
      await expect(basketLine.getByLabel('Quantity')).toHaveValue(quantity);
      await expect(basketLine).toContainText(productPrice);
    });

    await testInfo.attach('basket-screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });

    await test.step(testCase.steps[8], async () => {
      await page.getByRole('button', { name: 'Checkout' }).click();
    });

    await test.step(testCase.steps[9], async () => {
      await expect(page).toHaveURL(`${baseUrl}${checkoutPath}`);
      await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    });
  });
});
