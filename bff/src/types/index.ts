import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

