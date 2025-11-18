import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <div className="text-center py-8 text-red-600">Access Denied. Admin only.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Panel</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400">Admin functionality coming soon...</p>
      </div>
    </div>
  );
};

export default AdminPage;

