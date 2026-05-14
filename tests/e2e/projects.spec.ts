import { smartTest, expect } from '../../src/fixtures/smart.fixture';

const DK_USER = process.env.DK_USER!;
const SMART_PASSWORD = process.env.SMART_PASSWORD!;
const BASE_URL = process.env.SMART_BASE_URL;

smartTest.describe('Projects', () => {
    smartTest.use({ storageState: "playwright/.auth/api-dk-user.json" });

    smartTest('open projects page and find project',
        async ({ page, smartLogin }) => {
            // await smartLogin.login(DK_USER, SMART_PASSWORD);

            await page.goto(`${BASE_URL}/sales/my-projects?status=2`, { waitUntil: 'domcontentloaded' });

            await expect(page.getByRole('heading', { name: 'My projects' })).toBeVisible();
            await expect(page.getByTestId("status").nth(3)).toBeVisible();
        });
});