import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDollarSign, 
  FaTimes,
  FaUtensils,
  FaCar,
  FaHome,
  FaLightbulb,
  FaShoppingBag,
  FaGamepad
} from 'react-icons/fa';

interface Transaction {
  id: string;
  date: string;
  categoryId: string;
  amount: number;
  description: string;
  merchantName: string;
}

const TransactionsPage: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    merchantName: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    endDate: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchCategories = async () => {
    const response = await apiClient.get('/api/categories');
    if (response.data.success) setCategories(response.data.data);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await apiClient.get(`/api/transactions?${params.toString()}`);
      if (response.data.success) setAllTransactions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions client-side based on search
  const transactions = allTransactions
    .filter(t => {
      if (!searchInput.trim()) return true;
      const searchLower = searchInput.toLowerCase();
      return t.description.toLowerCase().includes(searchLower) || 
             t.merchantName.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, most recent first


  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validation: amount must be greater than 0
    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrors({ amount: 'Amount must be greater than 0' });
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: amountValue,
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId
      };

      if (editingTransaction) {
        await apiClient.patch(`/api/transactions/${editingTransaction.id}`, payload);
      } else {
        await apiClient.post('/api/transactions', payload);
      }
      
      setShowModal(false);
      setEditingTransaction(null);
      setErrors({});
      setFormData({
        categoryId: '',
        amount: '',
        description: '',
        merchantName: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
    } catch (error: any) {
      console.error('Failed to save transaction', error);
      
      // Extract validation errors from backend response
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        // Check if it's a validation error with field-specific messages
        // Format: "Validation failed: {amount=Amount must be positive, description=Description is required}"
        if (errorMessage.includes('Validation failed:')) {
          try {
            // Extract the map part: {amount=Amount must be positive, description=Description is required}
            const errorMatch = errorMessage.match(/\{([^}]+)\}/);
            if (errorMatch) {
              const errorMap: Record<string, string> = {};
              const mapContent = errorMatch[1];
              
              // Split by comma, but be careful with commas inside error messages
              // Simple approach: split by ", " (comma followed by space) which is the Java Map.toString() format
              const errorPairs = mapContent.split(/,\s*(?=\w+=)/);
              errorPairs.forEach(pair => {
                const equalIndex = pair.indexOf('=');
                if (equalIndex > 0) {
                  const key = pair.substring(0, equalIndex).trim();
                  const value = pair.substring(equalIndex + 1).trim();
                  if (key && value) {
                    errorMap[key] = value;
                  }
                }
              });
              
              if (Object.keys(errorMap).length > 0) {
                setErrors(errorMap);
              } else {
                setErrors({ general: errorMessage });
              }
            } else {
              setErrors({ general: errorMessage });
            }
          } catch (parseError) {
            setErrors({ general: errorMessage });
          }
        } else {
          setErrors({ general: errorMessage });
        }
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Failed to save transaction. Please try again.' });
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setErrors({});
    setFormData({
      categoryId: transaction.categoryId,
      amount: transaction.amount.toString(),
      description: transaction.description,
      merchantName: transaction.merchantName,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      await apiClient.delete(`/api/transactions/${transactionId}`);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setErrors({});
    setFormData({
      categoryId: '',
      amount: '',
      description: '',
      merchantName: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const openAddModal = () => {
    setEditingTransaction(null);
    setErrors({});
    setFormData({
      categoryId: categories[0]?.id || '',
      amount: '',
      description: '',
      merchantName: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // Get category icon based on category name
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('food') || name.includes('grocery') || name.includes('groceries')) {
      return <FaUtensils className="w-3.5 h-3.5" />;
    }
    if (name.includes('transport') || name.includes('gas') || name.includes('transportation')) {
      return <FaCar className="w-3.5 h-3.5" />;
    }
    if (name.includes('housing') || name.includes('rent')) {
      return <FaHome className="w-3.5 h-3.5" />;
    }
    if (name.includes('entertainment') || name.includes('cinema') || name.includes('game')) {
      return <FaGamepad className="w-3.5 h-3.5" />;
    }
    if (name.includes('utility') || name.includes('bill') || name.includes('bills')) {
      return <FaLightbulb className="w-3.5 h-3.5" />;
    }
    if (name.includes('shopping') || name.includes('shop')) {
      return <FaShoppingBag className="w-3.5 h-3.5" />;
    }
    if (name.includes('salary') || name.includes('income')) {
      return <FaDollarSign className="w-3.5 h-3.5" />;
    }
    return <FaShoppingBag className="w-3.5 h-3.5" />;
  };

  // Get category background color based on category name
  const getCategoryBgColor = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('food') || name.includes('grocery') || name.includes('groceries')) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
    }
    if (name.includes('transport') || name.includes('gas') || name.includes('transportation')) {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
    }
    if (name.includes('housing') || name.includes('rent')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
    if (name.includes('entertainment') || name.includes('cinema') || name.includes('game')) {
      return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
    }
    if (name.includes('utility') || name.includes('bill') || name.includes('bills')) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    }
    if (name.includes('shopping') || name.includes('shop')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    }
    if (name.includes('salary') || name.includes('income')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <button 
          onClick={openAddModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <FaPlus className="w-5 h-5" /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white dark:bg-gray-700 dark:text-white"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchInput.trim() || filters.categoryId || filters.startDate || filters.endDate
                      ? 'No transactions found. Try adjusting your filters or search terms.'
                      : 'No transactions found. Get started by adding your first transaction.'}
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const category = categories.find(c => c.id === t.categoryId);
                  const isDebit = parseFloat(t.amount.toString()) < 0;
                  const amount = Math.abs(parseFloat(t.amount.toString()));
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryBgColor(category?.name || '')}`}>
                            {getCategoryIcon(category?.name || '')}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white block">{t.description}</span>
                            {t.merchantName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{t.merchantName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBgColor(category?.name || '')}`}>
                          {category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        isDebit ? 'text-gray-900 dark:text-white' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {isDebit ? '-' : '+'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(t)} 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)} 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button 
                onClick={handleCancel} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmitTransaction} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input 
                    required 
                    type="text" 
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white ${
                      errors.description 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={formData.description} 
                    onChange={e => {
                      setFormData({...formData, description: e.target.value});
                      if (errors.description) setErrors({...errors, description: ''});
                    }} 
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white ${
                        errors.amount 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      value={formData.amount} 
                      onChange={e => {
                        setFormData({...formData, amount: e.target.value});
                        if (errors.amount) setErrors({...errors, amount: ''});
                      }} 
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input 
                      required 
                      type="date" 
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white ${
                        errors.date 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      value={formData.date} 
                      onChange={e => {
                        setFormData({...formData, date: e.target.value});
                        if (errors.date) setErrors({...errors, date: ''});
                      }} 
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white ${
                      errors.categoryId 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={formData.categoryId} 
                    onChange={e => {
                      setFormData({...formData, categoryId: e.target.value});
                      if (errors.categoryId) setErrors({...errors, categoryId: ''});
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Merchant</label>
                  <input 
                    type="text" 
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white ${
                      errors.merchantName 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={formData.merchantName} 
                    onChange={e => {
                      setFormData({...formData, merchantName: e.target.value});
                      if (errors.merchantName) setErrors({...errors, merchantName: ''});
                    }} 
                  />
                  {errors.merchantName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.merchantName}</p>
                  )}
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                  >
                    Save Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

