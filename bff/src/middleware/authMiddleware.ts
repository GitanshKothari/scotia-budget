import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = {
        id: decoded.sub,
        email: decoded.email
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

