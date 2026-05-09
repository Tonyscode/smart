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
    smartTest('@create_activity should create a new activity with valid data',
        async ({ page, activitiesPage, request }) => {
            let getActivitiesList: unknown;
            let activities: [];
            const opidCookie = (await page.context().cookies()).find(cookie => cookie.name === 'OPID')?.value;
            // console.log("opid", opidCookie)

            async function activityPage() {
                await page.goto(`${BASE_URL}/sales/my-activities`, { waitUntil: 'domcontentloaded' });
                const responsePromise = page.waitForResponse(
                    r => r.url().includes('/api/v3/me/activities') && r.status() === 200
                );
                await responsePromise;
                await responsePromise;
                await responsePromise;
                await expect(page.getByRole('heading', { name: "My activities" })).toBeVisible();
            }

            async function getActivityId() {
                getActivitiesList = await request.get(
                    BASE_URL + "/api/v3/me/activities?filter=activity_type_id:not_in:[4]&language_id=1&utc_offset=+02:00&offset=0&sort=start_date_time:d&limit=30",
                    {
                        headers: {
                            Authorization: `Bearer ${opidCookie}`,
                            'request-type': 'query',
                        },
                    }
                );

                expect(getActivitiesList.status()).toBe(200);

                //get the list of activities
                const resultBody = await getActivitiesList.json();
                activities = resultBody.result.data.map(item => item.id);
                console.log("Product ID:", activities);
            }

            await activityPage();
            await getActivityId();
            if (activities.length === 0) {
                console.warn("No activities found.");
                return;
            }
            //Verify that there is at least 1 activity, if there are more - delete all except the most recent one
            await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();
            if (activities.length > 1) {
                // Delete all activities except the most recent one
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
                    // console.log("Delete response body:", body.result);
                    console.trace("Deleted activity ID:", activities[i]);
                };
            }
            //Go to the projects page and add a new activity to the most recent project
            await page.goto(`${BASE_URL}/sales/my-projects?status=2`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('[data-cy="entity-link"]');
            const entityLinks = await page.getByTestId('entity-link');
            await page.waitForSelector('a[title="Activities"]');
            const count = await entityLinks.count();
            console.log("count entity-link  = ", count);
            await entityLinks.nth(1).click();

            await page.waitForLoadState('networkidle');

            // const element = await page.waitForSelector('[data-cy="save-mark-button"]');
            await page.waitForSelector('[data-cy="button-add-activity"]');
            await page.getByRole('button', { name: 'Add activity' }).click();
            await expect(page.getByRole('button', { name: 'Save activity' })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Activity for' })).toBeVisible();
            // await page.waitForSelector('textarea');
            // const noteInput = page.locator('[data-cy="input-note"] textarea');
            const date = (new Date()).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
            const noteInput = page.locator('[data-cy="input-note"] textarea');
            await expect(noteInput).toBeVisible();

            await noteInput.fill(`New note ` + date);;
            await page.getByRole('button', { name: 'Save activity' }).click();

            await activityPage();
            await getActivityId();

            console.log("activities after creation", activities.length);
            // await activitiesPage.clearFiltersIfActive();
            // await activitiesPage.deleteAllExceptLast();
            // expect(await activitiesPage.activityLinks.count()).toBe(1);
            // // await projectCardPage.addActivityButton.click();
        });
});