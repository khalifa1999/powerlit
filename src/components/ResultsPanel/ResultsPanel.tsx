import React, { useState } from 'react';
import { Analysis, SymbolMatch, ComponentType, COMPONENT_PRICES, getComponentLabel } from '../../types/analysis';
import { formatLoad } from '../../utils/calculations';
import { Building, Zap, Shield, Battery, Sun, Grid3X3, AlertCircle, CheckCircle, Image, Pencil, Trash2, Plus, Save, X } from 'lucide-react';

interface ResultsPanelProps {
  analysis: Analysis;
  isLocked: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ analysis, isLocked }) => {
  const [symbolMatches, setSymbolMatches] = useState<SymbolMatch[]>(analysis.symbolMatches || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SymbolMatch | null>(null);

  const getBuildingIcon = () => {
    switch (analysis.buildingType) {
      case 'residential':
        return <Building className="w-5 h-5" />;
      case 'industrial':
        return <Zap className="w-5 h-5" />;
      default:
        return <Grid3X3 className="w-5 h-5" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'solar':
        return <Sun className="w-4 h-4" />;
      case 'battery':
        return <Battery className="w-4 h-4" />;
      case 'generator':
        return <Zap className="w-4 h-4" />;
      default:
        return <Grid3X3 className="w-4 h-4" />;
    }
  };

  const handleEdit = (match: SymbolMatch) => {
    setEditingId(match.id);
    setEditForm({ ...match });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = () => {
    if (editForm) {
      const updatedMatches = symbolMatches.map(m =>
        m.id === editForm.id ? { ...editForm, totalPrice: editForm.count * editForm.unitPrice } : m
      );
      setSymbolMatches(updatedMatches);
      setEditingId(null);
      setEditForm(null);
      // Update analysis object (in real app, this would update the store)
      analysis.symbolMatches = updatedMatches;
    }
  };

  const handleDelete = (id: string) => {
    const updatedMatches = symbolMatches.filter(m => m.id !== id);
    setSymbolMatches(updatedMatches);
    analysis.symbolMatches = updatedMatches;
  };

  const handleAdd = () => {
    const newMatch: SymbolMatch = {
      id: Date.now().toString(),
      name: 'New Component',
      count: 1,
      unitPrice: 500,
      totalPrice: 500,
      rating: 0.1,
      type: 'other'
    };
    const updatedMatches = [...symbolMatches, newMatch];
    setSymbolMatches(updatedMatches);
    setEditingId(newMatch.id);
    setEditForm(newMatch);
    analysis.symbolMatches = updatedMatches;
  };

  const grandTotal = symbolMatches.reduce((sum, match) => sum + match.totalPrice, 0);

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Building Info */}
      <div className="glass-card bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-[#265a39] rounded-lg text-white">
          {getBuildingIcon()}
        </div>
        <div>
          <p className="text-sm text-gray-600">Building Type</p>
          <p className="font-semibold text-[#265a39] capitalize">
            {analysis.buildingType}
          </p>
        </div>
      </div>

      {/* Symbol Detection & Pricing */}
      <div className={`glass-card bg-white border border-gray-200 rounded-xl p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-[#265a39]" />
            Symbol Detection & Pricing
          </h3>
          {!isLocked && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 text-xs bg-[#265a39] text-white px-2 py-1 rounded-lg hover:bg-[#1e452d] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>

        {/* Legend Image Preview - only show for dual image uploads */}
        {analysis.legendFile && analysis.floorPlanFile && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Legend Reference</p>
            <div className="glass-card bg-gray-50 rounded-lg p-2 border border-gray-200">
              <img
                src={analysis.legendFile.data}
                alt="Legend"
                className="max-h-32 mx-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Symbol Matches Table */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {symbolMatches.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No symbols detected</p>
          ) : (
            symbolMatches.map((match) => (
              <div key={match.id} className="glass-card bg-gray-50 rounded-lg p-3 border border-gray-200">
                {editingId === match.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Component Name</label>
                      <input
                        type="text"
                        value={editForm?.name || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-[#265a39] focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Type</label>
                        <select
                          value={editForm?.type || 'other'}
                          onChange={(e) => {
                            const type = e.target.value as ComponentType;
                            const price = COMPONENT_PRICES[type] || 500;
                            setEditForm(prev => prev ? {
                              ...prev,
                              type,
                              unitPrice: price,
                              totalPrice: prev.count * price
                            } : null);
                          }}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-[#265a39] focus:border-transparent"
                        >
                          {Object.entries(COMPONENT_PRICES).map(([type]) => (
                            <option key={type} value={type}>
                              {getComponentLabel(type as ComponentType)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Count</label>
                        <input
                          type="number"
                          value={editForm?.count || 0}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            setEditForm(prev => prev ? {
                              ...prev,
                              count,
                              totalPrice: count * prev.unitPrice
                            } : null);
                          }}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-[#265a39] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Unit Price (₵)</label>
                        <input
                          type="number"
                          value={editForm?.unitPrice || 0}
                          onChange={(e) => {
                            const unitPrice = parseInt(e.target.value) || 0;
                            setEditForm(prev => prev ? {
                              ...prev,
                              unitPrice,
                              totalPrice: prev.count * unitPrice
                            } : null);
                          }}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-[#265a39] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Rating (kW)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm?.rating || 0}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, rating: parseFloat(e.target.value) || 0 } : null)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 mt-1 bg-white text-gray-900 focus:ring-2 focus:ring-[#265a39] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold text-[#265a39] font-mono">
                        Total: {formatCurrency(editForm?.totalPrice || 0)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-1 text-xs bg-[#265a39] text-white px-2 py-1 rounded-lg hover:bg-[#1e452d] transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {match.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {getComponentLabel(match.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span>Count: <strong className="font-mono">{match.count}</strong></span>
                        <span>Price: <strong className="font-mono">{formatCurrency(match.unitPrice)}</strong></span>
                        <span>Rating: <strong className="font-mono">{match.rating} kW</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="font-semibold text-[#265a39] font-mono">
                        {formatCurrency(match.totalPrice)}
                      </span>
                      {!isLocked && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(match)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(match.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Grand Total */}
        {symbolMatches.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Grand Total</span>
              <span className="text-xl font-bold text-[#265a39] font-mono">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Load Calculation Summary */}
      <div className="glass-card bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#265a39]" />
          Load Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600">Total Connected Load</p>
            <p className="text-xl font-bold text-[#265a39] font-mono">
              {formatLoad(analysis.loadCalculation.tcl)}
            </p>
          </div>
          <div className="glass-card bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600">Maximum Demand</p>
            <p className="text-xl font-bold text-[#265a39] font-mono">
              {formatLoad(analysis.loadCalculation.md)}
            </p>
          </div>
          <div className="glass-card bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600">Diversity Factor</p>
            <p className="text-xl font-bold text-[#265a39] font-mono">
              {(analysis.loadCalculation.diversityFactor * 100).toFixed(0)}%
            </p>
          </div>
          <div className="glass-card bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600">Components</p>
            <p className="text-xl font-bold text-[#265a39] font-mono">
              {analysis.loadCalculation.components?.length ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Redundancy Requirements */}
      <div className={`glass-card bg-white border border-gray-200 rounded-xl p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#265a39]" />
          Redundancy Planning
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 glass-card bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">N+1 Requirement</span>
            <span className="font-semibold text-[#265a39] font-mono">
              {formatLoad(analysis.loadCalculation.redundancy.n1)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 glass-card bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">N+2 Requirement</span>
            <span className="font-semibold text-[#265a39] font-mono">
              {formatLoad(analysis.loadCalculation.redundancy.n2)}
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className={`glass-card bg-white border border-gray-200 rounded-xl p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <h3 className="font-semibold text-gray-900 mb-4">GS1009 Compliance</h3>
        <div className="space-y-2">
          {analysis.complianceChecks.map((check, index) => (
            <div key={index} className="flex items-start gap-2 p-2 glass-card bg-gray-50 rounded-xl">
              {check.passed ? (
                <CheckCircle className="w-4 h-4 text-[#265a39] mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{check.standard}</p>
                <p className="text-xs text-gray-500">{check.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Power Recommendations */}
      <div className={`glass-card bg-white border border-gray-200 rounded-xl p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <h3 className="font-semibold text-gray-900 mb-4">Power Sourcing Recommendations</h3>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="p-3 glass-card bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRecommendationIcon(rec.type)}
                  <span className="font-medium capitalize">{rec.type}</span>
                </div>
                <span className="text-sm font-bold text-[#265a39] font-mono">{rec.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#265a39] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${rec.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{rec.capacity}</p>
              <p className="text-xs text-gray-500 mt-1">{rec.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={`glass-card bg-[#265a39] text-black rounded-xl p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <h3 className="font-semibold mb-2">Analysis Summary</h3>
        <p className="text-sm text-white/90">{analysis.summary}</p>
      </div>
    </div>
  );
};
