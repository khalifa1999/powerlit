import React from 'react';
import { Zap, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#265a39] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-[#fdce4e]" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">PowerLit</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link 
            to="/pricing" 
            className="text-sm text-gray-600 hover:text-[#265a39] transition-colors font-medium"
          >
            Pricing
          </Link>
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#265a39] transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.full_name || user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-[#265a39] transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-[#265a39] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#1e4a2d] transition-all-smooth shadow-lg shadow-[#265a39]/25"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
