import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { coreService } from '../services/coreService';
import { authMiddleware } from '../middleware/authMiddleware';
import { exportTransactionsCsv } from '../controllers/csvController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const queryParams = new URLSearchParams();
    if (req.query.accountId) queryParams.append('accountId', req.query.accountId as string);
    if (req.query.categoryId) queryParams.append('categoryId', req.query.categoryId as string);
    if (req.query.startDate) queryParams.append('startDate', req.query.startDate as string);
    if (req.query.endDate) queryParams.append('endDate', req.query.endDate as string);
    if (req.query.minAmount) queryParams.append('minAmount', req.query.minAmount as string);
    if (req.query.maxAmount) queryParams.append('maxAmount', req.query.maxAmount as string);
    if (req.query.search) queryParams.append('search', req.query.search as string);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/core/transactions?${queryString}` : '/core/transactions';
    const response = await coreService.callCore(endpoint, 'GET', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to fetch transactions' };
    res.status(status).json(data);
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    // Basic validation
    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be positive' });
    }
    if (!req.body.type || !['DEBIT', 'CREDIT'].includes(req.body.type)) {
      return res.status(400).json({ success: false, message: 'Type must be DEBIT or CREDIT' });
    }

    const userId = req.user!.id;
    const response = await coreService.callCore('/core/transactions', 'POST', req.body, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to create transaction' };
    res.status(status).json(data);
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore(`/core/transactions/${req.params.id}`, 'PATCH', req.body, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to update transaction' };
    res.status(status).json(data);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const response = await coreService.callCore(`/core/transactions/${req.params.id}`, 'DELETE', undefined, userId);
    res.json(response);
  } catch (error: any) {
    const status = error.status || 500;
    const data = error.data || { success: false, message: 'Failed to delete transaction' };
    res.status(status).json(data);
  }
});

router.get('/exportCsv', exportTransactionsCsv);

export default router;

