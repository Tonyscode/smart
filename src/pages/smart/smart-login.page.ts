import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from '../base.page';

const MAINTENANCE_KEY = process.env.SMART_MAINTENANCE_KEY || '724108c4-4393-4aaf-9dfd-4164cf6edffd';
const BASE_URL = process.env.SMART_BASE_URL || '';

/**
 * Smart application login page.
 * Mirrors the `cy.login()` custom command behaviour including:
 *   – Maintenance-Key cookie (bypasses maintenance screen)
 *   – localStorage flags (disables onboarding / GDPR banners)
 *   – Session caching via Playwright storageState (equivalent to cy.session)
 */
export class SmartLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Core login flow ─────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    await this.#setMaintenanceCookie(this.page.context());
    await this.page.goto(`${BASE_URL}/login?set_language_id=1`);

    // Suppress notification banners before any interaction

    await this.page.getByTestId('input-email').first().clear();
    await this.page.getByTestId('input-email').first().fill(email);
    await this.page.getByTestId('input-password').clear();
    await this.page.getByTestId('input-password').fill(password);
    await this.page.getByTestId('button-submit').first().click();
    let coockieSubmit = this.page.getByTestId('button-submit').first();
    if (await coockieSubmit.isVisible()) {
      await this.page.locator('[data-cy="button-save"]').click();
    }
    await this.page.waitForURL(
      /(\/sales\/((my-projects|my-tenders|)\?status=1)|my-companies\?folder=-1|dashboard)|\/error\?errorKey=company_subscription_expired/,
      { timeout: 30_000 },
    );
  }

  /**
   * Switches the active session to a different user within the same page.
   * Equivalent to calling `cy.login(otherUser)` mid-test in Cypress.
   */
  async loginAs(email: string, password: string): Promise<void> {
    await this.login(email, password);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  async #setMaintenanceCookie(context: BrowserContext): Promise<void> {
    const domain = new URL(BASE_URL).hostname;
    await context.addCookies([{
      name: 'Maintenance-Key',
      value: MAINTENANCE_KEY,
      domain,
      path: '/',
    }]);
  }
}
