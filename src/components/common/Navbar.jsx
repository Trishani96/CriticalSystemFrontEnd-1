import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-semibold text-gray-900">
              Secure Bank
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user.email}</span>
            <Link to="/simulator" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Fraud Lab
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
