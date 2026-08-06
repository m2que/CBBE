
import React, { useState } from 'react';
import { Pyramid } from 'lucide-react';
import { SearchIcon } from './icons';
import type { GeminiModelOption } from '../types';

interface BrandInputFormProps {
  onAnalyzeClick: (brandName: string, model: GeminiModelOption) => void;
  isLoading: boolean;
  model: GeminiModelOption;
  models: { value: GeminiModelOption; label: string; description: string }[];
  onModelChange: (model: GeminiModelOption) => void;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ onAnalyzeClick, isLoading, model, models, onModelChange }) => {
  const [brandName, setBrandName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAnalyzeClick = () => {
    const trimmedBrandName = brandName.trim();

    if (trimmedBrandName.length > 200) {
      setInputError('Brand name must be 200 characters or fewer.');
      return;
    }

    setInputError(null);
    onAnalyzeClick(trimmedBrandName, model);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mb-8 mx-auto max-w-4xl">
      <div className="space-y-4 rounded-[28px] border border-[rgba(245,238,220,0.45)] bg-[linear-gradient(145deg,rgba(4,47,46,0.96),rgba(8,83,75,0.94)_52%,rgba(10,57,54,0.97))] p-4 shadow-[0_30px_90px_rgba(3,32,30,0.42)] transition-all duration-300 focus-within:ring-2 focus-within:ring-[rgba(254,240,138,0.45)] sm:p-5">
        <div className="mb-1 flex items-center gap-3 text-[#f6e7c8]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,248,225,0.22)] bg-[rgba(255,250,240,0.1)] text-current shadow-[inset_0_1px_0_rgba(255,248,225,0.08)]">
            <Pyramid className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(246,231,200,0.8)]">CBBE Input</p>
            <p className="text-sm text-[rgba(248,239,218,0.88)]">Enter a brand, choose a model, and generate the analysis.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <label className="flex flex-col gap-2">
            <span className="text-lg font-extrabold uppercase tracking-[0.12em] text-[#f6e7c8] sm:text-[1.3rem]">Brand Name</span>
            <input
              type="text"
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value);
                setInputError(null);
              }}
              maxLength={200}
              placeholder="Enter a brand name (e.g., Nike, Apple, Coca-Cola)"
              className="w-full rounded-2xl border border-[rgba(255,248,225,0.36)] bg-[rgba(255,250,240,0.14)] px-4 py-3 text-lg text-[#fff8ea] placeholder:text-[rgba(246,231,200,0.72)] shadow-[inset_0_1px_0_rgba(255,248,225,0.12),0_18px_40px_rgba(2,24,23,0.28)] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[rgba(254,240,138,0.45)]"
              disabled={isLoading}
            />
          </label>
          <label className="flex flex-col justify-center gap-2 rounded-2xl border border-[rgba(255,248,225,0.28)] bg-[rgba(255,250,240,0.1)] px-4 py-3 text-[#f8efda] shadow-[inset_0_1px_0_rgba(255,248,225,0.08)] backdrop-blur-sm">
            <span className="text-lg font-extrabold uppercase tracking-[0.12em] text-[#f6e7c8] sm:text-[1.3rem]">Model</span>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value as GeminiModelOption)}
              disabled={isLoading}
              className="bg-transparent text-sm text-[#fff8ea] focus:outline-none"
            >
              {models.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0d3b39] text-[#fff8ea]">
                  {option.label}
                </option>
                ))}
            </select>
            {!inputError && (
              <span className="text-sm leading-6 text-[rgba(248,239,218,0.86)]">
                {models.find((option) => option.value === model)?.description}
              </span>
            )}
          </label>
            <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2c66d,#d9a441)] px-6 py-3 font-bold text-[#1f2937] shadow-[0_18px_34px_rgba(89,64,18,0.34)] transition-all duration-300 hover:-translate-y-px hover:bg-[linear-gradient(135deg,#f5d27f,#e0af4e)] focus:outline-none focus:ring-2 focus:ring-[rgba(254,240,138,0.55)] focus:ring-offset-2 focus:ring-offset-[#0a3c39] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SearchIcon className="mr-2 h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {inputError ? (
          <p className="px-4 text-sm font-medium text-[#ffe2b8] md:pl-[calc(100%_-_220px)]">
            {inputError}
          </p>
        ) : null}
      </div>
    </form>
  );
};

export default BrandInputForm;
