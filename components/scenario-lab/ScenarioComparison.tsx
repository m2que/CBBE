import React, { useState } from 'react';
import type { CBBEData, CBBEDimensionKey, GeneratedScenario, ScenarioEvaluation, UserPrediction } from '../../types';
import CritiqueCard from './CritiqueCard';
import RadarScoreChart from '../RadarScoreChart';
import FormattedText from '../FormattedText';

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
  revisedStrategy: { id: string; text: string }[];
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  baselineAnalysis,
  scenario,
  userPrediction,
  evaluation,
  revisedStrategy
}) => {
  const [expandedDimension, setExpandedDimension] = useState<CBBEDimensionKey | null>('salience');
  const dimensionDifferences = DIMENSIONS.map(({ key }) => {
    const userScore = userPrediction.dimensions[key].predictedScore;
    const aiScore = evaluation.dimensions[key].score;
    return typeof userScore === 'number' ? Math.abs(userScore - aiScore) : 100;
  });
  const totalDifference = dimensionDifferences.reduce((sum, value) => sum + value, 0);
  const averageDifference = totalDifference / DIMENSIONS.length;
  const accuracyScore = Math.max(0, 100 - Math.round(averageDifference));

  return (
    <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent-5)' } as React.CSSProperties}>
      <p className="brand-microcopy brand-scenario-step-label">Step 4</p>
      <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Scenario results dashboard</h4>

      <div className="brand-stack-16">
        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Scenario summary</p>
          <p className="brand-copy-sm"><FormattedText text={evaluation.scenarioSummary} /></p>
        </div>

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Management response tested</p>
          <p className="brand-copy-sm brand-scenario-response-context"><FormattedText text={userPrediction.selectedManagementDecision} /></p>
          {userPrediction.managementResponseDetails ? (
            <p className="brand-copy-sm" style={{ marginTop: '10px' }}><FormattedText text={userPrediction.managementResponseDetails} /></p>
          ) : null}
        </div>

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Updated score dashboard</p>
          <div className="h-80 md:h-96" style={{ marginTop: '12px' }}>
            <RadarScoreChart data={baselineAnalysis} userPrediction={userPrediction} scenarioEvaluation={evaluation} />
          </div>
        </div>

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Prediction accuracy score</p>
          <p className="brand-heading" style={{ fontSize: '2rem' }}>{accuracyScore}/100</p>
          <p className="brand-copy-sm" style={{ marginTop: '8px' }}>
            This is `100 -` the average absolute difference between your predicted scores and the AI-estimated scores across all six CBBE dimensions.
          </p>
          <div style={{ overflowX: 'auto', marginTop: '14px' }}>
            <table className="brand-scenario-score-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Original</th>
                  <th>Your prediction</th>
                  <th>AI prediction</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map(({ key, label }) => {
                  const baselineScore = baselineAnalysis[key].score;
                  const userScore = userPrediction.dimensions[key].predictedScore;
                  const aiScore = evaluation.dimensions[key].score;
                  const difference = typeof userScore === 'number' ? aiScore - userScore : aiScore;

                  return (
                    <tr key={`accuracy-${key}`}>
                      <td>{label}</td>
                      <td>{baselineScore}</td>
                      <td>{userScore}</td>
                      <td>{aiScore}</td>
                      <td>{difference >= 0 ? `+${difference}` : difference}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                <p className="brand-copy-sm"><FormattedText text={evaluation.dimensions[key].reasoning} /></p>

                {isExpanded && (
                  <div className="brand-stack-12" style={{ marginTop: '16px' }}>
                    <div>
                      <p className="brand-field-label">Original analysis</p>
                      <p className="brand-copy-sm"><FormattedText text={baselineAnalysis[key].analysis} /></p>
                    </div>
                    <div>
                      <p className="brand-field-label">Your prediction</p>
                      <p className="brand-copy-sm">Your predicted direction of {userPrediction.dimensions[key].direction.replaceAll('_', ' ')} to {userPrediction.dimensions[key].predictedScore}.</p>
                    </div>
                    <div>
                      <p className="brand-field-label">AI stress test</p>
                      <p className="brand-copy-sm"><FormattedText text={evaluation.dimensions[key].reasoning} /></p>
                    </div>
                    <div>
                      <p className="brand-field-label">Strategic implication</p>
                      <p className="brand-copy-sm"><FormattedText text={evaluation.dimensions[key].strategicImplication} /></p>
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
        </div>

        {userPrediction.overallReasoning ? (
          <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
            <p className="brand-field-label">Your reasoning note</p>
            <p className="brand-copy-sm"><FormattedText text={userPrediction.overallReasoning} /></p>
          </div>
        ) : null}

        <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
          <p className="brand-field-label">Recommended revisions</p>
          <ul className="brand-ref-list" style={{ marginTop: '12px' }}>
            {revisedStrategy.map((revision) => (
              <li key={revision.id} className="brand-ref-item">
                <div className="brand-ref-dot"></div>
                <p className="brand-copy-sm"><FormattedText text={revision.text} /></p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;
