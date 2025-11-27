import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SettingsDialog from '../components/SettingsDialog';
import { 
  FaThLarge, 
  FaList, 
  FaChartPie, 
  FaSun,
  FaMoon,
  FaWallet,
  FaChevronRight
} from 'react-icons/fa';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaThLarge },
    { path: '/transactions', label: 'Transactions', icon: FaList },
    { path: '/budgets', label: 'Budgets', icon: FaChartPie },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaWallet className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinTracker</h1>
          </div>
        </div>

        {/* Menu Section - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-4">
            MENU
          </p>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - User Profile and Actions - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <FaSun className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <FaMoon className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium">Dark Mode</span>
              </>
            )}
          </button>

          {/* User Profile Card - Opens Settings Dialog */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
          >
            {/* Profile Picture */}
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {user ? getInitials(user.name) : 'U'}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            
            {/* Action Icon */}
            <FaChevronRight className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Content - Offset for fixed sidebar */}
      <div className="ml-64 min-h-screen">
        {/* Main Content Area */}
        <main className="p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default MainLayout;

