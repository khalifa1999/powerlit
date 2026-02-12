import React, { useCallback, useState } from 'react';
import { X, FileImage, FileText, Image, Map } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/fileHelpers';

interface DualFileUploadProps {
  onFilesSelect: (files: { legend?: File | null; floorPlan?: File | null }) => void;
  selectedFiles: { legend: File | null; floorPlan: File | null };
}

export const DualFileUpload: React.FC<DualFileUploadProps> = ({ 
  onFilesSelect, 
  selectedFiles
}) => {
  const [isDraggingLegend, setIsDraggingLegend] = useState(false);
  const [isDraggingFloorPlan, setIsDraggingFloorPlan] = useState(false);
  const [errors, setErrors] = useState<{ legend?: string; floorPlan?: string }>({});

  const clearErrors = () => setErrors({});

  const handleLegendDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLegend(false);
    clearErrors();

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFilesSelect({ 
          legend: file, 
          floorPlan: selectedFiles.floorPlan 
        });
      } else {
        setErrors(prev => ({ ...prev, legend: validation.error || 'Invalid file' }));
      }
    }
  }, [onFilesSelect, selectedFiles.floorPlan]);

  const handleFloorPlanDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFloorPlan(false);
    clearErrors();

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFilesSelect({ 
          legend: selectedFiles.legend, 
          floorPlan: file 
        });
      } else {
        setErrors(prev => ({ ...prev, floorPlan: validation.error || 'Invalid file' }));
      }
    }
  }, [onFilesSelect, selectedFiles.legend]);

  const handleLegendInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors();
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFilesSelect({ 
          legend: file, 
          floorPlan: selectedFiles.floorPlan 
        });
      } else {
        setErrors(prev => ({ ...prev, legend: validation.error || 'Invalid file' }));
      }
    }
  }, [onFilesSelect, selectedFiles.floorPlan]);

  const handleFloorPlanInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors();
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFilesSelect({ 
          legend: selectedFiles.legend, 
          floorPlan: file 
        });
      } else {
        setErrors(prev => ({ ...prev, floorPlan: validation.error || 'Invalid file' }));
      }
    }
  }, [onFilesSelect, selectedFiles.legend]);

  const handleClearLegend = () => {
    onFilesSelect({ 
      legend: undefined, 
      floorPlan: selectedFiles.floorPlan 
    });
  };

  const handleClearFloorPlan = () => {
    onFilesSelect({ 
      legend: selectedFiles.legend, 
      floorPlan: undefined 
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-10 h-10 text-[#265a39]" />;
    }
    return <FileImage className="w-10 h-10 text-[#265a39]" />;
  };

  // Can analyze if blueprint (floorPlan) is provided
  const canAnalyze = !!selectedFiles.floorPlan;

  return (
    <div className="w-full space-y-6">
      {/* Dual File Upload - Always show both options */}
      <div className="grid grid-cols-2 gap-4">
        {/* Legend Upload (Optional) */}
        <div>
          {!selectedFiles.legend ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingLegend(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingLegend(false); }}
              onDrop={handleLegendDrop}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer h-full glass-card
                ${isDraggingLegend 
                  ? 'border-[#265a39] bg-[#265a39]/10' 
                  : 'border-gray-300 hover:border-[#265a39] hover:bg-gray-50'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleLegendInput}
                className="hidden"
                id="legend-file-input"
              />
              <label htmlFor="legend-file-input" className="cursor-pointer block">
                <Image className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-900 mb-1">
                  Legend File
                </p>
                <p className="text-xs text-gray-600">
                  Symbol reference chart
                </p>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Required
                </p>
                <p className="text-xs text-gray-500 mt-2">
                 PNG, or JPG
                </p>
              </label>
            </div>
          ) : (
            <div className="glass-card bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFiles.legend.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{selectedFiles.legend.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(selectedFiles.legend.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearLegend}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
          {errors.legend && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              {errors.legend}
            </div>
          )}
        </div>

        {/* Blueprint/Floor Plan Upload (Required) */}
        <div>
          {!selectedFiles.floorPlan ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFloorPlan(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingFloorPlan(false); }}
              onDrop={handleFloorPlanDrop}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer h-full glass-card
                ${isDraggingFloorPlan 
                  ? 'border-[#265a39] bg-[#265a39]/10' 
                  : 'border-gray-300 hover:border-[#265a39] hover:bg-gray-50'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFloorPlanInput}
                className="hidden"
                id="floorplan-file-input"
              />
              <label htmlFor="floorplan-file-input" className="cursor-pointer block">
                <Map className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-900 mb-1">
                  Blueprint File
                </p>
                <p className="text-xs text-gray-600">
                  Floor plan with electrical layout
                </p>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Required
                </p>
                <p className="text-xs text-gray-500 mt-2">
                 PNG, or JPG
                </p>
              </label>
            </div>
          ) : (
            <div className="glass-card bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFiles.floorPlan.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{selectedFiles.floorPlan.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(selectedFiles.floorPlan.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearFloorPlan}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
          {errors.floorPlan && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              {errors.floorPlan}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Button */}
      {canAnalyze && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-900 glass-card bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <div className="w-2 h-2 bg-[#265a39] rounded-full animate-pulse"></div>
            Ready to analyze
          </div>
        </div>
      )}
    </div>
  );
};
