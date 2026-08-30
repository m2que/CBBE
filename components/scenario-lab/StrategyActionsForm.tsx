import React, { useState } from 'react';
import type { StrategyAction } from '../../types';

interface StrategyActionsFormProps {
  initialValue: StrategyAction[];
  onSubmit: (value: StrategyAction[]) => void;
  isSubmitted: boolean;
}

const createAction = (index: number): StrategyAction => ({
  id: `action-${index + 1}`,
  action: '',
  reason: '',
  expectedEffect: '',
  riskTradeOff: ''
});

const StrategyActionsForm: React.FC<StrategyActionsFormProps> = ({ initialValue, onSubmit, isSubmitted }) => {
  const [actions, setActions] = useState<StrategyAction[]>(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, field: keyof Omit<StrategyAction, 'id'>, value: string) => {
    setActions((current) => current.map((action) => action.id === id ? { ...action, [field]: value } : action));
  };

  const handleAddAction = () => {
    if (actions.length >= 3) return;
    setActions((current) => [...current, createAction(current.length)]);
  };

  const handleRemoveAction = (id: string) => {
    if (actions.length <= 1) return;
    setActions((current) => current.filter((action) => action.id !== id));
  };

  const handleSubmit = () => {
    const completedActions = actions.filter((action) => action.action.trim());

    if (completedActions.length < 1 || completedActions.length > 3) {
      setError('Add between one and three proposed strategic actions.');
      return;
    }

    const hasIncompleteAction = completedActions.some((action) => [action.reason, action.expectedEffect, action.riskTradeOff].some((field) => field.trim().length < 12));

    if (hasIncompleteAction) {
      setError('Each action needs a reason, expected effect, and risk or trade-off.');
      return;
    }

    setError(null);
    onSubmit(completedActions);
  };

  return (
    <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent-3)' } as React.CSSProperties}>
      <p className="brand-microcopy brand-scenario-step-label">Step 4</p>
      <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Define supporting actions</h4>
      <p className="brand-copy-sm" style={{ marginTop: '8px' }}>
        Turn the selected management response into one to three concrete execution actions before viewing the AI critique.
      </p>

      <div className="brand-stack-16">
        {actions.map((action, index) => (
          <div key={action.id} className="brand-subtle-card brand-card-pad brand-no-top-stripe">
            <div className="brand-scenario-action-card-header">
              <p className="brand-field-label">Action {index + 1}</p>
              {!isSubmitted && actions.length > 1 && (
                <button type="button" className="brand-button-light" onClick={() => handleRemoveAction(action.id)}>Remove</button>
              )}
            </div>
            <div className="brand-scenario-form-grid">
              <label className="brand-field brand-scenario-form-span-full">
                <span className="brand-field-label">Proposed action</span>
                <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={220} value={action.action} onChange={(event) => handleChange(action.id, 'action', event.target.value.slice(0, 220))} />
              </label>
              <label className="brand-field">
                <span className="brand-field-label">Reason</span>
                <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={220} value={action.reason} onChange={(event) => handleChange(action.id, 'reason', event.target.value.slice(0, 220))} />
              </label>
              <label className="brand-field">
                <span className="brand-field-label">Expected effect</span>
                <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={220} value={action.expectedEffect} onChange={(event) => handleChange(action.id, 'expectedEffect', event.target.value.slice(0, 220))} />
              </label>
              <label className="brand-field brand-scenario-form-span-full">
                <span className="brand-field-label">Risk or trade-off</span>
                <textarea className="brand-input brand-scenario-textarea" disabled={isSubmitted} maxLength={220} value={action.riskTradeOff} onChange={(event) => handleChange(action.id, 'riskTradeOff', event.target.value.slice(0, 220))} />
              </label>
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="brand-error-text">{error}</p> : null}

      {!isSubmitted && (
        <div className="brand-scenario-actions-row brand-scenario-actions-wrap">
          {actions.length < 3 && <button type="button" className="brand-button-light" onClick={handleAddAction}>Add action</button>}
          <button type="button" className="brand-button-light" onClick={handleSubmit}>Save strategy actions</button>
        </div>
      )}
    </div>
  );
};

export default StrategyActionsForm;
