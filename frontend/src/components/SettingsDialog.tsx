import React, { useState, useEffect } from 'react';
import { FaTimes, FaSignOutAlt } from 'react-icons/fa';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name });
    }
  }, [user, isOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch('/api/users/me', formData);
      // Show success message (you could use a toast library here)
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      
      {/* Dialog */}
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700 transform transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'dialogIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-opacity p-1"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Profile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your account information
              </p>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="name" 
                  className="text-sm font-medium leading-none text-gray-900 dark:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white transition-colors"
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium leading-none text-gray-900 dark:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-sm ring-offset-white cursor-not-allowed opacity-70 dark:text-gray-400 text-gray-600"
                />
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 dark:ring-offset-gray-800"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Sign Out Section */}
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 w-full dark:ring-offset-gray-800"
            >
              <FaSignOutAlt className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes dialogIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsDialog;

