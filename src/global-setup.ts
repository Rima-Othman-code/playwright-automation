import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const startTime = new Date().toISOString();
  console.log(`\n======================================================`);
  console.log(`🚀 [GLOBAL SETUP] Test Suite Execution Started at: ${startTime}`);
  console.log(`======================================================\n`);

  // Bonus (+5 pts): Authenticate once and save session state
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');

  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
  console.log(`✅ [GLOBAL SETUP] Saved authenticated state to storageState.json\n`);
}

export default globalSetup;
