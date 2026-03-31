import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly burgerMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.burgerMenu = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async assertOnInventoryPage(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
    await expect(this.page).toHaveURL('/inventory.html');
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async addItemToCartByName(itemName: string): Promise<void> {
    const item = this.page.locator('.inventory_item', { hasText: itemName });
    await item.locator('button').click();
  }

  async getCartBadgeCount(): Promise<number> {
    const text = await this.shoppingCartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async logout(): Promise<void> {
    await this.burgerMenu.click();
    await this.logoutLink.click();
  }

  getItemByName(name: string): Locator {
    return this.page.locator('.inventory_item', { hasText: name });
  }
}
