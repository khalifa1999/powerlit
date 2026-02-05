import { PaymentTransaction } from '../types/analysis';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  callback: (response: { reference: string; status: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => { openIframe: () => void };
    };
  }
}

export function initializePaystack(
  email: string,
  onSuccess: (reference: string) => void,
  onClose: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Paystack script is loaded
    if (!window.PaystackPop) {
      // Load Paystack script dynamically
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        openPaystackPopup(email, onSuccess, onClose);
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Paystack'));
      };
      document.body.appendChild(script);
    } else {
      openPaystackPopup(email, onSuccess, onClose);
      resolve();
    }
  });
}

function openPaystackPopup(
  email: string,
  onSuccess: (reference: string) => void,
  onClose: () => void
): void {
  // Amount in pesewas (500 GHS = 50000 pesewas)
  const amountInPesewas = 500 * 100;
  const reference = `PWR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amountInPesewas,
    currency: 'GHS',
    ref: reference,
    callback: function(response: { reference: string; status: string }) {
      if (response.status === 'success') {
        onSuccess(response.reference);
      } else {
        onClose();
      }
    },
    onClose: function() {
      onClose();
    }
  });

  handler.openIframe();
}

export function verifyPayment(reference: string): Promise<PaymentTransaction> {
  // In production, this would call your backend to verify the payment
  // For now, we simulate a successful verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        reference,
        amount: 500,
        email: 'user@example.com',
        status: 'success',
        timestamp: Date.now()
      });
    }, 1000);
  });
}

// Mock payment for testing without actual Paystack
export function mockPayment(
  email: string,
  onSuccess: (reference: string) => void
): void {
  const reference = `PWR_TEST_${Date.now()}`;
  
  // Simulate payment dialog
  if (confirm(`[TEST MODE] Pay 500 GHS for full analysis?\n\nEmail: ${email}\nReference: ${reference}`)) {
    setTimeout(() => {
      onSuccess(reference);
    }, 500);
  }
}
