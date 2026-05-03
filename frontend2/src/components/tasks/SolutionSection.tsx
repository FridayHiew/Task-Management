'use client';

import { useState, useCallback } from 'react';
import { FiPlus, FiTrash2, FiAlertCircle, FiDollarSign, FiUsers } from 'react-icons/fi';

interface Cost {
  cost: number;
  manpower: string;
  maintenance_cost: number;
}

interface Risk {
  risk: string;
  mitigation: string;
}

interface Solution {
  id?: number;
  solution: string;
  costs?: Cost[];
  risks?: Risk[];
}

interface SolutionSectionProps {
  solutions: Solution[];
  onChange: (solutions: Solution[]) => void;
}

export default function SolutionSection({ 
  solutions, 
  onChange, 
}: SolutionSectionProps) {
  
  const addSolution = useCallback(() => {
    if (solutions.length >= 5) {
      alert('Maximum 5 solutions allowed');
      return;
    }
    const newSolution: Solution = { 
      solution: '', 
      costs: [], 
      risks: [] 
    };
    onChange([...solutions, newSolution]);
  }, [solutions, onChange]);

  const updateSolution = useCallback((index: number, field: string, value: any) => {
    const updated = [...solutions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }, [solutions, onChange]);

  const removeSolution = useCallback((index: number) => {
    const updated = solutions.filter((_, i) => i !== index);
    onChange(updated);
  }, [solutions, onChange]);

  const addCost = useCallback((solutionIndex: number) => {
    const updated = [...solutions];
    const costs = updated[solutionIndex].costs || [];
    const newCost: Cost = { cost: 0, manpower: '', maintenance_cost: 0 };
    updated[solutionIndex].costs = [...costs, newCost];
    onChange(updated);
  }, [solutions, onChange]);

  const updateCost = useCallback((solutionIndex: number, costIndex: number, field: keyof Cost, value: any) => {
    const updated = [...solutions];
    const costs = [...(updated[solutionIndex].costs || [])];
    
    let processedValue = value;
    
    if (field === 'cost' || field === 'maintenance_cost') {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    } else if (field === 'manpower') {
      processedValue = value;
    }
    
    costs[costIndex] = { ...costs[costIndex], [field]: processedValue };
    updated[solutionIndex].costs = costs;
    onChange(updated);
  }, [solutions, onChange]);

  const removeCost = useCallback((solutionIndex: number, costIndex: number) => {
    const updated = [...solutions];
    const costs = updated[solutionIndex].costs || [];
    updated[solutionIndex].costs = costs.filter((_, i) => i !== costIndex);
    onChange(updated);
  }, [solutions, onChange]);

  const addRisk = useCallback((solutionIndex: number) => {
    const updated = [...solutions];
    const risks = updated[solutionIndex].risks || [];
    const newRisk: Risk = { risk: '', mitigation: '' };
    updated[solutionIndex].risks = [...risks, newRisk];
    onChange(updated);
  }, [solutions, onChange]);

  const updateRisk = useCallback((solutionIndex: number, riskIndex: number, field: keyof Risk, value: string) => {
    const updated = [...solutions];
    const risks = [...(updated[solutionIndex].risks || [])];
    risks[riskIndex] = { ...risks[riskIndex], [field]: value };
    updated[solutionIndex].risks = risks;
    onChange(updated);
  }, [solutions, onChange]);

  const removeRisk = useCallback((solutionIndex: number, riskIndex: number) => {
    const updated = [...solutions];
    const risks = updated[solutionIndex].risks || [];
    updated[solutionIndex].risks = risks.filter((_, i) => i !== riskIndex);
    onChange(updated);
  }, [solutions, onChange]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">Solutions</h2>
          <span className="text-xs text-gray-400">(Max 5)</span>
        </div>
        <button
          type="button"
          onClick={addSolution}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
        >
          <FiPlus size={14} /> Add Solution
        </button>
      </div>

      {/* Empty State */}
      {solutions.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <FiPlus className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-500 text-sm">No solutions added yet</p>
          <button
            type="button"
            onClick={addSolution}
            className="mt-2 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Click here to add a solution
          </button>
        </div>
      )}

      {/* Solutions List */}
      {solutions.map((solution, solutionIndex) => (
        <div key={solutionIndex} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
          {/* Solution Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">
                {solutionIndex + 1}
              </div>
              <h3 className="font-semibold text-gray-900">Solution {solutionIndex + 1}</h3>
            </div>
            <button
              type="button"
              onClick={() => removeSolution(solutionIndex)}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
            >
              <FiTrash2 size={16} />
            </button>
          </div>

          {/* Solution Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solution Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={solution.solution}
              onChange={(e) => updateSolution(solutionIndex, 'solution', e.target.value)}
              required
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Describe the solution..."
            />
          </div>

          {/* Costs Section */}
          <div className="mb-4 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-green-600" size={16} />
                <label className="text-sm font-medium text-gray-700">Costs</label>
              </div>
              <button
                type="button"
                onClick={() => addCost(solutionIndex)}
                className="text-green-600 text-sm hover:text-green-700 flex items-center gap-1"
              >
                <FiPlus size={12} /> Add Cost
              </button>
            </div>

            {solution.costs && solution.costs.length > 0 ? (
              <div className="space-y-3">
                {solution.costs.map((cost, costIndex) => (
                  <div key={`cost-${solutionIndex}-${costIndex}`} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Cost Entry {costIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCost(solutionIndex, costIndex)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Man Day</label>
                        <input
                          type="text"
                          placeholder="e.g., 5 days"
                          value={cost.manpower}
                          onChange={(e) => updateCost(solutionIndex, costIndex, 'manpower', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cost (RM)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={cost.cost || ''}
                          onChange={(e) => updateCost(solutionIndex, costIndex, 'cost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Maintenance (RM)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={cost.maintenance_cost || ''}
                          onChange={(e) => updateCost(solutionIndex, costIndex, 'maintenance_cost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No costs added. Click "Add Cost" to add.
              </div>
            )}
          </div>

          {/* Risks Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-orange-600" size={16} />
                <label className="text-sm font-medium text-gray-700">Risks & Mitigation</label>
              </div>
              <button
                type="button"
                onClick={() => addRisk(solutionIndex)}
                className="text-orange-600 text-sm hover:text-orange-700 flex items-center gap-1"
              >
                <FiPlus size={12} /> Add Risk
              </button>
            </div>

            {solution.risks && solution.risks.length > 0 ? (
              <div className="space-y-3">
                {solution.risks.map((risk, riskIndex) => (
                  <div key={`risk-${solutionIndex}-${riskIndex}`} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Risk {riskIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeRisk(solutionIndex, riskIndex)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        placeholder="Risk Description"
                        value={risk.risk}
                        onChange={(e) => updateRisk(solutionIndex, riskIndex, 'risk', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <textarea
                        placeholder="Suggested Mitigation"
                        value={risk.mitigation}
                        onChange={(e) => updateRisk(solutionIndex, riskIndex, 'mitigation', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No risks added. Click "Add Risk" to add.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}