import { APIRequestContext, APIResponse } from '@playwright/test';

export class BooksApiClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getStatus(): Promise<APIResponse> {
    return await this.request.get('/status');
  }

  async getBooks(params?: { type?: 'fiction' | 'non-fiction'; limit?: number }): Promise<APIResponse> {
    return await this.request.get('/books', { params });
  }

  async registerClient(clientName: string, clientEmail: string): Promise<APIResponse> {
    return await this.request.post('/api-clients', {
      data: {
        clientName,
        clientEmail,
      },
    });
  }

  async createOrder(token: string, bookId: number, customerName: string): Promise<APIResponse> {
    return await this.request.post('/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        bookId,
        customerName,
      },
    });
  }

  async getOrder(token: string, orderId: string): Promise<APIResponse> {
    return await this.request.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteOrder(token: string, orderId: string): Promise<APIResponse> {
    return await this.request.delete(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
