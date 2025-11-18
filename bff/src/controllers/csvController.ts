import { Response } from 'express';
import { AuthRequest } from '../types';
import { coreService } from '../services/coreService';

export const exportTransactionsCsv = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const month = req.query.month as string;

    // Build date filters for the month
    let startDate: string | undefined;
    let endDate: string | undefined;
    if (month) {
      const year = parseInt(month.substring(0, 4));
      const monthNum = parseInt(month.substring(4, 6));
      startDate = new Date(year, monthNum - 1, 1).toISOString();
      endDate = new Date(year, monthNum, 0, 23, 59, 59).toISOString();
    }

    // Fetch transactions
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const queryString = queryParams.toString();
    const transactionsEndpoint = queryString ? `/core/transactions?${queryString}` : '/core/transactions';
    
    const transactionsResponse = await coreService.callCore(transactionsEndpoint, 'GET', undefined, userId);
    if (!transactionsResponse.success) {
      return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }

    // Fetch accounts and categories for name resolution
    const accountsResponse = await coreService.callCore('/core/accounts', 'GET', undefined, userId);
    const categoriesResponse = await coreService.callCore('/core/categories', 'GET', undefined, userId);

    if (!accountsResponse.success || !categoriesResponse.success) {
      return res.status(500).json({ success: false, message: 'Failed to fetch accounts or categories' });
    }

    const accounts = accountsResponse.data || [];
    const categories = categoriesResponse.data || [];
    const transactions = transactionsResponse.data || [];

    // Create maps for quick lookup
    const accountMap = new Map(accounts.map((acc: any) => [acc.id, acc.name]));
    const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat.name]));

    // Generate CSV
    const csvRows = ['date,accountName,categoryName,type,amount,description,merchantName'];
    
    for (const transaction of transactions) {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      const accountName = accountMap.get(transaction.accountId) || 'Unknown';
      const categoryName = transaction.categoryId ? (categoryMap.get(transaction.categoryId) || 'Uncategorized') : 'Uncategorized';
      const row = [
        date,
        accountName,
        categoryName,
        transaction.type,
        transaction.amount,
        `"${transaction.description.replace(/"/g, '""')}"`,
        `"${transaction.merchantName.replace(/"/g, '""')}"`
      ].join(',');
      csvRows.push(row);
    }

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${month || 'all'}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

export const exportMonthlyReportCsv = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let month = req.query.month as string;
    
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Fetch dashboard summary
    const dashboardResponse = await coreService.callCore(`/core/dashboard/summary?month=${month}`, 'GET', undefined, userId);
    if (!dashboardResponse.success) {
      return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
    }

    const data = dashboardResponse.data;
    const budgets = data.budgets || [];

    // Generate CSV
    const csvRows = ['categoryName,spent,monthlyLimit,remaining,status'];
    
    for (const budget of budgets) {
      const spent = budget.spent || 0;
      const limit = budget.monthlyLimit || 0;
      const remaining = limit - spent;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      
      let status = 'UNDER';
      if (percent >= 100) {
        status = 'OVER';
      } else if (percent >= 80) {
        status = 'CLOSE';
      }

      const row = [
        budget.categoryName,
        spent,
        limit,
        remaining,
        status
      ].join(',');
      csvRows.push(row);
    }

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${month}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

