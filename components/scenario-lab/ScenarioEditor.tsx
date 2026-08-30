import React from 'react';
import type { CBBEData, GeneratedScenario, ScenarioInput } from '../../types';

interface ScenarioEditorProps {
  baselineAnalysis: CBBEData;
  scenarioInput: ScenarioInput;
  scenario: GeneratedScenario;
  selectedManagementDecision: string;
  managementResponseDetails: string;
  onScenarioChange: (scenario: GeneratedScenario) => void;
  onManagementDecisionChange: (value: string) => void;
  onManagementResponseDetailsChange: (value: string) => void;
  onApply: () => void;
}

const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  baselineAnalysis,
  scenarioInput,
  scenario,
  selectedManagementDecision,
  managementResponseDetails,
  onScenarioChange,
  onManagementDecisionChange,
  onManagementResponseDetailsChange,
  onApply
}) => {
  const hasSelectedResponse = selectedManagementDecision.trim().length > 0;

  return (
    <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent-2)' } as React.CSSProperties}>
      <p className="brand-microcopy brand-scenario-step-label">Step 2</p>
      <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Review event</h4>
      <p className="brand-copy-sm" style={{ marginTop: '8px' }}>
        Hypothetical scenario built from analysis for {baselineAnalysis.brandName}. Review this scenario, and then continue to predict how it would change the six CBBE dimensions.
      </p>

      <div className="brand-stack-16">
        <label className="brand-field">
          <span className="brand-field-label">Scenario headline</span>
          <input
            className="brand-input"
            value={scenario.headline}
            maxLength={140}
            onChange={(event) => onScenarioChange({ ...scenario, headline: event.target.value.slice(0, 140) })}
          />
        </label>

        <label className="brand-field">
          <span className="brand-field-label">Scenario narrative</span>
          <textarea
            className="brand-input brand-scenario-textarea-lg"
            value={scenario.narrative}
            maxLength={700}
            onChange={(event) => onScenarioChange({ ...scenario, narrative: event.target.value.slice(0, 700) })}
          />
          <span className="brand-help">{scenario.narrative.length}/700</span>
        </label>

        <div className="brand-scenario-detail-grid">
          <label className="brand-field">
            <span className="brand-field-label">Trigger</span>
            <textarea className="brand-input brand-scenario-textarea" value={scenario.trigger} maxLength={180} onChange={(event) => onScenarioChange({ ...scenario, trigger: event.target.value.slice(0, 180) })} />
          </label>
          <label className="brand-field">
            <span className="brand-field-label">Brand contradiction</span>
            <textarea className="brand-input brand-scenario-textarea" value={scenario.brandContradiction} maxLength={160} onChange={(event) => onScenarioChange({ ...scenario, brandContradiction: event.target.value.slice(0, 160) })} />
          </label>
          <label className="brand-field">
            <span className="brand-field-label">Amplification</span>
            <textarea className="brand-input brand-scenario-textarea" value={scenario.amplification} maxLength={160} onChange={(event) => onScenarioChange({ ...scenario, amplification: event.target.value.slice(0, 160) })} />
          </label>
          <label className="brand-field">
            <span className="brand-field-label">Important uncertainty</span>
            <textarea className="brand-input brand-scenario-textarea" value={scenario.importantUncertainty} maxLength={160} onChange={(event) => onScenarioChange({ ...scenario, importantUncertainty: event.target.value.slice(0, 160) })} />
          </label>
          <label className="brand-field brand-scenario-form-span-full">
            <span className="brand-field-label">Management decision</span>
            <span className="brand-help">{scenario.managementDecisionPrompt}</span>
            <div className="brand-scenario-response-list" role="radiogroup" aria-label="Select a response">
              {(scenario.managementOptions || []).map((option) => {
                const isSelected = selectedManagementDecision === option;

                return (
                  <button
                    key={option}
                    type="button"
                    className={`brand-scenario-response-option${isSelected ? ' brand-scenario-response-option-selected' : ''}`}
                    role="radio"
                      aria-checked={isSelected}
                      aria-label={option}
                      onClick={() => onManagementDecisionChange(option)}
                    >
                      <span className="brand-scenario-response-indicator" aria-hidden="true"></span>
                      <span className="brand-copy-sm brand-scenario-response-copy">{option}</span>
                    </button>
                );
              })}
            </div>
            {!hasSelectedResponse ? <p className="brand-error-text">Select one management response before continuing.</p> : null}
          </label>
          <label className="brand-field brand-scenario-form-span-full">
            <span className="brand-field-label">Response approach details</span>
            <span className="brand-help">Adding more detail improves the quality of the resulting critique and scenario comparison.</span>
            <textarea
              className="brand-input brand-scenario-textarea"
              value={managementResponseDetails}
              maxLength={260}
              placeholder="Example: Explain timing, communication steps, operational actions, and the trade-offs management is accepting."
              onChange={(event) => onManagementResponseDetailsChange(event.target.value.slice(0, 260))}
            />
            <span className="brand-help">{managementResponseDetails.length}/260</span>
          </label>
        </div>
      </div>

      <div className="brand-scenario-actions-row brand-scenario-actions-row-right">
        <button type="button" className="brand-button-light brand-scenario-primary-action" onClick={onApply} disabled={!hasSelectedResponse}>Continue to prediction</button>
      </div>
    </div>
  );
};

export default ScenarioEditor;
