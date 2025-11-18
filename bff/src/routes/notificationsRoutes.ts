import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { coreService } from '../services/coreService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const queryParams = new URLSearchParams();
    if (req.query.unreadOnly === 'true') {
      queryParams.append('unreadOnly', 'true');
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/core/notifications?${queryString}` : '/core/notifications';
    const response = await coreService.callCore(endpoint, 'GET', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to fetch notifications' };
    res.status(status).json(data);
  }
});

router.post('/markRead', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore('/core/notifications/markRead', 'POST', req.body, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to mark notifications as read' };
    res.status(status).json(data);
  }
});

export default router;

