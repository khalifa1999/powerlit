import React from 'react';
import { Upload, FileText, Zap, Info } from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';

interface SidebarProps {
  onUploadClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onUploadClick }) => {
  const { currentAnalysis, hasUsedFreeAnalysis, isPaid } = useAnalysisStore();

  return (
    <div className="w-64 bg-[#007A41] h-screen flex flex-col text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-[#FFC132]" />
          <h1 className="text-2xl font-bold">PowerLit</h1>
        </div>
        <p className="text-sm text-white/70 mt-1">Electrical Analysis AI</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <button
          onClick={onUploadClick}
          className="w-full bg-[#FFC132] text-[#007A41] font-semibold py-3 px-4 rounded-lg flex items-center gap-2 hover:bg-[#FFC132]/90 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Blueprint
        </button>

        {currentAnalysis && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Current Analysis
            </h3>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FFC132]" />
                <span className="text-sm truncate">{currentAnalysis.fileName}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-[#FFC132] text-[#007A41] px-2 py-1 rounded">
                  {isPaid ? 'Full Access' : hasUsedFreeAnalysis ? 'Preview' : 'Free'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Usage Info */}
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#FFC132] mt-0.5" />
            <div>
              <p className="text-sm font-medium">Free Analysis</p>
              <p className="text-xs text-white/70 mt-1">
                {hasUsedFreeAnalysis 
                  ? 'You have used your free analysis. Pay 500 GHS for full access.' 
                  : 'Upload your first blueprint for a free complete analysis.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 text-xs text-white/50 text-center">
        PowerLit © 2024
        <br />
        Ghana Energy Commission Partner
      </div>
    </div>
  );
};
