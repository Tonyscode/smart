import { smartTest } from '../../src/fixtures/smart.fixture';
import { checkValidDate, ACTIVITY_DATE_PATTERN } from '../../src/helpers/date.helper';
import { LoginPage } from '../../src/pages/login.page';
import { SmartLoginPage } from '../../src/pages/smart/smart-login.page';
const ACTIVITY_USER = process.env.ACTIVITY_USER || 'qasmartautotest+activity@gmail.com';
const ACTIVITY1_USER = process.env.ACTIVITY1_USER || 'qasmartautotest+activity1@gmail.com';
const SMART_PASSWORD = process.env.SMART_PASSWORD || 'smartuser';


smartTest.describe('Activities - New Activity', () => {
    smartTest.use({ storageState: "playwright/.auth/activity-user.json" });

    smartTest('should create a new activity with valid data',
        async ({ page, activitiesPage, smartLogin, projectCardPage }) => {

            // await smartLogin.login(ACTIVITY_USER, SMART_PASSWORD);
            await activitiesPage.goto();
            await activitiesPage.clearFiltersIfActive();
            await activitiesPage.deleteAllExceptLast();

            // await projectCardPage.addActivityButton.click();
        });
});