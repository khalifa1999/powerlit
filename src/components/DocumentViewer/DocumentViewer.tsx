import React, { useState } from 'react';
import { Analysis } from '../../types/analysis';
import { ZoomIn, ZoomOut, Maximize, Image, Map, FileText } from 'lucide-react';

interface DocumentViewerProps {
  analysis: Analysis;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ analysis }) => {
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'floorplan' | 'legend'>('floorplan');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleReset = () => setZoom(100);

  // Determine what to show
  const hasDualImages = analysis.legendFile && analysis.floorPlanFile;
  const hasLegend = analysis.legendFile || (hasDualImages && activeTab === 'legend');
  
  // Get the current file data to display
  const getCurrentFileData = () => {
    if (hasDualImages) {
      return activeTab === 'legend' 
        ? analysis.legendFile?.data 
        : (analysis.floorPlanFile?.data || analysis.fileData);
    }
    return analysis.fileData;
  };

  // Get the current file type
  const getCurrentFileType = () => {
    if (hasDualImages) {
      return activeTab === 'legend'
        ? analysis.legendFile?.type
        : (analysis.floorPlanFile?.type || analysis.fileType);
    }
    return analysis.fileType;
  };

  const currentFileData = getCurrentFileData();
  const currentFileType = getCurrentFileType();

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">
            {hasDualImages ? 'Uploaded Images' : 'Uploaded Blueprint'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <Maximize className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab Navigation - only show if we have dual images */}
        {hasDualImages && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('floorplan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'floorplan'
                  ? 'bg-[#007A41] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              Floor Plan
            </button>
            <button
              onClick={() => setActiveTab('legend')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'legend'
                  ? 'bg-[#007A41] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Image className="w-4 h-4" />
              Legend
            </button>
          </div>
        )}
      </div>

      {/* Document */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div 
          className="bg-white shadow-lg transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}
        >
          {currentFileData ? (
            currentFileType?.includes('pdf') ? (
              <div className="w-[800px] h-[600px] bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
                <div className="bg-[#007A41]/10 p-8 rounded-full mb-6">
                  <FileText className="w-24 h-24 text-[#007A41]" />
                </div>
                <p className="text-xl font-semibold text-gray-800 mb-2">PDF Document Loaded</p>
                <p className="text-sm text-gray-500">{analysis.fileName}</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-[#007A41]">
                  <div className="w-2 h-2 bg-[#007A41] rounded-full animate-pulse"></div>
                  <span>Ready for analysis</span>
                </div>
              </div>
            ) : (
              <img
                src={currentFileData}
                alt={activeTab === 'legend' ? 'Legend' : 'Floor Plan'}
                className="max-w-[800px] max-h-[600px] object-contain"
              />
            )
          ) : (
            <div className="w-[800px] h-[600px] bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Document preview not available</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend info footer */}
      {activeTab === 'legend' && hasLegend && (
        <div className="bg-white border-t border-gray-200 p-3">
          <p className="text-sm text-gray-600 text-center">
            <strong>Legend:</strong> Reference chart showing electrical symbols used in the floor plan
          </p>
        </div>
      )}
    </div>
  );
};
