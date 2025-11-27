import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { Icons } from '../components/Icons';
import { Modal } from '../components/Modal';
import { Transaction, Budget } from '../types';
import { COLORS } from '../data';

interface ApiBudget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  isActive: boolean;
}

const BudgetsPage: React.FC = () => {
  const [apiBudgets, setApiBudgets] = useState<ApiBudget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ category: '', limit: '', categoryId: '' });

  // Transform API budgets to UI format
  const budgets: Budget[] = apiBudgets.map((b, idx) => {
    const category = categories.find(c => c.id === b.categoryId);
    return {
      id: b.id,
      category: category?.name || 'Unknown',
      limit: b.monthlyLimit,
      color: COLORS[idx % COLORS.length]
    };
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCategories(),
          fetchBudgets(),
          fetchDashboardData(),
          fetchTransactions()
        ]);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data.filter((c: any) => c.type === 'EXPENSE'));
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await apiClient.get('/api/budgets');
      if (response.data.success) {
        setApiBudgets(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch budgets', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const response = await apiClient.get(`/api/dashboard?month=${month}`);
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await apiClient.get('/api/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  const calculateSpent = (category: string) => {
    const categoryObj = categories.find(c => c.name === category);
    if (!categoryObj) return 0;

    // First try to get from dashboard data
    if (dashboardData?.budgets) {
      const budgetSummary = dashboardData.budgets.find((b: any) => b.categoryId === categoryObj.id);
      if (budgetSummary?.spent !== undefined) {
        return parseFloat(budgetSummary.spent.toString());
      }
    }

    // Fallback to calculating from transactions
    const categoryTransactions = transactions.filter(t => t.categoryId === categoryObj.id && t.amount < 0);
    return categoryTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this budget category?')) {
      try {
        await apiClient.delete(`/api/budgets/${id}`);
        setApiBudgets(prev => prev.filter(b => b.id !== id));
        await fetchDashboardData();
      } catch (error) {
        console.error('Failed to delete budget', error);
        await fetchBudgets();
      }
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ category: '', limit: '', categoryId: categories[0]?.id || '' });
    setIsModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditId(b.id.toString());
    const categoryObj = categories.find(c => c.name === b.category);
    setFormData({ 
      category: b.category, 
      limit: b.limit.toString(),
      categoryId: categoryObj?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.patch(`/api/budgets/${editId}`, {
          categoryId: formData.categoryId,
          monthlyLimit: parseFloat(formData.limit)
        });
      } else {
        await apiClient.post('/api/budgets', {
          categoryId: formData.categoryId,
          monthlyLimit: parseFloat(formData.limit)
        });
      }
      setIsModalOpen(false);
      setFormData({ category: '', limit: '', categoryId: '' });
      await fetchBudgets();
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to save budget', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <button 
          onClick={openAddModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Icons.Plus className="w-5 h-5" /> Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="mb-4">No budgets created yet.</p>
            <p className="text-sm">Get started by creating your first budget category.</p>
          </div>
        ) : (
          budgets.map((budget, idx) => {
            const spent = calculateSpent(budget.category);
            const percent = Math.min(100, (spent / budget.limit) * 100);
            const isOver = spent > budget.limit;
            const budgetColor = budget.color || COLORS[idx % COLORS.length];

            return (
              <div 
                key={budget.id} 
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(budget)} 
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-100 dark:border-gray-600 transition-colors"
                  >
                    <Icons.Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(budget.id.toString())} 
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-100 dark:border-gray-600 transition-colors"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: budgetColor }}
                  ></div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{budget.category}</h3>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Spent</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Limit</span>
                    <span className="text-gray-900 dark:text-white">
                      ${budget.limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : ''}`} 
                    style={{ 
                      width: `${percent}%`, 
                      backgroundColor: isOver ? '#ef4444' : budgetColor 
                    }}
                  ></div>
                </div>

                <p className={`text-xs mt-3 font-medium ${isOver ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {isOver 
                    ? `Over by $${(spent - budget.limit).toFixed(2)}` 
                    : `${(100 - percent).toFixed(1)}% remaining`
                  }
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editId ? 'Edit Budget' : 'New Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name
            </label>
            <select
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
              value={formData.categoryId}
              onChange={e => {
                const selectedCategory = categories.find(c => c.id === e.target.value);
                setFormData({
                  ...formData, 
                  categoryId: e.target.value,
                  category: selectedCategory?.name || ''
                });
              }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monthly Limit
            </label>
            <input 
              required 
              type="number" 
              min="0" 
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" 
              value={formData.limit} 
              onChange={e => setFormData({...formData, limit: e.target.value})} 
              placeholder="0.00"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
