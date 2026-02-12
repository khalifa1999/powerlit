export type SubscriptionTier = 'solo' | 'business' | 'enterprise';

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  analyses_used: number;
  analyses_limit: number;
  subscription_expires: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface SubscriptionPackage {
  tier: SubscriptionTier;
  usd: number;
  ghs: number;
  description: string;
}

export const SUBSCRIPTION_PACKAGES: Record<SubscriptionTier, SubscriptionPackage> = {
  solo: {
    tier: 'solo',
    usd: 0,
    ghs: 0,
    description: 'Free tier with 10 analyses per month'
  },
  business: {
    tier: 'business',
    usd: 10,
    ghs: 110,
    description: '50 analyses per year'
  },
  enterprise: {
    tier: 'enterprise',
    usd: 20,
    ghs: 220,
    description: 'Unlimited analyses'
  }
};

export function getSubscriptionLabel(tier: SubscriptionTier): string {
  const labels: Record<SubscriptionTier, string> = {
    solo: 'Solo',
    business: 'Business',
    enterprise: 'Enterprise'
  };
  return labels[tier] || 'Unknown';
}

export function getSubscriptionBenefits(tier: SubscriptionTier): string[] {
  const benefits: Record<SubscriptionTier, string[]> = {
    solo: [
      '10 analyses per month',
      'Basic load calculations',
      'GS1009 compliance check'
    ],
    business: [
      '50 analyses per year',
      'Complete load calculations',
      'GS1009 compliance audit',
      'PDF export',
      'Priority support'
    ],
    enterprise: [
      'Unlimited analyses',
      'Everything in Business',
      'Up to 5 team members',
      'API access',
      'Dedicated support'
    ]
  };
  return benefits[tier] || [];
}
