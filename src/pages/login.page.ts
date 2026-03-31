import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-cy="input-email"] input');
    this.passwordInput = page.locator('[data-cy="input-password"] input');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-cy="button-submit"]');
    this.loginLogo = page.locator('.login_logo');
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.loginLogo).toBeVisible();
    await expect(this.page).toHaveURL('/');
  }

  async assertErrorVisible(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
}
