import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {/* 404 Icon/Illustration */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold">
              404
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            The URL you entered may be incorrect or the page may have been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm shadow-blue-200"
          >
            <FaHome className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Quick Links:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/transactions"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Transactions
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              to="/budgets"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Budgets
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              to="/settings"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

