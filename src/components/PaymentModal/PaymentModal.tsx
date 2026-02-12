import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { getSubscriptionLabel } from '../../types/user';
import type { SubscriptionTier } from '../../types/user';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: SubscriptionTier | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan = null
}) => {
  const { user, updateSubscription } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const planDetails = {
    solo: { priceGHS: 0, priceUSD: 0, analyses: '10/month', label: 'Solo' },
    business: { priceGHS: 110, priceUSD: 10, analyses: '50/year', label: 'Business' },
    enterprise: { priceGHS: 220, priceUSD: 20, analyses: 'Unlimited', label: 'Enterprise' }
  };

  const selectedPlan = plan && planDetails[plan];

  const handlePayment = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!plan || plan === 'solo') {
      setError('Please select a paid plan');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.payments.initializePayment(plan, email);
      
      if (response.authorization_url) {
        // Open Paystack in new window/popup
        const paymentWindow = window.open(
          response.authorization_url,
          'Paystack Payment',
          'width=800,height=600,scrollbars=yes'
        );

        // Start polling for payment status
        if (paymentWindow) {
          setIsProcessing(false);
          setIsVerifying(true);
          
          // Poll for payment completion
          const checkInterval = setInterval(async () => {
            if (paymentWindow.closed) {
              clearInterval(checkInterval);
              await verifyPayment(response.reference);
            }
          }, 1000);
        }
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.userFriendlyMessage || 'Payment initialization failed. Please try again.');
    }
  };

  const verifyPayment = async (ref: string) => {
    try {
      const result = await api.payments.verifyPayment(ref);
      
      if (result.status === 'success') {
        // Update user subscription in store
        updateSubscription(
          result.subscription_tier as SubscriptionTier,
          result.subscription_tier === 'business' ? 50 : Infinity
        );
        
        setSuccess(true);
        setIsVerifying(false);
        
        // Close modal after showing success
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setError(err.userFriendlyMessage || 'Payment verification failed. Please contact support.');
    }
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-gray-200">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              Your subscription has been activated. You now have access to {selectedPlan?.label} features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#fdce4e] rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#265a39]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <p className="text-gray-600 mt-1">
            Upgrade to {selectedPlan ? getSubscriptionLabel(plan!) : 'Premium'}
          </p>
        </div>

        {selectedPlan && selectedPlan.priceGHS > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{selectedPlan.label} Plan</span>
              <span className="text-sm text-gray-500">{selectedPlan.analyses}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900">Total (GHS)</span>
                <span className="font-bold text-xl text-[#265a39] font-mono">
                  ₵{selectedPlan.priceGHS.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total (USD)</span>
                <span className="text-gray-600 font-mono">
                  ${selectedPlan.priceUSD}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isProcessing || isVerifying}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#265a39] focus:border-transparent transition-all disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {isVerifying ? (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#265a39] mx-auto mb-2" />
              <p className="text-gray-600">Verifying payment...</p>
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={isProcessing || !plan || plan === 'solo'}
              className="w-full bg-[#265a39] text-white font-bold py-3 rounded-xl hover:bg-[#1e4a2d] transition-all-smooth disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing...
                </>
              ) : selectedPlan ? (
                `Pay ₵${selectedPlan.priceGHS.toLocaleString()}`
              ) : (
                'Select a Plan'
              )}
            </button>
          )}

          <p className="text-xs text-gray-500 text-center">
            Secure payment powered by Paystack. You'll receive a receipt via email.
          </p>
        </div>
      </div>
    </div>
  );
};
