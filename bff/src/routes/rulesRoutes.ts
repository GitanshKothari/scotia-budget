import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { coreService } from '../services/coreService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore('/core/rules', 'GET', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to fetch rules' };
    res.status(status).json(data);
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore('/core/rules', 'POST', req.body, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to create rule' };
    res.status(status).json(data);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore(`/core/rules/${req.params.id}`, 'DELETE', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to delete rule' };
    res.status(status).json(data);
  }
});

export default router;

