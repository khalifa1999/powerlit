import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload, FileText, Zap, LayoutDashboard, LogOut } from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  onUploadClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({  isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAnalysis } = useAnalysisStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    sessionStorage.clear();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#265a39] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#fdce4e]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">PowerLit</h1>
        </Link>
        <p className="text-sm text-gray-500 mt-1">Electrical Analysis AI</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {/* Dashboard Link */}
        <Link
          to="/dashboard"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            isActive('/dashboard')
              ? 'bg-[#265a39] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* Analyze Link */}
        <Link
          to="/analyze"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            isActive('/analyze')
              ? 'bg-[#265a39] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Upload className="w-5 h-5" />
          <span className="font-medium">New Analysis</span>
        </Link>

        {/* Upload Button */}
        {/* <button
          onClick={onUploadClick}
          className="w-full bg-[#265a39] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1e4a2d] transition-all-smooth shadow-lg shadow-[#265a39]/25 mt-4"
        >
          <Upload className="w-5 h-5" />
          Upload Blueprint
        </button> */}

        {currentAnalysis && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Current Analysis
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#265a39]" />
                <span className="text-sm truncate text-gray-900">{currentAnalysis.fileName}</span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-900 line-clamp-2 font-medium">
                  {currentAnalysis.summary}
                </p>
              </div>
              <div className="mt-2">
                <span className="text-xs px-2 py-1 rounded-lg font-medium bg-[#fdce4e] text-gray-900">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>PowerLit © 2024</p>
        </div>
      </div>
    </div>
    </>
  );
};
