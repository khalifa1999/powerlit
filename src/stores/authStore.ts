import { create } from 'zustand';
import { User, AuthError } from '@supabase/supabase-js';
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

export interface UserProfile {
  id: string;
  fullName: string | null;
  createdAt: string;
  updatedAt: string;
}

// User-friendly error messages mapping
const getUserFriendlyError = (error: AuthError | Error | unknown): string => {
  if (error instanceof Error || (error && typeof error === 'object' && 'message' in error)) {
    const message = (error as Error).message.toLowerCase();
    
    // Email-related errors
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for the verification link.';
    }
    if (message.includes('user already registered') || message.includes('already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    // Password-related errors
    if (message.includes('password')) {
      if (message.includes('weak') || message.includes('short')) {
        return 'Password is too weak. Please use at least 6 characters.';
      }
      if (message.includes('incorrect')) {
        return 'Incorrect password. Please try again.';
      }
    }
    
    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'Connection error. Please check your internet connection and try again.';
    }
    
    return (error as Error).message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Auth response types
export interface SignUpResponse {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  user?: User;
}

export interface SignInResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedAnalyses: SavedAnalysis[];

  // Actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signUp: (email: string, password: string, fullName?: string) => Promise<SignUpResponse>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchAnalyses: () => Promise<void>;
  saveAnalysis: (analysis: Analysis, projectName?: string) => Promise<{ success: boolean; error?: string }>;
  deleteAnalysis: (analysisId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
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
        // Fetch user's profile and analyses
        await get().fetchProfile();
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
          get().fetchProfile();
          get().fetchAnalyses();
        } else if (event === 'SIGNED_OUT') {
          set({ 
            user: null, 
            profile: null,
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

  signIn: async (email: string, password: string): Promise<SignInResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { 
          success: false, 
          error: getUserFriendlyError(error) 
        };
      }

      if (data.user) {
        set({ 
          user: data.user, 
          isAuthenticated: true 
        });
        await get().fetchProfile();
        await get().fetchAnalyses();
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Unable to sign in. Please try again.' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: getUserFriendlyError(error) 
      };
    }
  },

  signUp: async (email: string, password: string, fullName?: string): Promise<SignUpResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        return { 
          success: false, 
          error: getUserFriendlyError(error) 
        };
      }

      if (data.user) {
        // Check if email confirmation is required
        // When email confirmation is enabled and user is not automatically signed in,
        // data.session will be null
        const requiresEmailConfirmation = !data.session;
        
        if (data.session) {
          // Auto-signed in (email confirmation not required or user already confirmed)
          set({ 
            user: data.user, 
            isAuthenticated: true 
          });
          
          // Create user profile with full name
          if (fullName) {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: fullName,
              });
          }
          
          await get().fetchProfile();
          await get().fetchAnalyses();
        } else {
          // Email confirmation required - create profile but don't authenticate yet
          if (fullName) {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: fullName,
              });
          }
        }
        
        return { 
          success: true, 
          user: data.user,
          requiresEmailConfirmation 
        };
      }

      return { success: false, error: 'Unable to create account. Please try again.' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: getUserFriendlyError(error) 
      };
    }
  },

  resendVerificationEmail: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        return { 
          success: false, 
          error: getUserFriendlyError(error) 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        error: getUserFriendlyError(error) 
      };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        profile: null,
        isAuthenticated: false, 
        savedAnalyses: [] 
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          fullName: data.full_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        set({ profile });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
