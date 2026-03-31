import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage contains common methods shared across all page objects.
 * Every page class should extend this.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getTextContent(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}
