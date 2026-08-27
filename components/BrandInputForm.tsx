
import React, { useState } from 'react';
import type { GeminiModelOption } from '../types';
import BrandIcon from './BrandIcon';

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
    <form id="brand-input" onSubmit={(e) => e.preventDefault()} className="brand-panel brand-panel-strong brand-input-shell brand-stack-16">
      <div className="brand-stack-16">
        <div className="brand-section-title">
          <div className="brand-icon-circle" aria-hidden="true" style={{ flexShrink: 0 }}>
            <BrandIcon name="icon-cbbe" style={{ width: '32px', height: '32px', display: 'block' }} />
          </div>
          <div>
            <p className="brand-microcopy">CBBE Input</p>
            <p className="brand-copy-sm">Select a brand and get its CBBE scores and dashboard.</p>
            <p className="brand-copy-sm">Each score reflects the strength of a CBBE dimension from 1-100 and the corresponding cards explain how scores are estimated.</p>
          </div>
        </div>
        <div className="brand-form-grid">
          <label className="brand-field">
            <span className="brand-field-label">Brand Name</span>
              <textarea
                type="text"
                value={brandName}
                onChange={(e) => {
                 setBrandName(e.target.value.slice(0, 200));
                 setInputError(null);
               }}
               maxLength={200}
               placeholder="Enter a brand name (e.g., Nike, Apple, Coca-Cola)"
                className="brand-input brand-input-strong brand-input-textarea"
                disabled={isLoading}
              />
          </label>
          <label className="brand-select-field">
            <span className="brand-field-label">Model</span>
            <div className="brand-select-wrap">
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value as GeminiModelOption)}
                disabled={isLoading}
                className="brand-select brand-input-strong"
              >
                {models.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                  ))}
              </select>
              <svg className="brand-select-icon" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {!inputError && (
              <span className="brand-help">
                {models.find((option) => option.value === model)?.description}
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="brand-button brand-button-light"
          >
            <BrandIcon name="icon-marketlearn" className="brand-inline-icon h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {inputError ? (
          <p className="brand-error-text">
            {inputError}
          </p>
        ) : null}
      </div>
    </form>
  );
};

export default BrandInputForm;
