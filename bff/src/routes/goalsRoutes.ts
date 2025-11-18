import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { coreService } from '../services/coreService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore('/core/goals', 'GET', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to fetch goals' };
    res.status(status).json(data);
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore('/core/goals', 'POST', req.body, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to create goal' };
    res.status(status).json(data);
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore(`/core/goals/${req.params.id}`, 'PATCH', req.body, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to update goal' };
    res.status(status).json(data);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore(`/core/goals/${req.params.id}`, 'DELETE', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to delete goal' };
    res.status(status).json(data);
  }
});

export default router;

