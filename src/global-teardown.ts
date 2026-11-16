import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const endTime = new Date().toISOString();
  console.log(`\n======================================================`);
  console.log(`🏁 [GLOBAL TEARDOWN] Test Suite Execution Finished at: ${endTime}`);
  console.log(`======================================================\n`);
}

export default globalTeardown;
