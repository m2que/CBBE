import React, { useState } from 'react';
import type { CBBEData, CBBEDimensionKey, GeneratedScenario, ScenarioEvaluation, StrategyRevision, UserPrediction } from '../../types';
import CritiqueCard from './CritiqueCard';
import RadarScoreChart from '../RadarScoreChart';

const DIMENSIONS: { key: CBBEDimensionKey; label: string }[] = [
  { key: 'salience', label: 'Salience' },
  { key: 'performance', label: 'Performance' },
  { key: 'imagery', label: 'Imagery' },
  { key: 'judgements', label: 'Judgements' },
  { key: 'feelings', label: 'Feelings' },
  { key: 'resonance', label: 'Resonance' }
];

interface ScenarioComparisonProps {
  baselineAnalysis: CBBEData;
  scenario: GeneratedScenario;
  userPrediction: UserPrediction;
  evaluation: ScenarioEvaluation;
  revisedStrategy: StrategyRevision[];
  finalizedRevisions: StrategyRevision[];
  onRevisionStatusChange: (revisionId: string, status: StrategyRevision['status']) => void;
  onRevisionEdit: (revisionId: string, text: string) => void;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  baselineAnalysis,
  scenario,
  userPrediction,
  evaluation,
  revisedStrategy,
  finalizedRevisions,
  onRevisionStatusChange,
  onRevisionEdit
}) => {
  const [expandedDimension, setExpandedDimension] = useState<CBBEDimensionKey | null>('salience');

  return (
    <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent-5)' } as React.CSSProperties}>
      <p className="brand-microcopy brand-scenario-step-label">Steps 5 and 6</p>
      <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Compare results</h4>

      <div className="brand-stack-16">
        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Scenario summary</p>
          <p className="brand-copy-sm">{evaluation.scenarioSummary}</p>
        </div>

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Baseline, prediction, and AI estimate</p>
          <div className="h-80 md:h-96" style={{ marginTop: '12px' }}>
            <RadarScoreChart data={baselineAnalysis} userPrediction={userPrediction} scenarioEvaluation={evaluation} />
          </div>
        </div>

        <div className="brand-scenario-comparison-grid">
          {DIMENSIONS.map(({ key, label }) => {
            const baselineScore = baselineAnalysis[key].score;
            const userScore = userPrediction.dimensions[key].predictedScore;
            const aiScore = evaluation.dimensions[key].score;
            const isExpanded = expandedDimension === key;

            return (
              <div key={key} className="brand-subtle-card brand-card-pad brand-no-top-stripe">
                <div className="brand-scenario-dimension-header">
                  <div>
                    <p className="brand-field-label">{label}</p>
                    <p className="brand-copy-sm">Baseline {baselineScore} | You {userScore} | AI {aiScore}</p>
                  </div>
                  <button type="button" className="brand-button-light" onClick={() => setExpandedDimension(isExpanded ? null : key)}>
                    {isExpanded ? 'Hide detail' : 'Show detail'}
                  </button>
                </div>
                <div className="brand-scenario-score-row">
                  <span className="brand-scenario-score-chip">Direction: {evaluation.dimensions[key].direction.replaceAll('_', ' ')}</span>
                  <span className="brand-scenario-score-chip">Change: {aiScore - baselineScore >= 0 ? '+' : ''}{aiScore - baselineScore}</span>
                  <span className="brand-scenario-score-chip">Confidence: {evaluation.dimensions[key].confidence}</span>
                </div>
                <p className="brand-copy-sm">{evaluation.dimensions[key].reasoning}</p>

                {isExpanded && (
                  <div className="brand-stack-12" style={{ marginTop: '16px' }}>
                    <div>
                      <p className="brand-field-label">Original analysis</p>
                      <p className="brand-copy-sm">{baselineAnalysis[key].analysis}</p>
                    </div>
                    <div>
                      <p className="brand-field-label">User prediction and reasoning</p>
                      <p className="brand-copy-sm">{userPrediction.dimensions[key].direction.replaceAll('_', ' ')} to {userPrediction.dimensions[key].predictedScore}. {userPrediction.dimensions[key].reasoning || 'No dimension-specific reasoning added.'}</p>
                    </div>
                    <div>
                      <p className="brand-field-label">AI stress test</p>
                      <p className="brand-copy-sm">{evaluation.dimensions[key].reasoning}</p>
                    </div>
                    <div>
                      <p className="brand-field-label">Strategic implication</p>
                      <p className="brand-copy-sm">{evaluation.dimensions[key].strategicImplication}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="brand-scenario-comparison-grid">
          <CritiqueCard title="Well supported" items={evaluation.strongReasoning} />
          <CritiqueCard title="Questionable assumptions" items={evaluation.questionableAssumptions} />
          <CritiqueCard title="Missing considerations" items={evaluation.missingConsiderations} />
          <CritiqueCard title="Recommended revisions" items={evaluation.suggestedStrategyRevisions.map((revision) => revision.text)} />
        </div>

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Recommended revisions</p>
          <div className="brand-stack-16" style={{ marginTop: '12px' }}>
            {revisedStrategy.map((revision) => (
              <div key={revision.id} className="brand-subtle-card brand-card-pad brand-no-top-stripe">
                <textarea
                  className="brand-input brand-scenario-textarea"
                  value={revision.text}
                  onChange={(event) => onRevisionEdit(revision.id, event.target.value)}
                />
                <div className="brand-scenario-actions-row brand-scenario-actions-wrap">
                  <button type="button" className="brand-button-light" onClick={() => onRevisionStatusChange(revision.id, 'accepted')}>Accept</button>
                  <button type="button" className="brand-button-light" onClick={() => onRevisionStatusChange(revision.id, 'rejected')}>Reject</button>
                  <span className="brand-copy-sm">Current status: {revision.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Final revised strategy</p>
          {finalizedRevisions.length > 0 ? (
            <ul className="brand-ref-list" style={{ marginTop: '12px' }}>
              {finalizedRevisions.map((revision) => (
                <li key={revision.id} className="brand-ref-item">
                  <div className="brand-ref-dot"></div>
                  <p className="brand-copy-sm">{revision.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="brand-copy-sm" style={{ marginTop: '12px' }}>No revisions accepted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;
