import React, { useCallback, useState } from 'react';
import { X, FileImage, FileText, Upload, Files, Sparkles } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/fileHelpers';

interface BatchFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

export const BatchFileUpload: React.FC<BatchFileUploadProps> = ({ 
  onFilesSelect, 
  selectedFiles
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const clearErrors = () => setErrors([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    clearErrors();

    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length > 0) {
      onFilesSelect([...selectedFiles, ...validFiles]);
    }
  }, [onFilesSelect, selectedFiles]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors();
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length > 0) {
      onFilesSelect([...selectedFiles, ...validFiles]);
    }
  }, [onFilesSelect, selectedFiles]);

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFilesSelect(newFiles);
  };

  const handleClearAll = () => {
    onFilesSelect([]);
    clearErrors();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-8 h-8 text-[#265a39]" />;
    }
    return <FileImage className="w-8 h-8 text-[#265a39]" />;
  };

  const canAnalyze = selectedFiles.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Auto-Detection Enabled</p>
            <p className="text-xs text-blue-700 mt-1">
              Upload multiple files and our AI will automatically detect which are legends and which are blueprints, then match them appropriately.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-[#265a39] bg-[#265a39]/10' 
            : 'border-gray-300 hover:border-[#265a39] hover:bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleInput}
          className="hidden"
          id="batch-file-input"
          multiple
        />
        <label htmlFor="batch-file-input" className="cursor-pointer block">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your electrical documents here
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Upload multiple blueprints and legends at once
          </p>
          <p className="text-xs text-gray-500">
            PDF, PNG, or JPG • Max 15MB each
          </p>
        </label>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">Some files were rejected:</p>
          <ul className="text-xs text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Button */}
      {canAnalyze && (
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-900 bg-[#265a39]/10 px-4 py-2 rounded-full border border-[#265a39]/30">
            <Files className="w-4 h-4 text-[#265a39]" />
            Ready to analyze {selectedFiles.length} blueprint{selectedFiles.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};
