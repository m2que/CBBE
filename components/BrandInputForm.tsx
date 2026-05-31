
import React, { useState } from 'react';
import { SearchIcon } from './icons';
import type { GeminiModelOption } from '../types';

interface BrandInputFormProps {
  onSubmit: (brandName: string, model: GeminiModelOption) => void;
  isLoading: boolean;
  model: GeminiModelOption;
  models: { value: GeminiModelOption; label: string; description: string }[];
  onModelChange: (model: GeminiModelOption) => void;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ onSubmit, isLoading, model, models, onModelChange }) => {
  const [brandName, setBrandName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(brandName, model);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
      <div className="space-y-3 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-3 shadow-[0_24px_80px_rgba(61,41,20,0.12)] transition-all duration-300 focus-within:ring-2 focus-within:ring-teal-700/30">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-stretch">
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Enter a brand name (e.g., Nike, Apple, Coca-Cola)"
            className="w-full rounded-2xl border border-[rgba(15,118,110,0.12)] bg-[#fffaf2] px-4 py-3 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none"
            disabled={isLoading}
          />
          <label className="flex flex-col justify-center rounded-2xl border border-[rgba(15,118,110,0.12)] bg-[#fffaf2] px-3 py-2 text-sm text-slate-700">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-800">Model</span>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value as GeminiModelOption)}
              disabled={isLoading}
              className="bg-transparent text-sm text-slate-800 focus:outline-none"
            >
              {models.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#fffaf2] text-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#115e59)] px-6 py-3 font-semibold text-white shadow-[0_14px_28px_rgba(15,118,110,0.24)] transition-all duration-300 hover:-translate-y-px hover:bg-[linear-gradient(135deg,#115e59,#134e4a)] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 focus:ring-offset-[#fffaf2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SearchIcon className="mr-2 h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <p className="px-1 text-sm text-slate-500">
          {models.find((option) => option.value === model)?.description}
        </p>
      </div>
    </form>
  );
};

export default BrandInputForm;
