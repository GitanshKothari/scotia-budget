import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../lib/apiClient';

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchDashboardData();
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

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-red-600">Failed to load dashboard data</div>;
  }

  const COLORS = ['#ec111a', '#ff3d47', '#c00e15', '#ff6b6b', '#ff8787'];

  const pieData = data.spendingByCategory?.map((item: any) => ({
    name: item.categoryName,
    value: parseFloat(item.amount)
  })) || [];

  const getBudgetStatusColor = (spent: number, limit: number) => {
    const percent = (spent / limit) * 100;
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex justify-end">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {getMonthOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.accounts?.map((account: any) => (
          <div key={account.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{account.type}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${parseFloat(account.currentBalance).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Daily Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailySpending || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#ec111a" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Budget Overview</h3>
        <div className="space-y-4">
          {data.budgets?.map((budget: any) => {
            const percent = (budget.spent / budget.monthlyLimit) * 100;
            return (
              <div key={budget.categoryId}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-900 dark:text-white">{budget.categoryName}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ${parseFloat(budget.spent).toFixed(2)} / ${parseFloat(budget.monthlyLimit).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getBudgetStatusColor(budget.spent, budget.monthlyLimit)}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Safe to Spend: ${parseFloat(data.safeToSpend || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Savings Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.goals?.map((goal: any) => (
            <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${parseFloat(goal.currentAmount).toFixed(2)} / ${parseFloat(goal.targetAmount).toFixed(2)}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${Math.min(goal.progressPercent || 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {goal.progressPercent?.toFixed(1)}% complete
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

