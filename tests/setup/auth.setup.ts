import { test as setup, expect } from '@playwright/test';
import { SmartLoginPage } from '../../src/pages/smart/smart-login.page';
import { cookieSetup, origins } from '../../src/data/static-cookies';
import * as fs from 'fs';

const DK_USER = process.env.DK_USER!;
const SMART_PASSWORD = process.env.SMART_PASSWORD!;
const domain = new URL(process.env.SMART_BASE_URL!).hostname;

// setup('authenticate as activity user', async ({ page }) => {
//   const loginPage = new SmartLoginPage(page);
//   await loginPage.login(DK_USER, SMART_PASSWORD);
//   await page.context().storageState({ path: 'playwright/.auth/dk-user.json' });
// });

setup('authenticate via API', async ({ request }) => {
  const response = await request.post(`${process.env.SMART_BASE_URL}/api/v1/auth`, {
    data: {
      email: DK_USER,
      password: SMART_PASSWORD,
    },
  });

  const body = await response.json();
  expect(response.ok()).toBeTruthy();
  const { result } = body;
  console.log('result', result)
  // API returns opid in body (not as Set-Cookie), so write it manually as a cookie

  const dynamicCookies = [
    {
      name: 'OPID',
      value: result.opid,
      domain: domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]

  fs.mkdirSync('playwright/.auth', { recursive: true });
  fs.writeFileSync(
    'playwright/.auth/api-dk-user.json',
    JSON.stringify({
      cookies: [...cookieSetup(), ...dynamicCookies],
      origins: origins(),
    }, null, 2)
  );
});
