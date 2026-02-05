import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { initializePaystack, mockPayment } from '../../services/paystack';
import { useAnalysisStore } from '../../stores/analysisStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { markAsPaid } = useAnalysisStore();

  const handlePayment = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Use mock payment for testing/placeholder
      const isTestMode = !import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 
                         import.meta.env.VITE_PAYSTACK_PUBLIC_KEY === 'pk_test_placeholder';

      if (isTestMode) {
        // Mock payment for testing
        mockPayment(email, (reference) => {
          console.log('Payment successful:', reference);
          markAsPaid();
          setIsProcessing(false);
          onSuccess();
        });
      } else {
        // Real Paystack integration
        await initializePaystack(
          email,
          (reference) => {
            console.log('Payment successful:', reference);
            markAsPaid();
            setIsProcessing(false);
            onSuccess();
          },
          () => {
            setIsProcessing(false);
            setError('Payment was cancelled');
          }
        );
      }
    } catch {
      setIsProcessing(false);
      setError('Payment failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#007A41]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#007A41]" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>
          <p className="text-gray-600 mt-1">
            Unlock full analysis access
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Analysis Fee</span>
            <span className="font-bold text-[#007A41]">₵500.00</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-xl text-[#007A41]">₵500.00</span>
          </div>
        </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007A41] focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-[#FFC132] text-[#007A41] font-bold py-3 rounded-lg hover:bg-[#FFC132]/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#007A41] border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Pay ₵500.00'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Secure payment by Paystack. You'll receive a receipt via email.
          </p>
        </div>
      </div>
    </div>
  );
};
