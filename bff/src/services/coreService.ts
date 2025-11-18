import axios, { AxiosInstance } from 'axios';

const CORE_URL = process.env.CORE_URL || 'http://localhost:8080';

export class CoreService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CORE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async callCore(endpoint: string, method: string = 'GET', data?: any, userId?: string) {
    const config: any = {
      method,
      url: endpoint,
    };

    if (data) {
      config.data = data;
    }

    if (userId) {
      config.headers = {
        'X-User-Id': userId
      };
    }

    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data
        };
      }
      throw error;
    }
  }
}

export const coreService = new CoreService();

