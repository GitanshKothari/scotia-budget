import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name });
    }
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch('/api/users/me', formData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const defaultCategories = categories.filter(c => c.isDefault);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
            Save Profile
          </button>
        </form>
      </div>

      {/* Category Management */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
        
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Default Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {defaultCategories.map((cat) => (
              <div key={cat.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

