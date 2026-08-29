import React, { useState } from 'react';
import type { ScenarioInput, ScenarioSeverity, ScenarioTimeHorizon, ScenarioType } from '../../types';

const SCENARIO_OPTIONS: { value: ScenarioType; label: string }[] = [
  { value: 'product_or_service_failure', label: 'Product or service failure' },
  { value: 'product_recall_or_safety_incident', label: 'Product recall or safety incident' },
  { value: 'brand_scandal', label: 'Brand scandal' },
  { value: 'misleading_claim_or_greenwashing_accusation', label: 'Misleading claim or greenwashing accusation' },
  { value: 'data_or_privacy_breach', label: 'Data or privacy breach' },
  { value: 'viral_customer_complaint', label: 'Viral customer complaint' },
  { value: 'new_disruptive_competitor', label: 'New disruptive competitor' },
  { value: 'cultural_or_consumer_trend_shift', label: 'Cultural or consumer trend shift' },
  { value: 'rebranding_or_identity_change', label: 'Rebranding or identity change' },
  { value: 'price_increase_or_perceived_value_deterioration', label: 'Price increase or perceived-value deterioration' },
  { value: 'custom_scenario', label: 'Custom scenario' }
];

const SEVERITY_OPTIONS: { value: ScenarioSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const TIME_OPTIONS: { value: ScenarioTimeHorizon; label: string }[] = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'six_months', label: 'Six months' },
  { value: 'one_to_two_years', label: 'One to two years' }
];

interface ScenarioSelectorProps {
  value: ScenarioInput;
  onCreateScenario: (value: ScenarioInput) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ value, onCreateScenario }) => {
  const [formState, setFormState] = useState<ScenarioInput>(value);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (formState.scenarioType === 'custom_scenario' && !formState.customScenarioLabel?.trim()) {
      setError('Enter a custom scenario label to continue.');
      return;
    }

    setError(null);
    onCreateScenario(formState);
  };

  return (
    <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent)' } as React.CSSProperties}>
      <p className="brand-microcopy brand-scenario-step-label">Step 1</p>
      <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Choose scenario</h4>
      <div className="brand-scenario-form-grid" style={{ marginTop: '16px' }}>
        <label className="brand-field">
          <span className="brand-field-label">Scenario type</span>
          <select
            className="brand-select"
            value={formState.scenarioType}
            onChange={(event) => setFormState((current) => ({ ...current, scenarioType: event.target.value as ScenarioType }))}
          >
            {SCENARIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        {formState.scenarioType === 'custom_scenario' && (
          <label className="brand-field">
            <span className="brand-field-label">Custom scenario</span>
            <input
              className="brand-input"
              value={formState.customScenarioLabel || ''}
              maxLength={80}
              onChange={(event) => setFormState((current) => ({ ...current, customScenarioLabel: event.target.value.slice(0, 80) }))}
            />
          </label>
        )}

        <label className="brand-field">
          <span className="brand-field-label">Severity</span>
          <select
            className="brand-select"
            value={formState.severity}
            onChange={(event) => setFormState((current) => ({ ...current, severity: event.target.value as ScenarioSeverity }))}
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="brand-field">
          <span className="brand-field-label">Time horizon</span>
          <select
            className="brand-select"
            value={formState.timeHorizon}
            onChange={(event) => setFormState((current) => ({ ...current, timeHorizon: event.target.value as ScenarioTimeHorizon }))}
          >
            {TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

      </div>
      {error ? <p className="brand-error-text">{error}</p> : null}
      <div className="brand-scenario-actions-row">
        <button type="button" className="brand-button-light" onClick={handleSubmit}>Create a scenario</button>
      </div>
    </div>
  );
};

export default ScenarioSelector;
