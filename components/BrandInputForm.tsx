
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
      <div className="space-y-3 rounded-lg border border-gray-600 bg-gray-800 p-3 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-cyan-500">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-stretch">
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Enter a brand name (e.g., Nike, Apple, Coca-Cola)"
            className="w-full rounded-md bg-gray-900/60 px-4 py-3 text-lg text-gray-100 placeholder-gray-500 focus:outline-none"
            disabled={isLoading}
          />
          <label className="flex flex-col justify-center rounded-md bg-gray-900/40 px-3 py-2 text-sm text-gray-300">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">Model</span>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value as GeminiModelOption)}
              disabled={isLoading}
              className="bg-transparent text-sm text-gray-100 focus:outline-none"
            >
              {models.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-900 text-gray-100">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-cyan-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SearchIcon className="mr-2 h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <p className="px-1 text-sm text-gray-400">
          {models.find((option) => option.value === model)?.description}
        </p>
      </div>
    </form>
  );
};

export default BrandInputForm;
