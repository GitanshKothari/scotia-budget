import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { coreService } from '../services/coreService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let month = req.query.month as string;
    
    // Default to current month if not provided
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const response = await coreService.callCore(`/core/dashboard/summary?month=${month}`, 'GET', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to fetch dashboard data' };
    res.status(status).json(data);
  }
});

export default router;

