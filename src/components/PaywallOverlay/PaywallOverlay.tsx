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
    <div className="absolute inset-0 bg-[#1a1a1a]/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
      <div className="glass-card bg-[#1a1a1a] border border-[#333333] rounded-xl p-8 max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 bg-[#ff4500]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-[#ff4500]" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          Unlock Full Analysis
        </h3>
        
        <p className="text-[#a0a0a0] mb-6">
          You've used your free analysis. Get complete access to all features including:
        </p>
        
        <ul className="text-left text-sm text-[#a0a0a0] mb-6 space-y-2">
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff4500]" />
            Complete load calculations
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff4500]" />
            GS1009 compliance audit
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff4500]" />
            Power sourcing recommendations
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff4500]" />
            PDF export capability
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff4500]" />
            N+1/N+2 redundancy planning
          </li>
        </ul>
        
        <div className="glass-card bg-[#2a2a2a] rounded-xl p-4 mb-6 border border-[#333333]">
          <p className="text-3xl font-bold text-[#ff4500] font-mono">₵500</p>
          <p className="text-sm text-[#a0a0a0]">One-time payment</p>
        </div>
        
        <button
          onClick={onUnlock}
          disabled={isLoading}
          className="w-full bg-[#ff4500] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ff5722] transition-all-smooth disabled:opacity-50 shadow-lg shadow-[#ff4500]/25"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay with Paystack
            </>
          )}
        </button>
        
        <p className="text-xs text-[#666666] mt-4">
          Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
};
