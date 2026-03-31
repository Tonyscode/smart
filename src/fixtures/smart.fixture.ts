import { test as base } from '@playwright/test';
import { SmartLoginPage } from '../pages/smart/smart-login.page';
import { ActivitiesPage } from '../pages/smart/activities.page';
import { NotesPage } from '../pages/smart/notes.page';
import { ProjectCardPage } from '../pages/smart/project-card.page';

type SmartPages = {
  smartLogin: SmartLoginPage;
  activitiesPage: ActivitiesPage;
  notesPage: NotesPage;
  projectCardPage: ProjectCardPage;
};

/**
 * Smart-app fixture — provides typed page objects.
 *
 * Authentication strategy (choose one in playwright.config.ts):
 *
 *  A) storageState (recommended, fast):
 *     Set `storageState: 'playwright/.auth/activity-user.json'` in the project config.
 *     The session is created once by tests/setup/auth.setup.ts.
 *     Tests start already logged in — no UI login per test.
 *
 *  B) API login (fastest):
 *     Set `storageState` to a file produced by an API-based setup script.
 *
 *  C) UI login per test (slowest, use only when needed):
 *     Call `await smartLogin.login(email, password)` explicitly inside the test.
 *     Useful when a test needs to switch users mid-flow.
 */
export const smartTest = base.extend<SmartPages>({
  smartLogin: async ({ page }, use) => {
    await use(new SmartLoginPage(page));
  },

  activitiesPage: async ({ page }, use) => {
    await use(new ActivitiesPage(page));
  },

  notesPage: async ({ page }, use) => {
    await use(new NotesPage(page));
  },

  projectCardPage: async ({ page }, use) => {
    await use(new ProjectCardPage(page));
  },
});

export { expect } from '@playwright/test';
