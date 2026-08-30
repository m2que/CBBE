import React, { useEffect, useMemo, useState } from 'react';
import type { CBBEData, CBBEDimensionKey, ScenarioDirection, UserPrediction } from '../../types';

const DIMENSIONS: { key: CBBEDimensionKey; label: string }[] = [
  { key: 'salience', label: 'Salience' },
  { key: 'performance', label: 'Performance' },
  { key: 'imagery', label: 'Imagery' },
  { key: 'judgements', label: 'Judgements' },
  { key: 'feelings', label: 'Feelings' },
  { key: 'resonance', label: 'Resonance' }
];

const DIMENSION_COLORS: Record<CBBEDimensionKey, string> = {
  salience: 'var(--accent)',
  performance: 'var(--accent-2)',
  imagery: 'var(--accent-2)',
  judgements: 'var(--accent-4)',
  feelings: 'var(--accent-4)',
  resonance: 'var(--accent-5)'
};

const DIRECTION_OPTIONS: { value: ScenarioDirection; label: string }[] = [
  { value: 'decrease', label: 'Decrease' },
  { value: 'no_material_change', label: 'No material change' },
  { value: 'increase', label: 'Increase' }
];

const getDirectionFromScores = (baselineScore: number, predictedScore: number | ''): ScenarioDirection => {
  if (typeof predictedScore !== 'number') return 'no_material_change';
  if (predictedScore > baselineScore) return 'increase';
  if (predictedScore < baselineScore) return 'decrease';
  return 'no_material_change';
};

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

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      ...initialValue,
      selectedManagementDecision,
      managementResponseDetails
    }));
  }, [initialValue, managementResponseDetails, selectedManagementDecision]);

  const isMeaningful = useMemo(() => {
    const dimensionsComplete = DIMENSIONS.every(({ key }) => {
      const item = formState.dimensions[key];
      return typeof item.predictedScore === 'number' && item.predictedScore >= 1 && item.predictedScore <= 100;
    });

    return dimensionsComplete && formState.selectedManagementDecision.trim().length > 0;
  }, [formState]);

  const handleSubmit = () => {
    if (!isMeaningful) {
      setError('Set all six scenario scores before continuing.');
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
        Set the predicted CBBE scores after management takes this response. Baseline scores stay visible for reference.
      </p>
      <div className="brand-subtle-card brand-card-pad brand-no-top-stripe" style={{ marginTop: '14px' }}>
        <p className="brand-field-label">Management response being tested</p>
        <p className="brand-copy-sm brand-scenario-response-context">{selectedManagementDecision}</p>
        {managementResponseDetails ? (
          <>
            <p className="brand-field-label" style={{ marginTop: '12px' }}>Response approach details</p>
            <p className="brand-copy-sm">{managementResponseDetails}</p>
          </>
        ) : null}
      </div>

      <div className="brand-scenario-dimension-grid">
        {DIMENSIONS.map(({ key, label }) => (
          <fieldset key={key} className="brand-subtle-card brand-card-pad brand-no-top-stripe">
            <legend className="brand-field-label">{label}</legend>
            <div className="brand-stack-12">
              <p className="brand-copy-sm">Original score: {baselineAnalysis[key].score}</p>
              <label className="brand-field">
                <span className="brand-field-label">Predicted score</span>
                <input
                  className="brand-scenario-slider"
                  style={{ '--scenario-slider-color': DIMENSION_COLORS[key] } as React.CSSProperties}
                  disabled={isSubmitted}
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={formState.dimensions[key].predictedScore === '' ? baselineAnalysis[key].score : formState.dimensions[key].predictedScore}
                  onChange={(event) => setFormState((current) => ({
                    ...current,
                    dimensions: {
                      ...current.dimensions,
                      [key]: {
                        ...current.dimensions[key],
                        predictedScore: Number(event.target.value),
                        direction: getDirectionFromScores(baselineAnalysis[key].score, Number(event.target.value))
                      }
                    }
                  }))}
                />
                <div className="brand-scenario-slider-scale" aria-hidden="true">
                  <span>1</span>
                  <span>{formState.dimensions[key].predictedScore === '' ? baselineAnalysis[key].score : formState.dimensions[key].predictedScore}</span>
                  <span>100</span>
                </div>
              </label>
              <p className="brand-copy-sm">Direction: {DIRECTION_OPTIONS.find((option) => option.value === formState.dimensions[key].direction)?.label}</p>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="brand-scenario-form-grid">
        <label className="brand-field brand-scenario-form-span-full">
          <span className="brand-field-label">Explain your reasoning</span>
          <span className="brand-help">Adding more detail improves the quality of the resulting critique and scenario comparison.</span>
          <textarea
            className="brand-input brand-scenario-textarea"
            disabled={isSubmitted}
            maxLength={320}
            placeholder="Explain the key assumptions behind the six score changes."
            value={formState.overallReasoning}
            onChange={(event) => setFormState((current) => ({ ...current, overallReasoning: event.target.value.slice(0, 320) }))}
          />
          <span className="brand-help">{formState.overallReasoning.length}/320</span>
        </label>
      </div>

      {error ? <p className="brand-error-text">{error}</p> : null}
      {!isSubmitted && (
        <div className="brand-scenario-actions-row">
          <button type="button" className="brand-button-light brand-scenario-primary-action" onClick={handleSubmit}>Continue to results</button>
        </div>
      )}
    </div>
  );
};

export default CBBEPredictionForm;
