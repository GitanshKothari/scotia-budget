import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  isActive: boolean;
}

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ categoryId: '', monthlyLimit: '' });

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
    fetchDashboardData();
  }, []);

  const fetchCategories = async () => {
    const response = await apiClient.get('/api/categories');
    if (response.data.success) setCategories(response.data.data.filter((c: any) => c.type === 'EXPENSE'));
  };

  const fetchBudgets = async () => {
    const response = await apiClient.get('/api/budgets');
    if (response.data.success) setBudgets(response.data.data);
  };

  const fetchDashboardData = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const response = await apiClient.get(`/api/dashboard?month=${month}`);
    if (response.data.success) setDashboardData(response.data.data);
    setLoading(false);
  };

  const getSpentForCategory = (categoryId: string) => {
    if (!dashboardData) return 0;
    const budget = dashboardData.budgets?.find((b: any) => b.categoryId === categoryId);
    return budget?.spent || 0;
  };

  const getStatus = (spent: number, limit: number) => {
    const percent = (spent / limit) * 100;
    if (percent >= 100) return { text: 'OVER', color: 'text-red-600' };
    if (percent >= 80) return { text: 'CLOSE', color: 'text-yellow-600' };
    return { text: 'UNDER', color: 'text-green-600' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/budgets', {
        categoryId: formData.categoryId,
        monthlyLimit: parseFloat(formData.monthlyLimit)
      });
      setShowModal(false);
      setFormData({ categoryId: '', monthlyLimit: '' });
      fetchBudgets();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to save budget', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
        <button
          onClick={() => {
            setFormData({ categoryId: '', monthlyLimit: '' });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Budget
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monthly Limit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {budgets.map((budget) => {
              const category = categories.find(c => c.id === budget.categoryId);
              const spent = getSpentForCategory(budget.categoryId);
              const remaining = budget.monthlyLimit - spent;
              const status = getStatus(spent, budget.monthlyLimit);
              return (
                <tr key={budget.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{category?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${budget.monthlyLimit.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${spent.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${remaining.toFixed(2)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${status.color}`}>{status.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Budget</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Limit</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;

