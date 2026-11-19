import { test, expect } from '@playwright/test';
import { BooksApiClient } from '../../src/api/BooksApiClient';
import { generateUniqueEmail } from '../../src/utils/data-generator';

test.describe.serial('Simple Books API Automation Suite @api', () => {
  let apiClient: BooksApiClient;
  let authToken: string;
  let bookId: number;
  let orderId: string;
  const customerName = 'Rima Othman';

  test.beforeEach(async ({ request }) => {
    apiClient = new BooksApiClient(request);
  });

  // TC_API_001: Authenticate Client and Create New Book Order
  test('TC_API_001: Authenticate Client and Create New Book Order', async () => {
    // 1. Send POST /api-clients/ with a dynamic email to generate a Bearer token
    const clientResponse = await apiClient.registerClient(customerName, generateUniqueEmail());
    expect(clientResponse.status()).toBe(201); 

    const clientBody = await clientResponse.json();
    expect(clientBody).toHaveProperty('accessToken');
    authToken = clientBody.accessToken;

    // Retrieve an available book to obtain a valid bookId
    const booksResponse = await apiClient.getBooks();
    expect(booksResponse.status()).toBe(200);
    const books = await booksResponse.json();
    const availableBook = books.find((b: any) => b.available === true);
    bookId = availableBook ? availableBook.id : 1;

    // 2. Send POST /orders utilizing the generated token, passing a valid bookId and customerName
    const orderResponse = await apiClient.createOrder(authToken, bookId, customerName);
    expect(orderResponse.status()).toBe(201);
    
    const orderBody = await orderResponse.json();
    expect(orderBody).toHaveProperty('created', true);
    expect(orderBody).toHaveProperty('orderId');
    expect(orderBody.orderId).toBeTruthy();

    // Extracting the orderId into the suite-level variable
    orderId = orderBody.orderId;
  });

  // TC_API_002: Retrieve Details of a Newly Created Order
  test('TC_API_002: Retrieve Details of a Newly Created Order', async () => {
    // 1. Send GET /orders/:orderId explicitly using the order ID generated and extracted in TC_API_001
    const getOrderResponse = await apiClient.getOrder(authToken, orderId);

    // 2. Assert a 200 OK status code
    expect(getOrderResponse.status()).toBe(200);

    // 3. Verify the response payload accurately reflects the bookId and customerName submitted during creation
    const orderDetails = await getOrderResponse.json();
    expect(orderDetails).toHaveProperty('id', orderId);
    expect(orderDetails).toHaveProperty('bookId', bookId);
    expect(orderDetails).toHaveProperty('customerName', customerName);
  });

  // TC_API_003: Modify Customer Name on an Existing Order
  test('TC_API_003: Modify Customer Name on an Existing Order', async () => {
    const updatedCustomerName = 'Rima Othman Updated';

    // 1. Send PATCH /orders/:orderId to update the customerName property
    const patchResponse = await apiClient.updateOrder(authToken, orderId, updatedCustomerName);

    // 2. Assert a 204 No Content status code
    expect(patchResponse.status()).toBe(204);

    // 3. Send a follow-up GET /orders/:orderId request to verify the customerName was successfully updated
    const getOrderResponse = await apiClient.getOrder(authToken, orderId);
    expect(getOrderResponse.status()).toBe(200);

    const orderDetails = await getOrderResponse.json();
    expect(orderDetails).toHaveProperty('customerName', updatedCustomerName);
  });

  // TC_API_004: Delete Existing Order and Verify 404 Not Found
  test('TC_API_004: Delete Existing Order and Verify 404 Not Found', async () => {
    // 1. Send DELETE /orders/:orderId for the created order
    const deleteResponse = await apiClient.deleteOrder(authToken, orderId);

    // 2. Assert a 204 No Content status code
    expect(deleteResponse.status()).toBe(204);

    // 3. Send a follow-up GET /orders/:orderId request
    const getOrderResponse = await apiClient.getOrder(authToken, orderId);

    // 4. Assert a 404 Not Found status code to confirm the record was completely removed
    expect(getOrderResponse.status()).toBe(404);
  });

});