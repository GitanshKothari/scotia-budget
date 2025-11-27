export interface User {
  id: string;
  email: string;
  name: string;
  themePreference: 'LIGHT' | 'DARK' | 'SYSTEM';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface Transaction {
  id: string;
  date: string;
  categoryId: string;
  amount: number;
  description: string;
  merchantName: string;
}

export interface Budget {
  id: number | string;
  category: string;
  limit: number;
  color?: string;
}

