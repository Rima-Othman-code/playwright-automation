import { test, expect } from '@playwright/test';
import { BooksApiClient } from '../../src/api/BooksApiClient';
import { generateUniqueEmail } from '../../src/utils/data-generator';

test.describe.serial('Simple Books API Automation Suite @api', () => {
  let apiClient: BooksApiClient;
  let authToken: string;
  let availableBookId: number;

  test.beforeEach(async ({ request }) => {
    apiClient = new BooksApiClient(request);
  });

  test('TC_API_001: Verify API health status returns 200 OK', async () => {
    const response = await apiClient.getStatus();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('OK');
  });

  test('TC_API_002: Retrieve filtered list of available books', async () => {
    const response = await apiClient.getBooks({ type: 'fiction', limit: 5 });
    expect(response.status()).toBe(200);

    const books = await response.json();
    expect(Array.isArray(books)).toBeTruthy();
    expect(books.length).toBeGreaterThan(0);
    expect(books.length).toBeLessThanOrEqual(5);

    for (const book of books) {
      expect(book.type).toBe('fiction');
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('name');
      expect(book).toHaveProperty('available');
    }

    const availableBook = books.find((b: { available: boolean }) => b.available === true);
    expect(availableBook).toBeDefined();
    availableBookId = availableBook.id;
  });

  test('TC_API_003: Register dynamic API client and extract Bearer token', async () => {
    const uniqueEmail = generateUniqueEmail();
    const response = await apiClient.registerClient('Rima QA Automation', uniqueEmail);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(10);

    authToken = body.accessToken;
  });

  test('TC_API_004: End-to-End order lifecycle (Create -> Get -> Delete -> Verify 404)', async () => {
    const customerName = 'Rima Othman';

    // 1. Create Order (POST /orders)
    const createResponse = await apiClient.createOrder(authToken, availableBookId, customerName);
    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    expect(createBody.created).toBe(true);
    expect(createBody).toHaveProperty('orderId');
    const orderId = createBody.orderId;

    // 2. Retrieve Order (GET /orders/:orderId)
    const getResponse = await apiClient.getOrder(authToken, orderId);
    expect(getResponse.status()).toBe(200);

    const orderDetails = await getResponse.json();
    expect(orderDetails.id).toBe(orderId);
    expect(orderDetails.bookId).toBe(availableBookId);
    expect(orderDetails.customerName).toBe(customerName);

    // 3. Delete Order (DELETE /orders/:orderId)
    const deleteResponse = await apiClient.deleteOrder(authToken, orderId);
    expect(deleteResponse.status()).toBe(204);

    // 4. Verify Deletion returns 404 Not Found
    const verifyDeletedResponse = await apiClient.getOrder(authToken, orderId);
    expect(verifyDeletedResponse.status()).toBe(404);
  });
});
