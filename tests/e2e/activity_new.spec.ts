import { smartTest } from '../../src/fixtures/smart.fixture';
import { expect } from "@playwright/test";
import { checkValidDate, ACTIVITY_DATE_PATTERN } from '../../src/helpers/date.helper';
import { LoginPage } from '../../src/pages/login.page';
import { SmartLoginPage } from '../../src/pages/smart/smart-login.page';
// const ACTIVITY_USER = process.env.ACTIVITY_USER;
// const ACTIVITY1_USER = process.env.ACTIVITY1_USER;
// const SMART_PASSWORD = process.env.SMART_PASSWORD || 'smartuser';


smartTest.describe('Activities - New Activity', () => {
    smartTest.use({ storageState: "playwright/.auth/api-dk-user.json" });
    const BASE_URL = process.env.SMART_BASE_URL;
    smartTest('should create a new activity with valid data',
        async ({ page, activitiesPage, request }) => {
            const opidCookie = (await page.context().cookies()).find(cookie => cookie.name === 'OPID')?.value;
            console.log("opid", opidCookie)
            const responsePromise = page.waitForResponse(
                response => response.url().includes('/api/v3/me/activities') &&
                    response.status() === 200
            );
            await page.goto(`${BASE_URL}/sales/my-activities`);
            await expect(page.getByRole('heading', { name: "My activities" })).toBeVisible();
            await responsePromise;
            await expect(page.getByRole('heading', { name: "My activities" })).toBeVisible();
            await page.waitForResponse(
                response => response.url().includes('/api/v3/me/activities') && response.status() === 200
            );
            await expect(page.getByTestId("activity-type").nth(1)).toBeVisible();
            const getActivitiesList = await request.get(
                BASE_URL + "/api/v3/me/activities?filter=activity_type_id:not_in:[4]&language_id=1&utc_offset=+02:00&offset=0&sort=start_date_time:d&limit=30",
                {
                    headers: {
                        Authorization: `Bearer ${opidCookie}`,
                        'request-type': 'query',
                    },
                }
            );

            expect(getActivitiesList.status()).toBe(200);

            const resultBody = await getActivitiesList.json();
            const activities = resultBody.result.data.map(item => item.id);
            console.log("Product ID:", activities);
            for (let i = activities.length - 1; i > 0; i--) {
                const response = await request.delete(
                    BASE_URL + `/api/v1/me/activities/${activities[i]}`,
                    {
                        headers: {
                            Authorization: `Bearer ${opidCookie}`,
                            'request-type': 'command',
                        },
                    }
                );
                const body = await response.json();
                expect(response.status()).toBe(200);
                console.log("Delete response body:", body.result);
                console.trace("Deleted activity ID:", activities[i]);
            };

            await page.goto(`${BASE_URL}/sales/my-projects?status=2`)
            const count = await page.locator('a[title="Activities"]').count();
            console.log("count1  = ", count);
            await page.waitForSelector('a[title="Activities"]');

            // 2. Перевір frames
            console.log(page.frames().map(f => f.url()));
            console.log("count2  = ", count);
            // await page.getByTitle('Activities').nth(1).click()
            // await page.locator('textarea').click();
            // await page.locator('textarea').fill('note');
            // await page.getByRole('button', { name: 'Save activity' }).click();
            // await page.getByRole('button', { name: 'Close' }).click();


            // await activitiesPage.clearFiltersIfActive();
            // await activitiesPage.deleteAllExceptLast();
            // expect(await activitiesPage.activityLinks.count()).toBe(1);
            // // await projectCardPage.addActivityButton.click();
        });
});