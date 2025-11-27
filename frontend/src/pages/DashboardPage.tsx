import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { 
  FaUtensils, 
  FaCar, 
  FaHome, 
  FaGamepad, 
  FaLightbulb, 
  FaDollarSign,
  FaShoppingBag,
  FaCreditCard,
  FaBriefcase,
  FaChartLine
} from 'react-icons/fa';

interface Transaction {
  id: string;
  date: string;
  categoryId: string;
  type: string;
  amount: number;
  description: string;
  merchantName: string;
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchDashboardData();
    fetchRecentTransactions();
    fetchCategories();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/dashboard?month=${selectedMonth}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await apiClient.get('/api/transactions');
      if (response.data.success) {
        const sorted = response.data.data
          .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentTransactions(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch recent transactions', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  // Consistent color mapping for categories - using exact palette from provided data
  const getCategoryColorHex = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('housing') || name.includes('rent')) return '#3b82f6'; // Blue
    if (name.includes('food') || name.includes('grocery') || name.includes('groceries')) return '#f97316'; // Orange
    if (name.includes('transport') || name.includes('gas') || name.includes('transportation')) return '#8b5cf6'; // Purple
    if (name.includes('utility') || name.includes('bill') || name.includes('bills')) return '#eab308'; // Yellow
    if (name.includes('entertainment') || name.includes('cinema')) return '#ec4899'; // Pink
    if (name.includes('shopping') || name.includes('shop')) return '#10b981'; // Green
    if (name.includes('salary') || name.includes('income')) return '#10b981'; // Green (same as shopping)
    // Default fallback
    return '#6b7280'; // Gray
  };

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('grocery')) return 'bg-orange-500';
    if (name.includes('transport') || name.includes('gas')) return 'bg-purple-500';
    if (name.includes('housing') || name.includes('rent')) return 'bg-blue-500';
    if (name.includes('entertainment') || name.includes('cinema')) return 'bg-pink-500';
    if (name.includes('utility')) return 'bg-yellow-500';
    if (name.includes('salary') || name.includes('income')) return 'bg-green-500';
    return 'bg-gray-500';
  };

  // Get category background color based on category name (matches TransactionsPage)
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

  const getCategoryIcon = (categoryName: string, useWhiteIcon: boolean = false) => {
    const name = categoryName?.toLowerCase() || '';
    const iconClass = useWhiteIcon ? "text-white text-lg" : "w-3.5 h-3.5";
    if (name.includes('food') || name.includes('grocery') || name.includes('groceries')) {
      return <FaUtensils className={iconClass} />;
    }
    if (name.includes('transport') || name.includes('gas') || name.includes('transportation')) {
      return <FaCar className={iconClass} />;
    }
    if (name.includes('housing') || name.includes('rent')) {
      return <FaHome className={iconClass} />;
    }
    if (name.includes('entertainment') || name.includes('cinema') || name.includes('game')) {
      return <FaGamepad className={iconClass} />;
    }
    if (name.includes('utility') || name.includes('bill') || name.includes('bills')) {
      return <FaLightbulb className={iconClass} />;
    }
    if (name.includes('shopping') || name.includes('shop')) {
      return <FaShoppingBag className={iconClass} />;
    }
    if (name.includes('salary') || name.includes('income')) {
      return <FaDollarSign className={iconClass} />;
    }
    return <FaShoppingBag className={iconClass} />;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-blue-600">Failed to load dashboard data</div>;
  }

  // Calculate totals
  const totalSpent = data.spendingByCategory?.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0) || 0;
  const totalBudget = data.budgets?.reduce((sum: number, item: any) => sum + parseFloat(item.monthlyLimit || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;

  // Prepare data for charts
  const pieData = data.spendingByCategory?.map((item: any) => ({
    name: item.categoryName,
    value: parseFloat(item.amount || 0)
  })).filter((item: any) => item.value > 0) || [];

  // Budget vs Actual data
  const budgetVsActual = data.budgets?.map((budget: any) => {
    const spent = data.spendingByCategory?.find((s: any) => s.categoryId === budget.categoryId)?.amount || 0;
    return {
      name: budget.categoryName,
      category: budget.categoryName, // Keep for color mapping
      Budget: parseFloat(budget.monthlyLimit || 0),
      Actual: parseFloat(spent || 0)
    };
  }) || [];

  // Daily spending data
  const dailySpendingData = data.dailySpending?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: parseFloat(item.amount || 0)
  })) || [];

  // Get consistent colors for pie chart based on category names
  const getPieChartColor = (categoryName: string): string => {
    return getCategoryColorHex(categoryName);
  };


  // Custom legend renderer for Budget vs Actual chart
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex gap-4" style={{ fontSize: '11px' }}>
        {payload?.map((entry: any, index: number) => {
          const isBudget = entry.dataKey === 'Budget';
          const circleColor = isBudget ? '#d1d5db' : '#4b5563'; // Light gray for Budget, dark gray for Actual
          const textColor = isBudget ? '#9ca3af' : '#4b5563'; // Light gray for Budget, dark gray for Actual
          return (
            <div key={index} className="flex items-center gap-2">
              <span 
                style={{ 
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: circleColor
                }}
              />
              <span style={{ color: textColor }}>
                {isBudget ? 'Budget' : 'Actual'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Get consistent colors for bar chart based on category names
  // Returns light color for budget, dark color for actual
  // Uses same palette as pie chart but with light/dark variants
  const getBarChartColor = (categoryName: string, isBudget: boolean = false): string => {
    const name = categoryName.toLowerCase();
    
    // Housing/Rent - Blue (#3b82f6)
    if (name.includes('housing') || name.includes('rent')) {
      return isBudget ? '#bfdbfe' : '#3b82f6'; // Light blue for budget, dark blue for actual
    }
    // Food/Groceries - Orange (#f97316)
    if (name.includes('food') || name.includes('grocery') || name.includes('groceries')) {
      return isBudget ? '#fed7aa' : '#f97316'; // Light orange for budget, dark orange for actual
    }
    // Transportation - Purple (#8b5cf6)
    if (name.includes('transport') || name.includes('gas') || name.includes('transportation')) {
      return isBudget ? '#ddd6fe' : '#8b5cf6'; // Light purple for budget, dark purple for actual
    }
    // Utilities/Bills - Yellow (#eab308)
    if (name.includes('utility') || name.includes('bill') || name.includes('bills')) {
      return isBudget ? '#fef08a' : '#eab308'; // Light yellow for budget, dark yellow for actual
    }
    // Entertainment - Pink (#ec4899)
    if (name.includes('entertainment') || name.includes('cinema')) {
      return isBudget ? '#fbcfe8' : '#ec4899'; // Light pink for budget, dark pink for actual
    }
    // Shopping - Green (#10b981)
    if (name.includes('shopping') || name.includes('shop')) {
      return isBudget ? '#a7f3d0' : '#10b981'; // Light green for budget, dark green for actual
    }
    
    // Default fallback
    return isBudget ? '#e5e7eb' : '#6b7280'; // Light gray for budget, dark gray for actual
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Financial overview for {new Date(parseInt(selectedMonth.substring(0, 4)), parseInt(selectedMonth.substring(4, 6)) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
        >
          {getMonthOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent - Large Blue Card */}
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg relative overflow-hidden md:col-span-1">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaCreditCard className="text-2xl" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Spent</p>
            <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
            <button className="mt-4 px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition">
              This Month
            </button>
          </div>
          <div className="absolute right-0 top-0 opacity-10">
            <div className="w-32 h-32 border-4 border-white rounded-full -mr-16 -mt-16"></div>
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow relative">
          <div className="absolute top-4 right-4">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">PLANNED</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaBriefcase className="text-xl text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly Budget</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalBudget.toFixed(2)}</p>
        </div>

        {/* Remaining */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow relative">
          <div className="absolute top-4 right-4">
            <span className={`text-xs px-2 py-1 rounded ${remaining >= 0 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
              {remaining >= 0 ? 'ON TRACK' : 'OVER BUDGET'}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-xl text-green-600 dark:text-green-300" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Remaining</p>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget vs Actual Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Budget vs Actual</h3>
          <div className="h-[400px] w-full relative">
            <div className="absolute top-0 right-0 z-10">
              {renderCustomLegend({ payload: [
                { dataKey: 'Budget', color: '#d1d5db' },
                { dataKey: 'Actual', color: '#4b5563' }
              ] })}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={budgetVsActual} 
                margin={{ top: 50, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                />
                <Bar 
                  dataKey="Budget" 
                  name="Budget"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {budgetVsActual.map((entry: any, index: number) => (
                    <Cell key={`budget-${index}`} fill={getBarChartColor(entry.category, true)} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="Actual" 
                  name="Actual"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {budgetVsActual.map((entry: any, index: number) => (
                    <Cell key={`actual-${index}`} fill={getBarChartColor(entry.category, false)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Mix Donut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Spending Mix</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getPieChartColor(entry.name)} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  layout="horizontal" 
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Total</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Daily Spending Trend</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent transactions</p>
            ) : (
              recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const isDebit = transaction.type === 'DEBIT';
                return (
                  <div key={transaction.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryBgColor(category?.name || '')}`}>
                      {getCategoryIcon(category?.name || '', false)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()} • {category?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                      {isDebit ? '-' : '+'}${parseFloat(transaction.amount.toString()).toFixed(2)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;
