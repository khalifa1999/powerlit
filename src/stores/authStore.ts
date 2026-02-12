import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Analysis } from '../types/analysis';
import type { Json } from '../types/database';

export interface SavedAnalysis {
  id: string;
  userId: string;
  analysis: Analysis;
  createdAt: string;
  projectName: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedAnalyses: SavedAnalysis[];

  // Actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  fetchAnalyses: () => Promise<void>;
  saveAnalysis: (analysis: Analysis, projectName?: string) => Promise<{ success: boolean; error?: string }>;
  deleteAnalysis: (analysisId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  savedAnalyses: [],

  initializeAuth: async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ 
          user: session.user, 
          isAuthenticated: true,
          isLoading: false 
        });
        // Fetch user's analyses
        await get().fetchAnalyses();
      } else {
        set({ isLoading: false });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({ 
            user: session.user, 
            isAuthenticated: true,
            isLoading: false 
          });
          get().fetchAnalyses();
        } else if (event === 'SIGNED_OUT') {
          set({ 
            user: null, 
            isAuthenticated: false, 
            savedAnalyses: [],
            isLoading: false 
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({ 
          user: data.user, 
          isAuthenticated: true 
        });
        await get().fetchAnalyses();
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // Auto-signed in (email confirmation not required)
          set({ 
            user: data.user, 
            isAuthenticated: true 
          });
        }
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        savedAnalyses: [] 
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  fetchAnalyses: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analyses:', error);
        return;
      }

      const savedAnalyses: SavedAnalysis[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        analysis: item.data as unknown as Analysis,
        createdAt: item.created_at,
        projectName: item.project_name,
      }));

      set({ savedAnalyses });
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  },

  saveAnalysis: async (analysis: Analysis, projectName?: string) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          project_name: projectName || analysis.fileName,
          data: analysis as unknown as Json,
        });

      if (error) {
        console.error('Error saving analysis:', error);
        return { success: false, error: error.message };
      }

      // Refresh analyses list
      await get().fetchAnalyses();
      return { success: true };
    } catch (error) {
      console.error('Error saving analysis:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  deleteAnalysis: async (analysisId: string) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting analysis:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      const { savedAnalyses } = get();
      set({
        savedAnalyses: savedAnalyses.filter(a => a.id !== analysisId)
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
}));
