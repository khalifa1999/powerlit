import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Analysis } from '../types/analysis';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

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
  savedAnalyses: SavedAnalysis[];
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  addAnalysis: (analysis: Analysis) => void;
  getUserAnalyses: () => SavedAnalysis[];
  deleteAnalysis: (analysisId: string) => void;
}

// Demo authentication - accepts any email/password
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      savedAnalyses: [],

      login: async (email: string, password: string) => {
        // Demo mode: accept any non-empty email and password
        if (!email || !password) {
          return false;
        }

        const user: User = {
          id: email,
          email: email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
        };

        set({ 
          user, 
          isAuthenticated: true 
        });
        
        return true;
      },

      signup: async (email: string, password: string, name: string) => {
        // Demo mode: accept any non-empty values
        if (!email || !password || !name) {
          return false;
        }

        const user: User = {
          id: email,
          email: email,
          name: name,
          createdAt: new Date().toISOString(),
        };

        set({ 
          user, 
          isAuthenticated: true,
          savedAnalyses: []
        });
        
        return true;
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
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
          savedAnalyses: [newSavedAnalysis, ...savedAnalyses]
        });
      },

      getUserAnalyses: () => {
        const { user, savedAnalyses } = get();
        if (!user) return [];
        return savedAnalyses.filter(a => a.userId === user.id);
      },

      deleteAnalysis: (analysisId: string) => {
        const { savedAnalyses } = get();
        set({
          savedAnalyses: savedAnalyses.filter(a => a.id !== analysisId)
        });
      },
    }),
    {
      name: 'powerlit-auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
