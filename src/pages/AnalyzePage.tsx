import { useState, useEffect, useRef } from 'react';
import { FileText, Check, Menu, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Sidebar } from '../components/Layout/Sidebar';
import { DualFileUpload } from '../components/FileUpload/DualFileUpload';
import { BatchFileUpload } from '../components/FileUpload/BatchFileUpload';
import { DocumentViewer } from '../components/DocumentViewer/DocumentViewer';
import { ThinkingTerminal } from '../components/ThinkingTerminal/ThinkingTerminal';
import { ResultsPanel } from '../components/ResultsPanel/ResultsPanel';
import { PaymentModal } from '../components/PaymentModal/PaymentModal';
import { LoginModal } from '../components/Auth/LoginModal';
import { ErrorModal } from '../components/ErrorModal/ErrorModal';
import { PDFExportButton } from '../utils/pdfGenerator';
import { useAnalysisStore } from '../stores/analysisStore';
import { useAuthStore } from '../stores/authStore';
import { analyzeWithBackend, analyzeBatchWithBackend } from '../services/backend';
import type { Analysis } from '../types/analysis';
import type { SubscriptionTier } from '../types/user';



export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Single analysis mode state
  const [selectedFiles, setSelectedFiles] = useState<{
    legend: File | null;
    floorPlan: File | null;
  }>({ legend: null, floorPlan: null });
  
  // Batch analysis mode state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<Analysis[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  
  // Analysis mode toggle
  const [analysisMode, setAnalysisMode] = useState<'single' | 'batch'>('single');
  
  // Long running and timing state
  const [isLongRunning, setIsLongRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Error state
  const [error, setError] = useState<{ message: string; isRetryable: boolean; type?: 'network' | 'timeout' | 'file' | 'server' | 'generic' | 'validation' } | null>(null);
  
  const [showPricing, setShowPricing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buildingType, setBuildingType] = useState<'residential' | 'commercial' | 'industrial'>('commercial');
  
  const {
    currentAnalysis,
    isAnalyzing,
    analysisProgress,
    currentStep,
    setAnalysis,
    setAnalyzing,
    setProgress,
    setCurrentStep,
  } = useAnalysisStore();

  const { isAuthenticated, addAnalysis, user, canPerformAnalysis, getRemainingAnalyses } = useAuthStore();

  // Timer for elapsed time
  useEffect(() => {
    if (isAnalyzing) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
      setIsLongRunning(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAnalyzing]);

  // Handle single file analysis
  const handleFilesSelect = async (files: { 
    legend?: File | null; 
    floorPlan?: File | null; 
  }) => {
    // Check if user can perform analysis
    if (isAuthenticated && !canPerformAnalysis()) {
      setError({
        message: 'You have reached your monthly analysis limit. Please upgrade your subscription to continue.',
        isRetryable: false,
        type: 'validation'
      });
      return;
    }
    
    const newFiles = {
      legend: files.legend !== undefined ? files.legend : selectedFiles.legend,
      floorPlan: files.floorPlan !== undefined ? files.floorPlan : selectedFiles.floorPlan,
    };
    
    setSelectedFiles(newFiles);
    
    // Blueprint file (floorPlan) is required, legend is optional
    const blueprintFile = newFiles.floorPlan;
    const legendFile = newFiles.legend;
    
    if (blueprintFile) {
      try {
        setError(null);
        setAnalyzing(true);
        setIsLongRunning(false);
        setElapsedTime(0);
        
        // Always use backend API
        const analysis = await analyzeWithBackend(
          blueprintFile,
          legendFile,
          buildingType,
          '',
          (step: string, progress: number, longRunning?: boolean) => {
            setCurrentStep(step);
            setProgress(progress);
            if (longRunning) {
              setIsLongRunning(true);
            }
          }
        );
        
        if (analysis) {
          setAnalysis(analysis);
          // Always save analysis to dashboard
          addAnalysis(analysis);
        }
        setAnalyzing(false);
      } catch (err: any) {
        console.error('Analysis failed:', err);
        setAnalyzing(false);
        
        // Handle specific error types
        let errorType: 'network' | 'timeout' | 'file' | 'server' | 'validation' | 'generic' = 'generic';
        
        if (err.type === 'network' || err.message?.includes('internet') || err.userFriendlyMessage?.includes('internet')) {
          errorType = 'network';
        } else if (err.type === 'timeout' || err.message?.includes('timeout') || err.userFriendlyMessage?.includes('interrupted')) {
          errorType = 'timeout';
        } else if (err.type === 'file' || err.userFriendlyMessage?.includes('too large') || err.userFriendlyMessage?.includes('file')) {
          errorType = 'file';
        } else if (err.type === 'server' || err.userFriendlyMessage?.includes('servers') || err.userFriendlyMessage?.includes('demand')) {
          errorType = 'server';
        } else if (err.type === 'validation' || err.statusCode === 429) {
          errorType = 'validation';
        }
        
        setError({
          message: err.userFriendlyMessage || err.message || 'An unexpected error occurred',
          isRetryable: err.isRetryable !== false && errorType !== 'validation',
          type: errorType
        });
      }
    }
  };

  // Handle batch file analysis
  const handleBatchFilesSelect = async (files: File[]) => {
    // Check if user can perform analysis
    if (isAuthenticated && !canPerformAnalysis()) {
      setError({
        message: 'You have reached your monthly analysis limit. Please upgrade your subscription to continue.',
        isRetryable: false,
        type: 'validation'
      });
      return;
    }
    
    setBatchFiles(files);
    
    if (files.length > 0) {
      try {
        setError(null);
        setAnalyzing(true);
        setIsLongRunning(false);
        setElapsedTime(0);
        
        // Use batch analysis endpoint
        const analyses = await analyzeBatchWithBackend(
          files,
          buildingType,
          '',
          (step: string, progress: number, longRunning?: boolean) => {
            setCurrentStep(step);
            setProgress(progress);
            if (longRunning) {
              setIsLongRunning(true);
            }
          }
        );
        
        if (analyses && analyses.length > 0) {
          setBatchResults(analyses);
          setCurrentBatchIndex(0);
          // Show first analysis
          setAnalysis(analyses[0]);
          // Save all analyses to dashboard
          analyses.forEach(analysis => addAnalysis(analysis));
        }
        setAnalyzing(false);
      } catch (err: any) {
        console.error('Batch analysis failed:', err);
        setAnalyzing(false);
        
        // Handle specific error types
        let errorType: 'network' | 'timeout' | 'file' | 'server' | 'validation' | 'generic' = 'generic';
        
        if (err.type === 'network' || err.message?.includes('internet') || err.userFriendlyMessage?.includes('internet')) {
          errorType = 'network';
        } else if (err.type === 'timeout' || err.message?.includes('timeout') || err.userFriendlyMessage?.includes('interrupted')) {
          errorType = 'timeout';
        } else if (err.type === 'file' || err.userFriendlyMessage?.includes('too large') || err.userFriendlyMessage?.includes('file')) {
          errorType = 'file';
        } else if (err.type === 'server' || err.userFriendlyMessage?.includes('servers') || err.userFriendlyMessage?.includes('demand')) {
          errorType = 'server';
        } else if (err.type === 'validation' || err.statusCode === 429) {
          errorType = 'validation';
        }
        
        setError({
          message: err.userFriendlyMessage || err.message || 'An unexpected error occurred',
          isRetryable: err.isRetryable !== false && errorType !== 'validation',
          type: errorType
        });
      }
    }
  };

  const handleClearFiles = () => {
    if (analysisMode === 'single') {
      setSelectedFiles({ legend: null, floorPlan: null });
    } else {
      setBatchFiles([]);
      setBatchResults([]);
      setCurrentBatchIndex(0);
    }
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    if (analysisMode === 'single') {
      handleFilesSelect(selectedFiles);
    } else {
      handleBatchFilesSelect(batchFiles);
    }
  };

  const handleBatchNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentBatchIndex > 0) {
      const newIndex = currentBatchIndex - 1;
      setCurrentBatchIndex(newIndex);
      setAnalysis(batchResults[newIndex]);
    } else if (direction === 'next' && currentBatchIndex < batchResults.length - 1) {
      const newIndex = currentBatchIndex + 1;
      setCurrentBatchIndex(newIndex);
      setAnalysis(batchResults[newIndex]);
    }
  };

  const handleUnlock = () => {
    setShowPricing(true);
  };

  const handleSelectPlan = (plan: SubscriptionTier) => {
    setSelectedPlan(plan);
    if (isAuthenticated) {
      setShowPaymentModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setShowPricing(false);
  };

  const isLocked = currentAnalysis !== null && !isAuthenticated;

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        onUploadClick={handleClearFiles} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden" aria-label="Electrical Analysis Interface">
        {/* Mobile Menu Button */}
        <div className="absolute top-4 left-4 z-30 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shadow-sm border border-gray-200"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {!currentAnalysis ? (
          // Upload View - Centered
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  Electrical Blueprint Analysis
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Upload your electrical documents to analyze symbols, count components, and get pricing
                </p>
              </div>

              {/* Subscription Status */}
              {isAuthenticated && user && (
                <div className="bg-gradient-to-r from-[#265a39] to-[#1e4a2d] rounded-xl p-4 mb-6 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#fdce4e]" />
                      <span className="font-medium">
                        {user.subscription_tier === 'solo' 
                          ? `${getRemainingAnalyses()} analyses remaining this month`
                          : user.subscription_tier === 'business'
                          ? 'Business Plan - 50 analyses/year'
                          : 'Enterprise Plan - Unlimited analyses'
                        }
                      </span>
                    </div>
                    {user.subscription_tier === 'solo' && getRemainingAnalyses() === 0 && (
                      <button
                        onClick={() => navigate('/pricing')}
                        className="bg-[#fdce4e] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-[#e5b93f] transition-colors text-sm"
                      >
                        Upgrade Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Analysis Settings */}
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Building Type Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Building Type:</span>
                    <select
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value as 'residential' | 'commercial' | 'industrial')}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#265a39] focus:border-transparent"
                    >
                      <option value="commercial">Commercial</option>
                      <option value="residential">Residential</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>

                  {/* Analysis Mode Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Mode:</span>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setAnalysisMode('single')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          analysisMode === 'single'
                            ? 'bg-[#265a39] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Single
                      </button>
                      <button
                        onClick={() => setAnalysisMode('batch')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          analysisMode === 'batch'
                            ? 'bg-[#265a39] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Batch
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Modal */}
              <ErrorModal
                isOpen={!!error}
                onClose={() => setError(null)}
                message={error?.message || ''}
                isRetryable={error?.isRetryable || false}
                errorType={error?.type || 'generic'}
                onRetry={handleRetry}
              />

              {analysisMode === 'single' ? (
                <DualFileUpload
                  onFilesSelect={handleFilesSelect}
                  selectedFiles={selectedFiles}
                />
              ) : (
                <BatchFileUpload
                  onFilesSelect={handleBatchFilesSelect}
                  selectedFiles={batchFiles}
                />
              )}

              {isAnalyzing && (
                <div className="mt-8 max-w-xl mx-auto">
                  {/* Time Display */}
                  <div className="mb-4 flex items-center justify-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Time elapsed: <span className="font-semibold">{formatElapsedTime(elapsedTime)}</span>
                    </span>
                  </div>
                  
                  <ThinkingTerminal
                    steps={[]}
                    currentStep={currentStep}
                    progress={analysisProgress}
                    isAnalyzing={isAnalyzing}
                    isLongRunning={isLongRunning}
                    elapsedTime={elapsedTime}
                  />
                  
                  {/* Long Running Notice */}
                  {isLongRunning && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 text-center">
                        <span className="font-semibold">Please don't close this window.</span>
                        <br />
                        The analysis is still running and will complete soon.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Analysis View - Centered Layout
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header with Export */}
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
             
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#265a39]" aria-hidden="true" />
                    Analysis Results
                  </h2>
                </div>
                {isAuthenticated && (
                  <PDFExportButton analysis={currentAnalysis} />
                )}
              </header>

              {/* Document Preview */}
              <div className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">Document Preview</h3>
                </div>
                <div className="p-4 max-h-96 overflow-auto">
                  <DocumentViewer analysis={currentAnalysis} />
                </div>
              </div>

              {/* Batch Navigation */}
              {analysisMode === 'batch' && batchResults.length > 1 && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleBatchNavigation('prev')}
                      disabled={currentBatchIndex === 0}
                      className="px-4 py-2 text-sm font-medium text-[#265a39] bg-[#265a39]/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#265a39]/20 transition-colors"
                    >
                      ← Previous Blueprint
                    </button>
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {currentBatchIndex + 1} of {batchResults.length}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {batchResults[currentBatchIndex]?.fileName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBatchNavigation('next')}
                      disabled={currentBatchIndex === batchResults.length - 1}
                      className="px-4 py-2 text-sm font-medium text-[#265a39] bg-[#265a39]/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#265a39]/20 transition-colors"
                    >
                      Next Blueprint →
                    </button>
                  </div>
                </div>
              )}

              {/* Terminal */}
              <div className="mb-6">
                <ThinkingTerminal
                  steps={currentAnalysis.calculationSteps}
                  currentStep={currentStep}
                  progress={analysisProgress}
                  isAnalyzing={isAnalyzing}
                  isLongRunning={isLongRunning}
                  elapsedTime={elapsedTime}
                />
              </div>

              {/* Results */}
              <div className="relative">
                <ResultsPanel 
                  analysis={currentAnalysis} 
                  isLocked={isLocked}
                />
                
                {/* Paywall / Pricing Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                    <div className="w-full max-w-sm mx-4">
                      {!showPricing ? (
                        // Initial unlock prompt
                        <div className="bg-white rounded-2xl p-6 border-2 border-[#265a39]/20 shadow-xl text-center">
                          <div className="w-16 h-16 bg-[#fdce4e] rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-[#265a39]" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Unlock Full Analysis
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm">
                            Get complete access to all features including GS1009 compliance, cost estimation, and PDF export.
                          </p>
                          <button
                            onClick={handleUnlock}
                            className="w-full bg-[#265a39] text-white font-semibold py-3 rounded-xl hover:bg-[#1e4a2d] transition-colors shadow-lg"
                          >
                            View Pricing Plans
                          </button>
                        </div>
                      ) : (
                        // Pricing options
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                            Choose Your Plan
                          </h3>
                          
                          {/* Business Plan */}
                          <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-[#265a39] transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">Business</h4>
                                <p className="text-sm text-gray-500">50 analyses/year</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#265a39]">₵110</div>
                                <div className="text-xs text-gray-500">/month</div>
                              </div>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 mb-4">
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#265a39]" />
                                Complete load calculations
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#265a39]" />
                                GS1009 compliance audit
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#265a39]" />
                                PDF export
                              </li>
                            </ul>
                            <button
                              onClick={() => handleSelectPlan('business')}
                              className="w-full bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Select Business
                            </button>
                          </div>

                          {/* Enterprise Plan */}
                          <div className="bg-white rounded-xl p-5 border-2 border-[#fdce4e] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className="bg-[#fdce4e] text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                              </span>
                            </div>
                            <div className="flex justify-between items-start mb-3 mt-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">Enterprise</h4>
                                <p className="text-sm text-gray-500">Unlimited analyses</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#265a39]">₵220</div>
                                <div className="text-xs text-gray-500">/month</div>
                              </div>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 mb-4">
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#265a39]" />
                                Everything in Business
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#265a39]" />
                                Up to 5 team members
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#265a39]" />
                                API access & dedicated support
                              </li>
                            </ul>
                            <button
                              onClick={() => handleSelectPlan('enterprise')}
                              className="w-full bg-[#265a39] text-white font-semibold py-2 rounded-lg hover:bg-[#1e4a2d] transition-colors shadow-lg"
                            >
                              Select Enterprise
                            </button>
                          </div>

                          <button
                            onClick={() => setShowPricing(false)}
                            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        plan={selectedPlan}
      />
    </div>
  );
};
