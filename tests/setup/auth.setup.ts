import { test as setup } from '@playwright/test';
import { SmartLoginPage } from '../../src/pages/smart/smart-login.page';

const ACTIVITY_USER = process.env.ACTIVITY_USER || 'qasmartautotest+activity@gmail.com';
const SMART_PASSWORD = process.env.SMART_PASSWORD || '';

/**
 * Global auth setup — runs once before the test suite.
 * Logs in via UI and saves browser storage (cookies + localStorage) to a file.
 * All tests in the 'smart' project reuse this saved session — no UI login needed.
 *
 * To regenerate the session (e.g. after password change):
 *   delete playwright/.auth/activity-user.json  and re-run
 */
setup('authenticate as activity user', async ({ page }) => {
  const loginPage = new SmartLoginPage(page);
  await loginPage.login(ACTIVITY_USER, SMART_PASSWORD);

  // Persist cookies + localStorage so tests can reuse the session
  await page.context().storageState({ path: 'playwright/.auth/activity-user.json' });
});
