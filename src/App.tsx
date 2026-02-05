import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Sidebar } from './components/Layout/Sidebar';
import { DualFileUpload } from './components/FileUpload/DualFileUpload';
import { DocumentViewer } from './components/DocumentViewer/DocumentViewer';
import { ThinkingTerminal } from './components/ThinkingTerminal/ThinkingTerminal';
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel';
import { PaywallOverlay } from './components/PaywallOverlay/PaywallOverlay';
import { PaymentModal } from './components/PaymentModal/PaymentModal';
import { PDFExportButton } from './utils/pdfGenerator';
import { useAnalysisStore } from './stores/analysisStore';
import { analyzeBlueprint, analyzeDualImages, generateMockAnalysis } from './services/gemini';
import { fileToBase64 } from './utils/fileHelpers';
import './App.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<{
    legend: File | null;
    floorPlan: File | null;
    single: File | null;
  }>({ legend: null, floorPlan: null, single: null });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    currentAnalysis,
    hasUsedFreeAnalysis,
    isPaid,
    isAnalyzing,
    analysisProgress,
    currentStep,
    setAnalysis,
    setAnalyzing,
    setProgress,
    setCurrentStep,
    canAccessFullAnalysis
  } = useAnalysisStore();

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
    
    // Check if we have enough files to analyze
    const hasSingleFile = !!newFiles.single;
    const hasDualFiles = !!newFiles.legend && !!newFiles.floorPlan;
    
    if (hasSingleFile || hasDualFiles) {
      try {
        setIsLoading(true);
        setAnalyzing(true);
        
        let analysis;
        const useMock = !import.meta.env.VITE_GEMINI_API_KEY || 
                        import.meta.env.VITE_GEMINI_API_KEY === 'your_api_key_here';
        
        if (useMock) {
          // Simulate analysis with mock data
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
          
          // Set file information
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
          // Real Gemini analysis
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
        }
        setAnalyzing(false);
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed. Please try again with different files.');
        setAnalyzing(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles({ legend: null, floorPlan: null, single: null });
  };

  const handleUnlock = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
  };

  const canAccessFull = canAccessFullAnalysis();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onUploadClick={handleClearFiles} />
      
      <div className="flex-1 flex overflow-hidden">
        {!currentAnalysis ? (
          // Upload View
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-3xl w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Electrical Blueprint Analysis
                </h2>
                <p className="text-gray-600">
                  Upload your electrical documents to analyze symbols, count components, and get pricing
                </p>
              </div>

              <DualFileUpload
                onFilesSelect={handleFilesSelect}
                selectedFiles={selectedFiles}
              />

              {isAnalyzing && (
                <div className="mt-8">
                  <ThinkingTerminal
                    steps={[]}
                    currentStep={currentStep}
                    progress={analysisProgress}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              )}

              {hasUsedFreeAnalysis && !isPaid && !currentAnalysis && (
                <div className="mt-8 p-6 bg-[#FFC132]/10 border border-[#FFC132] rounded-xl text-center">
                  <p className="text-gray-700 mb-2">
                    <strong>You've used your free analysis!</strong>
                  </p>
                  <p className="text-gray-600 mb-4">
                    Pay ₵500 to unlock complete analysis with GS1009 compliance audit,
                    component pricing, power recommendations, and PDF export.
                  </p>
                  <button
                    onClick={handleUnlock}
                    className="bg-[#007A41] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#007A41]/90 transition-colors"
                  >
                    Unlock Now - ₵500
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Analysis View - Split Screen
          <>
            {/* Left Panel - Document */}
            <div className="flex-1 border-r border-gray-200">
              <DocumentViewer analysis={currentAnalysis} />
            </div>

            {/* Right Panel - Analysis Results */}
            <div className="w-[500px] bg-white overflow-y-auto relative">
              <div className="p-6">
                {/* Header with Export */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#007A41]" />
                    Analysis Results
                  </h3>
                  {canAccessFull && (
                    <PDFExportButton analysis={currentAnalysis} />
                  )}
                </div>

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
                    isLocked={!canAccessFull}
                  />
                  
                  {/* Paywall Overlay */}
                  {!canAccessFull && (
                    <PaywallOverlay 
                      onUnlock={handleUnlock}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default App;
