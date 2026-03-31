import { test, expect } from '../../src/fixtures';
import { allureHelper } from '../../src/helpers/allure.helper';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully with valid credentials @smoke', async ({ loginPage, inventoryPage }) => {
    allureHelper.setSeverity('critical');
    allureHelper.addTag('auth', 'smoke');
    allureHelper.addDescription('Verify standard user can log in and reach the inventory page.');

    await allureHelper.addStep('Fill in credentials', async () => {
      await loginPage.login(users.standard.username, users.standard.password);
    });

    await allureHelper.addStep('Assert landing on inventory page', async () => {
      await inventoryPage.assertOnInventoryPage();
    });
  });

  test('should show error for locked out user @regression', async ({ loginPage }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'negative');

    await loginPage.login(users.locked.username, users.locked.password);

    await loginPage.assertErrorVisible('Epic sadface: Sorry, this user has been locked out.');
  });

  test('should show error for empty credentials @regression', async ({ loginPage }) => {
    allureHelper.setSeverity('minor');
    allureHelper.addTag('auth', 'validation');

    await loginPage.loginButton.click();

    await loginPage.assertErrorVisible('Username is required');
  });

  test('should show error for wrong password @regression', async ({ loginPage }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'negative');

    await loginPage.login(users.standard.username, 'wrong_password');

    await loginPage.assertErrorVisible('Username and password do not match');
  });
});
