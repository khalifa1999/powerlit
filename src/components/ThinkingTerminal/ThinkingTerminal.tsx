import React from 'react';
import { CalculationStep } from '../../types/analysis';
import { Check, Loader2, Cpu, Clock, AlertCircle } from 'lucide-react';

interface ThinkingTerminalProps {
  steps: CalculationStep[];
  currentStep: string;
  progress: number;
  isAnalyzing: boolean;
  isLongRunning?: boolean;
  elapsedTime?: number;
}

export const ThinkingTerminal: React.FC<ThinkingTerminalProps> = ({
  steps,
  currentStep,
  progress,
  isAnalyzing,
  isLongRunning = false,
  elapsedTime = 0
}) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [steps, currentStep]);

  // Format elapsed time for display
  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden font-mono text-sm shadow-xl border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#265a39]" />
          <span className="text-gray-900 font-semibold">AI Analysis Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          {elapsedTime > 0 && (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{formatElapsedTime(elapsedTime)}</span>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-[#265a39]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-[#265a39] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Long Running Warning Banner */}
      {isLongRunning && isAnalyzing && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 animate-pulse">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">
                Heavy Computer Vision Processing in Progress
              </p>
              <p className="text-amber-700 text-xs mt-1">
                This detailed analysis involves complex image recognition and symbol detection. 
                Please don't close this window - we're working hard on your blueprint and will have results soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="p-4 h-64 overflow-y-auto space-y-2"
      >
        {steps.length === 0 && isAnalyzing && (
          <div className="text-gray-500">
            <span className="text-[#265a39]">➜</span> Initializing analysis engine...
          </div>
        )}

        {steps.map((step, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#265a39] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-[#265a39] font-semibold">
                  Step {step.step}: {step.title}
                </div>
                <div className="text-gray-600 mt-1">
                  {step.description}
                </div>
                {step.formula && (
                  <div className="text-gray-500 mt-1 text-xs">
                    <span className="text-[#265a39]">Formula:</span> {step.formula}
                  </div>
                )}
                {step.value && (
                  <div className="text-[#265a39] mt-1 font-semibold">
                    Result: {step.value}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {currentStep && isAnalyzing && (
          <div className="flex items-center gap-2 text-[#265a39]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{currentStep}</span>
          </div>
        )}
      </div>
    </div>
  );
};
