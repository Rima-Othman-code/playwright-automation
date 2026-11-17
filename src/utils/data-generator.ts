export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `rima.qa.${timestamp}.${randomSuffix}@example.com`;
}
