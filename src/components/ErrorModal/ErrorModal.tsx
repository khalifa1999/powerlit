import React from 'react';
import { X, AlertTriangle, RefreshCw, WifiOff, FileX, Clock, ServerOff } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  isRetryable?: boolean;
  onRetry?: () => void;
  errorType?: 'network' | 'timeout' | 'file' | 'server' | 'generic';
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = 'Analysis Failed',
  message,
  isRetryable = false,
  onRetry,
  errorType = 'generic'
}) => {
  if (!isOpen) return null;

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return <WifiOff className="w-12 h-12 text-red-500" />;
      case 'timeout':
        return <Clock className="w-12 h-12 text-amber-500" />;
      case 'file':
        return <FileX className="w-12 h-12 text-red-500" />;
      case 'server':
        return <ServerOff className="w-12 h-12 text-red-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'network':
        return 'Connection Problem';
      case 'timeout':
        return 'Analysis Taking Too Long';
      case 'file':
        return 'File Upload Issue';
      case 'server':
        return 'Server Busy';
      default:
        return title;
    }
  };

  const handleRetry = () => {
    onClose();
    onRetry?.();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getErrorIcon()}
            <h2 className="text-lg font-bold text-gray-900">{getErrorTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
            aria-label="Close error modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed">
            {message}
          </p>

          {errorType === 'timeout' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Tip:</span> Complex blueprints with many electrical symbols can take several minutes to analyze. Please try again and allow the process to complete.
              </p>
            </div>
          )}

          {errorType === 'network' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Tip:</span> Please check your internet connection and try again.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {isRetryable && (
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-2.5 bg-[#265a39] text-white font-medium rounded-lg hover:bg-[#1e4a2d] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
