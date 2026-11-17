import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly itemPrices: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async sortBy(optionValue: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(optionValue);
  }

  async getAllPrices(): Promise<number[]> {
    const priceTexts = await this.itemPrices.allTextContents();
    return priceTexts.map((price) => parseFloat(price.replace('$', '')));
  }

  async addProductToCartByIndex(index: number) {
    const addButtons = this.page.locator('button[data-test^="add-to-cart"]');
    await addButtons.nth(index).click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
