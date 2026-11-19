import { test, expect } from '../../src/fixtures/base.fixture';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import users from '../../src/data/users.json';

test.describe('SauceDemo UI Automation Suite @ui', () => {
  test('TC_UI_001: Successful login with standard user', async ({ page, loginPage, inventoryPage }) => {
   // Navigate to the login page
    await loginPage.goto();

    // Verify the login page elements are visible
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();


    // Login with standard user
    await loginPage.login(users.standardUser.username, users.standardUser.password);

    // Verify the inventory page is loaded
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('TC_UI_002: Data-Driven Invalid Login Validation', async ({ loginPage }) => {
    // Navigate to the login page, Scenario A — No Username:
    await loginPage.goto();
    await expect(loginPage.errorMessage).not.toBeVisible();
    await loginPage.login(users.emptyUsername.username,  users.standardUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(users.emptyUsername.expectedError);

    //Scenario B — No Password:
    await loginPage.goto();
    await expect(loginPage.errorMessage).not.toBeVisible();
    await loginPage.login(users.standardUser.username, '');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(users.emptyPassword.expectedError);

    //Scenario C — Invalid credentials:
    await loginPage.goto();
    await expect(loginPage.errorMessage).not.toBeVisible();
    await loginPage.login(users.invalidCredentials.username, users.invalidCredentials.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(users.invalidCredentials.expectedError);
  });

  test('TC_UI_003: Verify Products Sorted in Descending Alphabetical Order (Z to A)', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    await inventoryPage.goto();

    await inventoryPage.sortBy('za');
    const productNames = await inventoryPage.getAllProductNames();

    const sortedNames = [...productNames].sort((a, b) => b.localeCompare(a));
    expect(productNames).toEqual(sortedNames);
  });

  test('TC_UI_004: Complete end-to-end checkout flow with 2 products', async ({ authenticatedPage }) => {
  // Log-in with standard user
  await loginPage.goto();
  await loginPage.login(users.standardUser.username, users.standardUser.password);

  // Verify the inventory page is loaded
  await expect(page).toHaveURL(/.*inventory\.html/);    
  await expect(inventoryPage.pageTitle).toHaveText('Products');

// Add two most expensive products to the cart
  await inventoryPage.addTwoMostExpensiveProducts();
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
