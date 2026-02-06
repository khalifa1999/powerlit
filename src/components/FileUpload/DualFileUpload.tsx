import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileText, Image, Map } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/fileHelpers';

interface DualFileUploadProps {
  onFilesSelect: (files: { legend?: File | null; floorPlan?: File | null; single?: File | null }) => void;
  selectedFiles: { legend: File | null; floorPlan: File | null; single: File | null };
}

export const DualFileUpload: React.FC<DualFileUploadProps> = ({ 
  onFilesSelect, 
  selectedFiles
}) => {
  const [uploadMode, setUploadMode] = useState<'single' | 'dual'>('single');
  const [isDraggingLegend, setIsDraggingLegend] = useState(false);
  const [isDraggingFloorPlan, setIsDraggingFloorPlan] = useState(false);
  const [isDraggingSingle, setIsDraggingSingle] = useState(false);
  const [errors, setErrors] = useState<{ legend?: string; floorPlan?: string; single?: string }>({});

  const clearErrors = () => setErrors({});

  const handleSingleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSingle(false);
    clearErrors();

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFilesSelect({ single: file });
      } else {
        setErrors(prev => ({ ...prev, single: validation.error || 'Invalid file' }));
      }
    }
  }, [onFilesSelect]);

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

  const handleSingleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors();
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFilesSelect({ single: file });
      } else {
        setErrors(prev => ({ ...prev, single: validation.error || 'Invalid file' }));
      }
    }
  }, [onFilesSelect]);

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

  const handleClearSingle = () => {
    onFilesSelect({ single: undefined });
  };

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

  const canAnalyze = uploadMode === 'single' 
    ? !!selectedFiles.single 
    : (!!selectedFiles.legend && !!selectedFiles.floorPlan);

  return (
    <div className="w-full space-y-6">
      {/* Upload Mode Toggle */}
      <div className="flex justify-center">
        <div className="glass-card bg-gray-50 p-1 rounded-xl inline-flex border border-gray-200">
          <button
            onClick={() => setUploadMode('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-smooth ${
              uploadMode === 'single' 
                ? 'bg-[#265a39] text-white shadow-lg shadow-[#265a39]/25' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single File
          </button>
          <button
            onClick={() => setUploadMode('dual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-smooth ${
              uploadMode === 'dual' 
                ? 'bg-[#265a39] text-white shadow-lg shadow-[#265a39]/25' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Two Images
          </button>
        </div>
      </div>

      {uploadMode === 'single' ? (
        /* Single File Upload */
        <div>
          {!selectedFiles.single ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingSingle(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingSingle(false); }}
              onDrop={handleSingleFileDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer glass-card
                ${isDraggingSingle 
                  ? 'border-[#265a39] bg-[#265a39]/10' 
                  : 'border-gray-300 hover:border-[#265a39] hover:bg-gray-50'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleSingleFileInput}
                className="hidden"
                id="single-file-input"
              />
              <label htmlFor="single-file-input" className="cursor-pointer block">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your electrical document here
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Contains both legend and floor plan
                </p>
                <p className="text-xs text-gray-500">
                  PDF, PNG, or JPG • Max 15MB
                </p>
              </label>
            </div>
          ) : (
            <div className="glass-card bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                {getFileIcon(selectedFiles.single.type)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFiles.single.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFiles.single.size)}</p>
                </div>
                <button
                  onClick={handleClearSingle}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
          {errors.single && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.single}
            </div>
          )}
        </div>
      ) : (
        /* Dual Image Upload */
        <div className="grid grid-cols-2 gap-4">
          {/* Legend Upload */}
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
                  accept=".png,.jpg,.jpeg"
                  onChange={handleLegendInput}
                  className="hidden"
                  id="legend-file-input"
                />
                <label htmlFor="legend-file-input" className="cursor-pointer block">
                  <Image className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-gray-900 mb-1">
                    Legend Image
                  </p>
                  <p className="text-xs text-gray-600">
                    Symbol reference chart
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG or JPG
                  </p>
                </label>
              </div>
            ) : (
              <div className="glass-card bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <FileImage className="w-8 h-8 text-[#265a39]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{selectedFiles.legend.name}</p>
                    <p className="text-xs text-gray-600">{formatFileSize(selectedFiles.legend.size)}</p>
                  </div>
                  <button
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

          {/* Floor Plan Upload */}
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
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFloorPlanInput}
                  className="hidden"
                  id="floorplan-file-input"
                />
                <label htmlFor="floorplan-file-input" className="cursor-pointer block">
                  <Map className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-gray-900 mb-1">
                    Floor Plan
                  </p>
                  <p className="text-xs text-gray-600">
                    Electrical layout drawing
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG or JPG
                  </p>
                </label>
              </div>
            ) : (
              <div className="glass-card bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <FileImage className="w-8 h-8 text-[#265a39]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{selectedFiles.floorPlan.name}</p>
                    <p className="text-xs text-gray-600">{formatFileSize(selectedFiles.floorPlan.size)}</p>
                  </div>
                  <button
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
      )}

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
