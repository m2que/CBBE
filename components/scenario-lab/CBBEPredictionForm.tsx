import React, { useMemo, useState } from 'react';
import type { CBBEData, CBBEDimensionKey, ScenarioDirection, UserPrediction } from '../../types';

const DIMENSIONS: { key: CBBEDimensionKey; label: string }[] = [
  { key: 'salience', label: 'Salience' },
  { key: 'performance', label: 'Performance' },
  { key: 'imagery', label: 'Imagery' },
  { key: 'judgements', label: 'Judgements' },
  { key: 'feelings', label: 'Feelings' },
  { key: 'resonance', label: 'Resonance' }
];

const DIRECTION_OPTIONS: { value: ScenarioDirection; label: string }[] = [
  { value: 'decrease', label: 'Decrease' },
  { value: 'no_material_change', label: 'No material change' },
  { value: 'increase', label: 'Increase' }
];

interface CBBEPredictionFormProps {
  baselineAnalysis: CBBEData;
  selectedManagementDecision: string;
  managementResponseDetails?: string;
  initialValue: UserPrediction;
  onSubmit: (value: UserPrediction) => void;
  isSubmitted: boolean;
}

const CBBEPredictionForm: React.FC<CBBEPredictionFormProps> = ({ baselineAnalysis, selectedManagementDecision, managementResponseDetails, initialValue, onSubmit, isSubmitted }) => {
  const [formState, setFormState] = useState<UserPrediction>(initialValue);
  const [error, setError] = useState<string | null>(null);

  const isMeaningful = useMemo(() => {
    const dimensionsComplete = DIMENSIONS.every(({ key }) => {
      const item = formState.dimensions[key];
      return typeof item.predictedScore === 'number' && item.predictedScore >= 1 && item.predictedScore <= 100;
    });

    return dimensionsComplete
      && formState.selectedManagementDecision.trim().length > 0
      && formState.greatestRisk.trim().length >= 20
      && formState.greatestOpportunity.trim().length >= 20
      && formState.likelyStable.trim().length >= 20
      && formState.overallReasoning.trim().length >= 40;
  }, [formState]);

  const handleSubmit = () => {
    if (!isMeaningful) {
      setError('Complete all six predictions and add meaningful reasoning before continuing.');
      return;
    }

    setError(null);
    onSubmit(formState);
  };

  return (
    <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent-4)' } as React.CSSProperties}>
      <p className="brand-microcopy brand-scenario-step-label">Step 3</p>
      <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Predict the impact</h4>
      <p className="brand-copy-sm" style={{ marginTop: '8px' }}>
        Submit your own view before AI feedback. The baseline scores remain fixed and visible for comparison.
      </p>
      <p className="brand-copy-sm">
        Management response being tested: {selectedManagementDecision}
      </p>
      {managementResponseDetails ? (
        <p className="brand-copy-sm">
          Response approach details: {managementResponseDetails}
        </p>
      ) : null}

      <div className="brand-scenario-dimension-grid">
        {DIMENSIONS.map(({ key, label }) => (
          <fieldset key={key} className="brand-subtle-card brand-card-pad brand-no-top-stripe">
            <legend className="brand-field-label">{label}</legend>
            <p className="brand-copy-sm">Baseline score: {baselineAnalysis[key].score}</p>
            <label className="brand-field">
              <span className="brand-field-label">Predicted direction</span>
              <select
                className="brand-select"
                disabled={isSubmitted}
                value={formState.dimensions[key].direction}
                onChange={(event) => setFormState((current) => ({
                  ...current,
                  dimensions: {
                    ...current.dimensions,
                    [key]: { ...current.dimensions[key], direction: event.target.value as ScenarioDirection }
                  }
                }))}
              >
                {DIRECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="brand-field">
              <span className="brand-field-label">Predicted scenario score</span>
              <input
                className="brand-input"
                disabled={isSubmitted}
                type="number"
                min={1}
                max={100}
                value={formState.dimensions[key].predictedScore}
                onChange={(event) => setFormState((current) => ({
                  ...current,
                  dimensions: {
                    ...current.dimensions,
                    [key]: {
                      ...current.dimensions[key],
                      predictedScore: event.target.value ? Number(event.target.value) : ''
                    }
                  }
                }))}
              />
            </label>
            <label className="brand-field">
              <span className="brand-field-label">Optional reasoning</span>
              <textarea
                className="brand-input brand-scenario-textarea"
                disabled={isSubmitted}
                maxLength={240}
                value={formState.dimensions[key].reasoning}
                onChange={(event) => setFormState((current) => ({
                  ...current,
                  dimensions: {
                    ...current.dimensions,
                    [key]: {
                      ...current.dimensions[key],
                      reasoning: event.target.value.slice(0, 240)
                    }
                  }
                }))}
              />
            </label>
          </fieldset>
        ))}
      </div>

      <div className="brand-scenario-form-grid">
        <label className="brand-field brand-scenario-form-span-full">
          <span className="brand-field-label">Greatest risk to brand equity</span>
          <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={300} value={formState.greatestRisk} onChange={(event) => setFormState((current) => ({ ...current, greatestRisk: event.target.value.slice(0, 300) }))} />
        </label>
        <label className="brand-field brand-scenario-form-span-full">
          <span className="brand-field-label">Greatest opportunity</span>
          <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={300} value={formState.greatestOpportunity} onChange={(event) => setFormState((current) => ({ ...current, greatestOpportunity: event.target.value.slice(0, 300) }))} />
        </label>
        <label className="brand-field brand-scenario-form-span-full">
          <span className="brand-field-label">What is likely to remain stable?</span>
          <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={300} value={formState.likelyStable} onChange={(event) => setFormState((current) => ({ ...current, likelyStable: event.target.value.slice(0, 300) }))} />
        </label>
        <label className="brand-field brand-scenario-form-span-full">
          <span className="brand-field-label">Overall reasoning</span>
          <textarea className="brand-input brand-scenario-textarea-lg" disabled={isSubmitted} maxLength={600} value={formState.overallReasoning} onChange={(event) => setFormState((current) => ({ ...current, overallReasoning: event.target.value.slice(0, 600) }))} />
        </label>
      </div>

      {error ? <p className="brand-error-text">{error}</p> : null}
      {!isSubmitted && (
        <div className="brand-scenario-actions-row">
          <button type="button" className="brand-button-light" onClick={handleSubmit}>Continue to strategy</button>
        </div>
      )}
    </div>
  );
};

export default CBBEPredictionForm;
