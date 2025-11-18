import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types';
import { coreService } from '../services/coreService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const response = await coreService.callCore('/core/auth/register', 'POST', req.body);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Registration failed' };
    res.status(status).json(data);
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const verifyResponse = await coreService.callCore('/core/auth/verify', 'POST', req.body);
    
    if (!verifyResponse.success) {
      return res.status(401).json(verifyResponse);
    }

    const user = verifyResponse.data;
    
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours
    };

    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

    res.json({
      success: true,
      data: {
        token,
        user
      }
    });
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Login failed' };
    res.status(status).json(data);
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore(`/core/users/${userId}`, 'GET');
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to fetch user' };
    res.status(status).json(data);
  }
});

export default router;

