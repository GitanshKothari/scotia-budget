import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../lib/apiClient';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.get('/api/notifications?unreadOnly=true');
        if (response.data.success) {
          setUnreadCount(response.data.data?.length || 0);
        }
      } catch (error) {
        // Ignore errors
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/accounts', label: 'Accounts', icon: '💳' },
    { path: '/transactions', label: 'Transactions', icon: '💰' },
    { path: '/budgets', label: 'Budgets', icon: '📈' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin', icon: '👤' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary">Scotia Budget</h1>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{pageTitle}</h2>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Notifications */}
              <div className="relative notifications-dropdown">
                <button
                  onClick={async () => {
                    if (!showNotifications) {
                      try {
                        const response = await apiClient.get('/api/notifications');
                        if (response.data.success) {
                          setNotifications(response.data.data || []);
                        }
                      } catch (error) {
                        console.error('Failed to fetch notifications', error);
                      }
                    }
                    setShowNotifications(!showNotifications);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 relative"
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto notifications-dropdown">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div
                            key={notif.id}
                            className={`p-4 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {user ? getInitials(user.name) : 'U'}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 hidden group-hover:block z-10">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

