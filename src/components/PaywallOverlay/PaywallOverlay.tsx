import React from 'react';
import { Lock, CreditCard, Zap } from 'lucide-react';

interface PaywallOverlayProps {
  onUnlock: () => void;
  isLoading?: boolean;
}

export const PaywallOverlay: React.FC<PaywallOverlayProps> = ({ 
  onUnlock, 
  isLoading = false 
}) => {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md text-center shadow-xl">
        <div className="w-16 h-16 bg-[#FFC132]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-[#FFC132]" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Unlock Full Analysis
        </h3>
        
        <p className="text-gray-600 mb-6">
          You've used your free analysis. Get complete access to all features including:
        </p>
        
        <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#007A41]" />
            Complete load calculations
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#007A41]" />
            GS1009 compliance audit
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#007A41]" />
            Power sourcing recommendations
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#007A41]" />
            PDF export capability
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#007A41]" />
            N+1/N+2 redundancy planning
          </li>
        </ul>
        
        <div className="bg-[#007A41]/10 rounded-lg p-4 mb-6">
          <p className="text-3xl font-bold text-[#007A41]">₵500</p>
          <p className="text-sm text-gray-600">One-time payment</p>
        </div>
        
        <button
          onClick={onUnlock}
          disabled={isLoading}
          className="w-full bg-[#FFC132] text-[#007A41] font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#FFC132]/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#007A41] border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay with Paystack
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
};
