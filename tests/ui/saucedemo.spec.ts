import { test, expect } from '../../src/fixtures/base.fixture';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import users from '../../src/data/users.json';

test.describe('SauceDemo UI Automation Suite @ui', () => {
  test('TC_UI_001: Successful login with standard user', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standardUser.username, users.standardUser.password);

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('TC_UI_002: Locked out user login displays error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOutUser.username, users.lockedOutUser.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(users.lockedOutUser.expectedError);
  });

  test('TC_UI_003: Sort products by Price (low to high) using pre-authenticated state', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    await inventoryPage.goto();

    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getAllPrices();

    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  });

  test('TC_UI_004: Complete end-to-end checkout flow with 2 products', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    const cartPage = new CartPage(authenticatedPage);
    const checkoutPage = new CheckoutPage(authenticatedPage);

    await inventoryPage.goto();

    // Add 2 products and verify cart badge count
    await inventoryPage.addProductToCartByIndex(0);
    await inventoryPage.addProductToCartByIndex(1);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // Navigate to cart and verify 2 items
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // Complete checkout flow
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingDetails(
      users.checkoutInfo.firstName,
      users.checkoutInfo.lastName,
      users.checkoutInfo.postalCode
    );
    await checkoutPage.completeOrder();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
