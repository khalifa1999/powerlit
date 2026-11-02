import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

type ViewMode = 'login' | 'signup' | 'verification';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'login' | 'signup';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode: initialMode = 'login'
}) => {
  const [view, setView] = useState<ViewMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { signIn, signUp, resendVerificationEmail } = useAuthStore();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setView(initialMode);
      setError(null);
      setResendTimer(0);
      setResendSuccess(false);
    }
  }, [isOpen, initialMode]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        const result = await signIn(email, password);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error || 'Sign in failed. Please try again.');
        }
      } else if (view === 'signup') {
        const result = await signUp(email, password, fullName);
        if (result.success) {
          if (result.requiresEmailConfirmation) {
            // Show verification screen
            setView('verification');
            setResendTimer(60); // Start 60-second cooldown
          } else {
            // Auto-signed in, no verification needed
            onSuccess();
          }
        } else {
          setError(result.error || 'Sign up failed. Please try again.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setResendSuccess(true);
        setResendTimer(60); // Start 60-second cooldown
      } else {
        setError(result.error || 'Failed to resend email. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    setView('login');
    setError(null);
    setResendSuccess(false);
  };

  const switchToSignup = () => {
    setView('signup');
    setError(null);
    setResendSuccess(false);
  };

  const handleClose = () => {
    // Reset form state on close
    setEmail('');
    setPassword('');
    setFullName('');
    setError(null);
    setResendTimer(0);
    setResendSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  // Render verification screen
  if (view === 'verification') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#265a39] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#fdce4e] rounded-lg flex items-center justify-center">
                <span className="text-[#265a39] font-bold text-lg">P</span>
              </div>
              <span className="text-white font-semibold">PowerLit</span>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-[#265a39]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#265a39]" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a verification link to{' '}
              <span className="font-semibold text-gray-900">{email}</span>.
              Please check your inbox and click the link to activate your account.
            </p>

            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Verification email resent successfully!
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isLoading || resendTimer > 0}
                className="w-full bg-[#265a39] text-white font-semibold py-3 rounded-xl hover:bg-[#1e4a2d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    {resendTimer > 0 
                      ? `Resend email (${resendTimer}s)` 
                      : 'Resend verification email'}
                  </>
                )}
              </button>

              <button
                onClick={switchToLogin}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back to Sign In
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render login/signup form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#265a39] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#fdce4e] rounded-lg flex items-center justify-center">
              <span className="text-[#265a39] font-bold text-lg">P</span>
            </div>
            <span className="text-white font-semibold">PowerLit</span>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mb-6">
            {view === 'login'
              ? 'Sign in to unlock full analysis features'
              : 'Sign up to save your analyses and unlock premium features'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field - only for signup */}
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#265a39] focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#265a39] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#265a39] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {view === 'signup' && (
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#265a39] text-white font-semibold py-3 rounded-xl hover:bg-[#1e4a2d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                <>
                  {view === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={view === 'login' ? switchToSignup : switchToLogin}
                className="ml-1 text-[#265a39] font-semibold hover:underline"
              >
                {view === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
