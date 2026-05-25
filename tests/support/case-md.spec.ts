import { expect, test } from '@playwright/test';
import { loadCaseFromMarkdown } from './case-md.js';

test.describe('loadCaseFromMarkdown', () => {
  test('loads TC-0001 metadata and test data from the case markdown', () => {
    const testCase = loadCaseFromMarkdown('cases/smoke/checkout/TC-0001.MD');

    expect(testCase.id).toBe('TC-0001');
    expect(testCase.frontmatter.case_id).toBe('0001');
    expect(testCase.frontmatter.suite).toBe('smoke');
    expect(testCase.frontmatter.area).toBe('checkout');
    expect(testCase.environment['Base URL']).toBe('${ESHOP_BASE_URL}');
    expect(testCase.credentials).toEqual(['ESHOP_BUYER_LOGIN', 'ESHOP_BUYER_PASSWORD']);
    expect(testCase.testData['Product SKU']).toBe('SKU-DEMO-MUG');
    expect(testCase.testData['Cart URL']).toBe('/basket');
    expect(testCase.steps).toContain('Click the "Add to basket" button for the product.');
  });
});
