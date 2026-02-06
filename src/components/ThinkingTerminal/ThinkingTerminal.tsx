import React from 'react';
import { CalculationStep } from '../../types/analysis';
import { Check, Loader2, Cpu } from 'lucide-react';

interface ThinkingTerminalProps {
  steps: CalculationStep[];
  currentStep: string;
  progress: number;
  isAnalyzing: boolean;
}

export const ThinkingTerminal: React.FC<ThinkingTerminalProps> = ({
  steps,
  currentStep,
  progress,
  isAnalyzing
}) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [steps, currentStep]);

  return (
    <div className="bg-white rounded-xl overflow-hidden font-mono text-sm shadow-xl border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#265a39]" />
          <span className="text-gray-900 font-semibold">AI Analysis Terminal</span>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-[#265a39]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-[#265a39] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

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
