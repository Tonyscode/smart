import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { allure } from 'allure-playwright';

// Define the shape of custom fixtures
type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

type Options = {
  storageStatePath: string;
};

// Extend base test with page object fixtures
export const test = base.extend<Pages & Options>({

  // Page Object fixtures — auto-instantiated per test
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  // Authenticated page fixture — logs in before the test
  page: async ({ page }, use) => {
    // Attach environment info to Allure report
    allure.label('environment', process.env.ENV || 'dev');
    await use(page);
  },
});

// Helper fixture: returns a page already logged in as standard user
export const authenticatedTest = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.STANDARD_USER || 'standard_user',
      process.env.PASSWORD || 'secret_sauce',
    );
    await use(new InventoryPage(page));
  },
});

export { expect };
