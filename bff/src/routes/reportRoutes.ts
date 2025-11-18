import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { exportMonthlyReportCsv } from '../controllers/csvController';

const router = express.Router();

router.use(authMiddleware);

router.get('/monthlyCsv', exportMonthlyReportCsv);

export default router;

