import { useState } from 'react';
import { FileText, Check, Menu } from 'lucide-react';

import { Sidebar } from '../components/Layout/Sidebar';
import { DualFileUpload } from '../components/FileUpload/DualFileUpload';
import { DocumentViewer } from '../components/DocumentViewer/DocumentViewer';
import { ThinkingTerminal } from '../components/ThinkingTerminal/ThinkingTerminal';
import { ResultsPanel } from '../components/ResultsPanel/ResultsPanel';
import { PaymentModal } from '../components/PaymentModal/PaymentModal';
import { LoginModal } from '../components/Auth/LoginModal';
import { PDFExportButton } from '../utils/pdfGenerator';
import { useAnalysisStore } from '../stores/analysisStore';
import { useAuthStore } from '../stores/authStore';
import { analyzeBlueprint, analyzeDualImages, generateMockAnalysis } from '../services/gemini';
import { fileToBase64 } from '../utils/fileHelpers';

export const AnalyzePage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<{
    legend: File | null;
    floorPlan: File | null;
    single: File | null;
  }>({ legend: null, floorPlan: null, single: null });
  
  const [showPricing, setShowPricing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  const { isAuthenticated, addAnalysis } = useAuthStore();

  const handleFilesSelect = async (files: { 
    legend?: File | null; 
    floorPlan?: File | null; 
    single?: File | null 
  }) => {
    const newFiles = {
      legend: files.legend !== undefined ? files.legend : selectedFiles.legend,
      floorPlan: files.floorPlan !== undefined ? files.floorPlan : selectedFiles.floorPlan,
      single: files.single !== undefined ? files.single : selectedFiles.single
    };
    
    setSelectedFiles(newFiles);
    
    const hasSingleFile = !!newFiles.single;
    const hasDualFiles = !!newFiles.legend && !!newFiles.floorPlan;
    
    if (hasSingleFile || hasDualFiles) {
      try {
        setAnalyzing(true);
        
        let analysis;
        const useMock = !import.meta.env.VITE_GEMINI_API_KEY || 
                        import.meta.env.VITE_GEMINI_API_KEY === 'your_api_key_here';
        
        if (useMock) {
          setCurrentStep('Initializing analysis...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(20);
          
          setCurrentStep('Analyzing legend symbols...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(40);
          
          setCurrentStep('Counting symbols in floor plan...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(60);
          
          setCurrentStep('Calculating load requirements...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress(80);
          
          analysis = generateMockAnalysis();
          
          if (newFiles.single) {
            analysis.fileName = newFiles.single.name;
            analysis.fileType = newFiles.single.type;
            analysis.fileData = await fileToBase64(newFiles.single);
          } else if (newFiles.legend && newFiles.floorPlan) {
            analysis.fileName = 'dual-analysis';
            analysis.fileType = 'image/png';
            analysis.legendFile = {
              name: newFiles.legend.name,
              type: newFiles.legend.type,
              data: await fileToBase64(newFiles.legend)
            };
            analysis.floorPlanFile = {
              name: newFiles.floorPlan.name,
              type: newFiles.floorPlan.type,
              data: await fileToBase64(newFiles.floorPlan)
            };
          }
          
          setProgress(100);
        } else {
          if (newFiles.single) {
            const fileData = await fileToBase64(newFiles.single);
            analysis = await analyzeBlueprint(
              fileData,
              newFiles.single.type,
              (step, progress) => {
                setCurrentStep(step);
                setProgress(progress);
              }
            );
          } else if (newFiles.legend && newFiles.floorPlan) {
            const legendData = await fileToBase64(newFiles.legend);
            const floorPlanData = await fileToBase64(newFiles.floorPlan);
            analysis = await analyzeDualImages(
              legendData,
              floorPlanData,
              newFiles.legend.type,
              newFiles.floorPlan.type,
              (step, progress) => {
                setCurrentStep(step);
                setProgress(progress);
              }
            );
          }
        }
        
        if (analysis) {
          setAnalysis(analysis);
          // Always save analysis to dashboard
          addAnalysis(analysis);
        }
        setAnalyzing(false);
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed. Please try again with different files.');
        setAnalyzing(false);
      }
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles({ legend: null, floorPlan: null, single: null });
  };

  const handleUnlock = () => {
    setShowPricing(true);
  };

  const handleSelectPlan = (plan: 'basic' | 'premium') => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        onUploadClick={handleClearFiles} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="flex-1 flex overflow-hidden" aria-label="Electrical Analysis Interface">
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
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  Electrical Blueprint Analysis
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Upload your electrical documents to analyze symbols, count components, and get pricing
                </p>
              </div>

              <DualFileUpload
                onFilesSelect={handleFilesSelect}
                selectedFiles={selectedFiles}
              />

              {isAnalyzing && (
                <div className="mt-8 max-w-xl mx-auto">
                  <ThinkingTerminal
                    steps={[]}
                    currentStep={currentStep}
                    progress={analysisProgress}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Analysis View - Split Screen
          <>
            {/* Left Panel - Document */}
            <section className="flex-1 border-r border-gray-200 bg-white" aria-label="Document Viewer">
              <DocumentViewer analysis={currentAnalysis} />
            </section>

            {/* Right Panel - Analysis Results */}
            <section className="w-[500px] bg-gray-50 overflow-y-auto relative" aria-label="Analysis Results">
              <div className="p-4 sm:p-6">
                {/* Header with Export */}
                <header className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#265a39]" aria-hidden="true" />
                    Analysis Results
                  </h2>
                  {isAuthenticated && (
                    <PDFExportButton analysis={currentAnalysis} />
                  )}
                </header>

                {/* Terminal */}
                <div className="mb-6">
                  <ThinkingTerminal
                    steps={currentAnalysis.calculationSteps}
                    currentStep={currentStep}
                    progress={analysisProgress}
                    isAnalyzing={isAnalyzing}
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
                            
                            {/* Basic Plan */}
                            <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-[#265a39] transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Basic</h4>
                                  <p className="text-sm text-gray-500">50 analyses/year</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-[#265a39]">₵5,000</div>
                                  <div className="text-xs text-gray-500">/year</div>
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
                                onClick={() => handleSelectPlan('basic')}
                                className="w-full bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Select Basic
                              </button>
                            </div>

                            {/* Premium Plan */}
                            <div className="bg-white rounded-xl p-5 border-2 border-[#fdce4e] relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-[#fdce4e] text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                                  POPULAR
                                </span>
                              </div>
                              <div className="flex justify-between items-start mb-3 mt-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Premium</h4>
                                  <p className="text-sm text-gray-500">Unlimited analyses</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-[#265a39]">₵8,000</div>
                                  <div className="text-xs text-gray-500">/year</div>
                                </div>
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                <li className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-[#265a39]" />
                                  Everything in Basic
                                </li>
                                <li className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-[#265a39]" />
                                  Up to 5 team members
                                </li>
                                <li className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-[#265a39]" />
                                  Priority support
                                </li>
                              </ul>
                              <button
                                onClick={() => handleSelectPlan('premium')}
                                className="w-full bg-[#265a39] text-white font-semibold py-2 rounded-lg hover:bg-[#1e4a2d] transition-colors shadow-lg"
                              >
                                Select Premium
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
            </section>
          </>
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
