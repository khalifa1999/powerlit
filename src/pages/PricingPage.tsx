import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Check, Crown, Zap, Building2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import type { SubscriptionTier } from '../types/user';

interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  priceGHS: number;
  priceUSD: number;
  period: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
}

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const plans: PricingPlan[] = [
    {
      tier: 'solo',
      name: 'Solo',
      description: 'Perfect for getting started',
      priceGHS: 0,
      priceUSD: 0,
      period: 'month',
      features: [
        '10 analyses per month',
        'Basic load calculations',
        'GS1009 compliance check',
        'Email support',
      ],
      icon: <Zap className="w-6 h-6" />,
    },
    {
      tier: 'business',
      name: 'Business',
      description: 'For professional engineers',
      priceGHS: 110,
      priceUSD: 10,
      period: 'month',
      features: [
        '50 analyses per year',
        'Complete load calculations',
        'GS1009 compliance audit',
        'PDF export',
        'Priority support',
        'Advanced analytics',
      ],
      highlighted: true,
      icon: <Crown className="w-6 h-6" />,
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      description: 'For teams and organizations',
      priceGHS: 220,
      priceUSD: 20,
      period: 'month',
      features: [
        'Unlimited analyses',
        'Everything in Business',
        'Up to 5 team members',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
      icon: <Building2 className="w-6 h-6" />,
    },
  ];

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (plan.tier === 'solo') {
      // Free tier - just redirect to analyze
      navigate('/analyze');
      return;
    }

    if (!isAuthenticated) {
      // Redirect to signup with plan info
      navigate('/signup');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.payments.initializePayment(
        plan.tier,
        user?.email || ''
      );

      // Redirect to Paystack payment page
      if (response.authorization_url) {
        window.location.href = response.authorization_url;
      }
    } catch (err: any) {
      setError(err.userFriendlyMessage || 'Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };

  const isCurrentPlan = (tier: SubscriptionTier) => {
    return user?.subscription_tier === tier;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main aria-label="Pricing Page" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-gray-600">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>
          </div>

          {error && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <article
                key={plan.tier}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted
                    ? 'border-[#fdce4e] shadow-xl scale-105 z-10'
                    : 'border-gray-200 hover:border-[#265a39]/30 shadow-lg'
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#fdce4e] text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan(plan.tier) && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#265a39] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        plan.highlighted
                          ? 'bg-[#fdce4e] text-[#265a39]'
                          : 'bg-[#265a39]/10 text-[#265a39]'
                      }`}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {plan.name}
                      </h2>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1 justify-center">
                    {plan.priceGHS === 0 ? (
                      <span className="text-5xl font-bold text-[#265a39] font-mono">
                        Free
                      </span>
                    ) : (
                      <>
                        <span className="text-5xl font-bold text-[#265a39] font-mono">
                          ₵{plan.priceGHS.toLocaleString()}
                        </span>
                        <span className="text-gray-500">/{plan.period}</span>
                      </>
                    )}
                  </div>
                  {plan.priceUSD > 0 && (
                    <p className="text-sm text-gray-500 text-center mt-1">
                      ${plan.priceUSD} USD
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8" role="list">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted
                            ? 'text-[#fdce4e]'
                            : 'text-[#265a39]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading || isCurrentPlan(plan.tier)}
                  className={`block w-full font-semibold py-3 rounded-xl transition-colors text-center ${
                    isCurrentPlan(plan.tier)
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-[#265a39] text-white hover:bg-[#1e4a2d] shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {isLoading
                    ? 'Processing...'
                    : isCurrentPlan(plan.tier)
                    ? 'Current Plan'
                    : plan.priceGHS === 0
                    ? 'Get Started Free'
                    : 'Subscribe Now'}
                </button>
              </article>
            ))}
          </div>

          {/* Bottom note */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              All paid plans include a 14-day free trial. Cancel anytime.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Secure payments powered by Paystack
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
