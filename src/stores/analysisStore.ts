import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Analysis } from '../types/analysis';

interface AnalysisStore {
  hasUsedFreeAnalysis: boolean;
  currentAnalysis: Analysis | null;
  isPaid: boolean;
  isAnalyzing: boolean;
  analysisProgress: number;
  currentStep: string;
  setAnalysis: (data: Analysis) => void;
  markAsPaid: () => void;
  setAnalyzing: (status: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentStep: (step: string) => void;
  reset: () => void;
  canAccessFullAnalysis: () => boolean;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      hasUsedFreeAnalysis: false,
      currentAnalysis: null,
      isPaid: false,
      isAnalyzing: false,
      analysisProgress: 0,
      currentStep: '',
      
      setAnalysis: (data) => {
        set({ currentAnalysis: data });
        if (!get().hasUsedFreeAnalysis && !get().isPaid) {
          set({ hasUsedFreeAnalysis: true });
        }
      },
      
      markAsPaid: () => set({ isPaid: true }),
      
      setAnalyzing: (status) => set({ isAnalyzing: status }),
      
      setProgress: (progress) => set({ analysisProgress: progress }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      reset: () => set({
        currentAnalysis: null,
        isPaid: false,
        isAnalyzing: false,
        analysisProgress: 0,
        currentStep: ''
      }),
      
      canAccessFullAnalysis: () => {
        const state = get();
        return !state.hasUsedFreeAnalysis || state.isPaid;
      }
    }),
    {
      name: 'powerlit-storage',
      partialize: (state) => ({
        hasUsedFreeAnalysis: state.hasUsedFreeAnalysis,
        isPaid: state.isPaid
      })
    }
  )
);
