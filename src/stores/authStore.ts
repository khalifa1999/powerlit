import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../services/api';
import type { User, SubscriptionTier } from '../types/user';
import type { Analysis } from '../types/analysis';

export interface SavedAnalysis {
  id: string;
  userId: string;
  analysis: Analysis;
  createdAt: string;
  fileName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedAnalyses: SavedAnalysis[];

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  addAnalysis: (analysis: Analysis) => void;
  getUserAnalyses: () => SavedAnalysis[];
  deleteAnalysis: (analysisId: string) => void;
  updateSubscription: (tier: SubscriptionTier, analysesLimit: number) => void;
  incrementAnalysesUsed: () => void;
  canPerformAnalysis: () => boolean;
  getRemainingAnalyses: () => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      savedAnalyses: [],

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await api.auth.login({ email, password });
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true });
        try {
          const user = await api.auth.register({
            email,
            password,
            full_name: fullName,
          });
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            savedAnalyses: [],
          });
          return true;
        } catch (error: any) {
          console.error('Signup failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            savedAnalyses: [],
          });
        }
      },

      fetchProfile: async () => {
        try {
          const user = await api.auth.getProfile();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          // If we can't fetch profile, user is not authenticated
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      addAnalysis: (analysis: Analysis) => {
        const { user, savedAnalyses } = get();
        if (!user) return;

        const newSavedAnalysis: SavedAnalysis = {
          id: analysis.id,
          userId: user.id,
          analysis: analysis,
          createdAt: new Date().toISOString(),
          fileName: analysis.fileName,
        };

        set({
          savedAnalyses: [newSavedAnalysis, ...savedAnalyses],
        });

        // Increment analyses used
        get().incrementAnalysesUsed();
      },

      getUserAnalyses: () => {
        const { user, savedAnalyses } = get();
        if (!user) return [];
        return savedAnalyses.filter((a) => a.userId === user.id);
      },

      deleteAnalysis: (analysisId: string) => {
        const { savedAnalyses } = get();
        set({
          savedAnalyses: savedAnalyses.filter((a) => a.id !== analysisId),
        });
      },

      updateSubscription: (tier: SubscriptionTier, analysesLimit: number) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            subscription_tier: tier,
            analyses_limit: analysesLimit,
          },
        });
      },

      incrementAnalysesUsed: () => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            analyses_used: user.analyses_used + 1,
          },
        });
      },

      canPerformAnalysis: () => {
        const { user } = get();
        if (!user) return false;

        // Solo tier: check if within monthly limit
        if (user.subscription_tier === 'solo') {
          return user.analyses_used < user.analyses_limit;
        }

        // Business/Enterprise: always allow
        return true;
      },

      getRemainingAnalyses: () => {
        const { user } = get();
        if (!user) return 0;

        if (user.subscription_tier === 'solo') {
          return Math.max(0, user.analyses_limit - user.analyses_used);
        }

        // Business/Enterprise: unlimited
        return Infinity;
      },
    }),
    {
      name: 'powerlit-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        savedAnalyses: state.savedAnalyses,
      }),
    }
  )
);

// Initialize auth state on app load
export function initializeAuth() {
  const store = useAuthStore.getState();
  
  // Check if we have a token and fetch profile
  if (api.auth.isAuthenticated()) {
    store.fetchProfile();
  }
}
