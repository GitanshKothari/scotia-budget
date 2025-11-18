export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  preferredCurrency: string;
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

