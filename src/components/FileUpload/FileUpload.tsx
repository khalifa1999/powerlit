import React, { useCallback } from 'react';
import { Upload, X, FileImage, FileText } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/fileHelpers';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  selectedFile, 
  onClear 
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFileSelect(file);
      } else {
        setError(validation.error || 'Invalid file');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        onFileSelect(file);
      } else {
        setError(validation.error || 'Invalid file');
      }
    }
  }, [onFileSelect]);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-12 h-12 text-[#007A41]" />;
    }
    return <FileImage className="w-12 h-12 text-[#007A41]" />;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-[#FFC132] bg-[#FFC132]/10' 
              : 'border-gray-300 hover:border-[#007A41] hover:bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your blueprint here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> PDF
              </span>
              <span className="flex items-center gap-1">
                <FileImage className="w-3 h-3" /> PNG
              </span>
              <span className="flex items-center gap-1">
                <FileImage className="w-3 h-3" /> JPG
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Maximum file size: 15MB</p>
          </label>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile.type)}
            <div className="flex-1">
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={onClear}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
