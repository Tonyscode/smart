import { Page, BrowserContext, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

const MAINTENANCE_KEY = process.env.SMART_MAINTENANCE_KEY || '724108c4-4393-4aaf-9dfd-4164cf6edffd';
const BASE_URL = process.env.SMART_BASE_URL || '';

const SUCCESS_URL_RE = /(\/sales\/((my-projects|my-tenders|)\?status=1)|my-companies\?folder=-1|dashboard)|\/error\?errorKey=company_subscription_expired/;

export class SmartLoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  // Update this selector once you inspect the actual DOM for the error element
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly acceptPolicyButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('input-email').first();
    this.passwordInput = page.getByTestId('input-password');
    this.submitButton = page.getByTestId('button-submit').first();
    this.errorMessage = page.locator('.mini-toastr-notification__message').first();
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot/i });
    this.acceptPolicyButton = page.getByTestId('button-save');
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.#setMaintenanceCookie(this.page.context());
    await this.page.goto(`${BASE_URL}/login?set_language_id=1`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Granular form interactions ───────────────────────────────────────────────

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }
  async acceptPolicy(): Promise<void> {
    await this.acceptPolicyButton.click();
    await this.page.waitForLoadState('domcontentloaded');

  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  // ── High-level flows ────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();

    // Accept cookie-consent dialog if it appears after submit
    const cookieSave = this.page.getByTestId('button-save');
    try {
      await cookieSave.waitFor({ state: 'visible', timeout: 3_000 });
      await cookieSave.click();
    } catch {
      // dialog did not appear — skip
    }
  }

  /** Switches the active session to a different user within the same page. */
  async loginAs(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await expect(this.page.getByTestId('user-menu')).toBeVisible();
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertRedirectedToApp(): Promise<void> {
    await this.page.waitForURL(SUCCESS_URL_RE, { timeout: 30_000 });
    await this.page.waitForLoadState('domcontentloaded');

  }

  async assertStaysOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
  }

  async assertErrorVisible(text?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }

  async assertPasswordMasked(): Promise<void> {
    // The data-cy wrapper may contain an inner <input>; fall back to wrapper itself
    const inner = this.passwordInput.locator('input');
    const target = (await inner.count()) > 0 ? inner : this.passwordInput;
    await expect(target).toHaveAttribute('type', 'password');
  }

  async assertLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
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
