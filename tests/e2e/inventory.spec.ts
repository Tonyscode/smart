import { authenticatedTest as test, expect } from '../../src/fixtures';
import { allureHelper } from '../../src/helpers/allure.helper';

test.describe('Inventory', () => {
  test('should display products on inventory page @smoke', async ({ inventoryPage }) => {
    allureHelper.setSeverity('critical');
    allureHelper.addTag('inventory', 'smoke');

    await inventoryPage.assertOnInventoryPage();

    const count = await inventoryPage.getItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should add item to cart @smoke', async ({ inventoryPage }) => {
    allureHelper.setSeverity('critical');
    allureHelper.addTag('cart', 'smoke');

    await allureHelper.addStep('Add item to cart', async () => {
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    });

    await allureHelper.addStep('Verify cart badge count', async () => {
      const count = await inventoryPage.getCartBadgeCount();
      expect(count).toBe(1);
    });
  });

  test('should sort products by price low to high @regression', async ({ inventoryPage }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('inventory', 'sorting');

    await inventoryPage.sortBy('lohi');

    // Verify page still shows products after sort
    const count = await inventoryPage.getItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should logout successfully @regression', async ({ inventoryPage, loginPage }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'logout');

    await inventoryPage.logout();
    await loginPage.assertOnLoginPage();
  });
});
