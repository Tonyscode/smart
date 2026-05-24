import { smartTest } from '../../src/fixtures/smart.fixture';
import { expect, APIResponse } from "@playwright/test";
import { checkValidDate, ACTIVITY_DATE_PATTERN } from '../../src/helpers/date.helper';
import { SmartLoginPage } from '../../src/pages/smart/smart-login.page';
import { step } from 'allure-js-commons';

smartTest.describe('Activities - New Activity', () => {
    smartTest.use({ storageState: "playwright/.auth/api-dk-user.json" });
    const BASE_URL = process.env.SMART_BASE_URL;
    const date = (new Date()).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    smartTest('@create_activity should create a new activity with valid data',
        async ({ page, activitiesPage, request }) => {
            let getActivitiesList: APIResponse;
            let activities: number[] = [];
            const opidCookie = (await page.context().cookies()).find(cookie => cookie.name === 'OPID')?.value;
            // console.log("opid", opidCookie)

            // Factory: creates a FRESH listener on every call.
            // One waitForResponse = one resolution. Do not share across navigations.
            const waitForProjectsQueryWithData = () =>
                page.waitForResponse(async (r) => {
                    if (r.request().method() !== 'POST') return false;
                    if (!r.url().includes('/api/v1/me/projects/query')) return false;
                    if (r.status() !== 200) return false;
                    try {
                        const body = await r.json();
                        return Array.isArray(body?.result?.data) && body.result.data.length > 0;
                    } catch {
                        return false;
                    }
                }, { timeout: 30_000 });

            async function activityPage() {
                // Register both listeners BEFORE goto — otherwise a fast response can be missed.
                // The factory gives a fresh Promise on every activityPage() call,
                // so a repeated call in the final step also works correctly.
                const activityLoad = page.waitForResponse(
                    r => r.url().includes('/api/v3/me/activities') && r.status() === 200,
                    { timeout: 30_000 }
                );
                const projectsLoaded = waitForProjectsQueryWithData();

                await page.goto(`${BASE_URL}/sales/my-activities`);

                // The activities page does not render rows until data from both endpoints is loaded.
                await Promise.all([activityLoad, projectsLoaded]);

                await expect(page.getByRole('heading', { name: 'My activities' })).toBeVisible();
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
            await step('Go to activities page and get the list of activities for the user', async () => {

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
                        expect(response.status()).toBe(200);
                        console.log("activities:", activities.length);
                        console.trace("Deleted activity ID:", activities[i]);
                    };
                }
                //reload the page and get the list of activities again
                // await page.reload({ waitUntil: 'domcontentloaded' });
                // await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();

            })
            await step('Go to projects page, open the most recent project', async () => {

                // 1. Register a FRESH listener BEFORE goto — otherwise the request can be missed
                const projectsLoaded = waitForProjectsQueryWithData();

                // 2. Navigation
                await page.goto(`${BASE_URL}/sales/my-projects?status=2`, { waitUntil: 'domcontentloaded' });

                // 3. Network signal: wait for at least one response with non-empty data.
                //    Not critical if this is not the last of three — the UI anchor will handle the rest.
                //    catch in case the front-end resolves data without matching our predicate
                //    (e.g., data arrived from cache without an HTTP call).
                await projectsLoaded.catch(() => { /* fallback to UI anchor below */ });

                // 4. Main stability anchor — UI: exactly 3 rows in the DOM.
                //    Auto-retries; does not depend on the count/order of API calls.
                const entityLinks = page.getByTestId('entity-link');
                await expect(entityLinks).toHaveCount(3, { timeout: 30_000 });

                // 5. Response listeners for click — register BEFORE clicking
                const projectMeta = page.waitForResponse(
                    (r) => /\/api\/v1\/projects\/\d+(\?|$)/.test(r.url()) && r.status() === 200,
                    { timeout: 30_000 }
                );
                const projectActivities = page.waitForResponse(
                    (r) => /\/api\/v\d\/validate/.test(r.url()) && r.status() === 200,
                    { timeout: 30_000 }
                );

                await entityLinks.nth(1).click();
                await Promise.all([projectMeta, projectActivities]);

                // 6. UI confirmation that the project card is ready to add an activity
                await expect(page.getByTestId('button-add-activity')).toBeVisible({ timeout: 20_000 });
            });
            // await step('Claude API requests login', async () => {
            //     // ── ДІАГНОСТИКА: логуємо всі API-запити/відповіді ─────────────────
            //     const apiLog: string[] = [];
            //     const onResp = (r: import('@playwright/test').Response) => {
            //         const u = r.url();
            //         if (u.includes('/api/')) {
            //             apiLog.push(`[${r.request().method()}] ${r.status()} ${u}`);
            //         }
            //     };
            //     page.on('response', onResp);

            //     await page.goto(`${BASE_URL}/sales/my-projects?status=2`);

            //     const entityLinks = page.getByTestId('entity-link');

            //     // Чекаємо саме на UI-стабілізацію: 3 рядки в DOM.
            //     // Це авто-ретраїться і не залежить від кількості / порядку API-запитів.
            //     try {
            //         await expect(entityLinks).toHaveCount(3, { timeout: 20_000 });
            //     } catch (e) {
            //         console.log('--- API calls during /my-projects ---');
            //         apiLog.forEach((l) => console.log(l));
            //         console.log('Page URL at failure:', page.url());
            //         console.log('Page title at failure:', await page.title());
            //         // Скріншот у test-results для огляду
            //         await page.screenshot({ path: 'test-results/projects-page-debug.png', fullPage: true });
            //         throw e;
            //     } finally {
            //         page.off('response', onResp);
            //     }

            //     await entityLinks.nth(1).click();

            //     // Кнопка може бути в DOM, але прихована — чекаємо саме видимості.
            //     await expect(page.getByTestId('button-add-activity')).toBeVisible({ timeout: 20_000 });
            // });
            await step('Add a new activity and verify it is created successfully', async () => {

                await expect(page.getByTestId('button-add-activity')).toBeVisible();

                await page.getByRole('button', { name: 'Add activity' }).click();

                await expect(page.getByRole('button', { name: 'Save activity' })).toBeVisible();
                await expect(page.getByRole('heading', { name: 'Activity for' })).toBeVisible();
                const cardsBefore = await page.locator('.card-activity').count();
                console.log("cards before", cardsBefore);
                // const noteInput = page.locator('[data-cy="input-note"] textarea');
                const noteInput = page.getByTestId('input-title');
                await expect(noteInput).toBeVisible();

                await noteInput.fill(`New note ` + date);
                await page.getByRole('button', { name: 'Save activity' }).click();
                console.log("created activity", await page.locator('.card-activity', { hasText: `New note ` + date }).count());

                await expect(page.locator('.card-activity')).toHaveCount(cardsBefore + 1);
                // console.log("activity count", await page.locator('.card-activity').count());

            });
            await step('Go back to activities page and verify the new activity is listed', async () => {
                await activityPage();
                await getActivityId();
                await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();

                expect(activities.length).toBe(2);
                // Verify that the most recent activity has the correct note and date
                const mostRecentActivity = page.getByTestId('activity-type').last();
                await expect(mostRecentActivity).toBeVisible();
                await expect(page.getByRole('link', { name: `New note ${date}` })).toBeVisible();
            })

            // await activitiesPage.clearFiltersIfActive();
            // await activitiesPage.deleteAllExceptLast();
            // expect(await activitiesPage.activityLinks.count()).toBe(1);
            // // await projectCardPage.addActivityButton.click();
        });
});
