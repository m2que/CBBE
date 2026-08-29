import React, { useEffect, useMemo, useState } from 'react';
import type {
  CBBEData,
  GeneratedScenario,
  ScenarioInput,
  ScenarioSession,
  StrategyAction,
  StrategyRevision,
  UserPrediction
} from '../../types';
import { evaluateScenario, generateScenario } from '../../services/geminiService';
import ErrorDisplay from '../ErrorDisplay';
import LoadingIndicator from '../LoadingIndicator';
import { sanitizeGeneratedScenario, syncAcceptedRevisions } from '../../lib/cbbeScenario';
import ScenarioSelector from './ScenarioSelector';
import ScenarioEditor from './ScenarioEditor';
import CBBEPredictionForm from './CBBEPredictionForm';
import StrategyActionsForm from './StrategyActionsForm';
import ScenarioComparison from './ScenarioComparison';

const STORAGE_VERSION = 'v1';

const defaultScenarioInput: ScenarioInput = {
  scenarioType: 'product_or_service_failure',
  severity: 'medium',
  timeHorizon: 'immediate',
  affectedSegment: '',
  additionalContext: ''
};

const createDefaultPrediction = (): UserPrediction => ({
  selectedManagementDecision: '',
  managementResponseDetails: '',
  dimensions: {
    salience: { direction: 'decrease', predictedScore: '', reasoning: '' },
    performance: { direction: 'decrease', predictedScore: '', reasoning: '' },
    imagery: { direction: 'decrease', predictedScore: '', reasoning: '' },
    judgements: { direction: 'decrease', predictedScore: '', reasoning: '' },
    feelings: { direction: 'decrease', predictedScore: '', reasoning: '' },
    resonance: { direction: 'decrease', predictedScore: '', reasoning: '' }
  },
  greatestRisk: '',
  greatestOpportunity: '',
  likelyStable: '',
  overallReasoning: ''
});

const createDefaultActions = (): StrategyAction[] => [
  { id: 'action-1', action: '', reason: '', expectedEffect: '', riskTradeOff: '' }
];

const buildSessionId = (): string => {
  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const buildStorageKey = (brandName: string, sessionId: string): string => {
  const safeBrand = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `marketlearn:cbbe-scenario:${STORAGE_VERSION}:${safeBrand}:${sessionId}`;
};

const getStartingStep = (session: ScenarioSession): number => {
  if (session.scenarioEvaluation) return 6;
  if (session.strategyActions?.length) return 5;
  if (session.userPrediction) return 4;
  if (session.generatedScenario) return 3;
  return 1;
};

const loadStoredSession = (baselineAnalysis: CBBEData): ScenarioSession | null => {
  if (typeof window === 'undefined') return null;

  const prefix = `marketlearn:cbbe-scenario:${STORAGE_VERSION}:${baselineAnalysis.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:`;
  const matchingKeys: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && key.startsWith(prefix)) {
      matchingKeys.push(key);
    }
  }

  const latestKey = matchingKeys.sort().pop();
  if (!latestKey) return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(latestKey) || 'null') as { session?: ScenarioSession } | null;
    if (!parsed?.session) return null;

    const normalizedGeneratedScenario = parsed.session.generatedScenario
      ? sanitizeGeneratedScenario(parsed.session.generatedScenario, baselineAnalysis.brandName)
      : undefined;

    const normalizedUserPrediction = parsed.session.userPrediction
      ? {
          ...createDefaultPrediction(),
          ...parsed.session.userPrediction,
          selectedManagementDecision: typeof parsed.session.userPrediction.selectedManagementDecision === 'string'
            ? parsed.session.userPrediction.selectedManagementDecision
            : ''
        }
      : undefined;

    return {
      ...parsed.session,
      baselineAnalysis,
      generatedScenario: normalizedGeneratedScenario,
      userPrediction: normalizedUserPrediction,
      finalRevisedStrategy: parsed.session.finalRevisedStrategy || []
    };
  } catch {
    window.localStorage.removeItem(latestKey);
    return null;
  }
};

interface ScenarioLabProps {
  baselineAnalysis: CBBEData;
}

const ScenarioLab: React.FC<ScenarioLabProps> = ({ baselineAnalysis }) => {
  const [session, setSession] = useState<ScenarioSession>(() => loadStoredSession(baselineAnalysis) || {
    sessionId: buildSessionId(),
    baselineAnalysis,
    scenarioInput: defaultScenarioInput
  });
  const [currentStep, setCurrentStep] = useState<number>(() => getStartingStep(loadStoredSession(baselineAnalysis) || {
    sessionId: buildSessionId(),
    baselineAnalysis,
    scenarioInput: defaultScenarioInput
  }));
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);
  const [isEvaluatingScenario, setIsEvaluatingScenario] = useState<boolean>(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const stepLabels = useMemo(() => [
    'Choose scenario',
    'Review and customize event',
    'Predict the impact',
    'Amend the strategy',
    'Run AI stress test',
    'Compare results'
  ], []);

  const stepColors = useMemo(() => [
    'var(--accent)',
    'var(--accent-2)',
    'var(--accent-4)',
    'var(--accent-3)',
    'var(--accent-5)',
    'var(--accent-6)'
  ], []);

  useEffect(() => {
    setSession((current) => ({ ...current, baselineAnalysis }));
  }, [baselineAnalysis]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = buildStorageKey(baselineAnalysis.brandName, session.sessionId);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ session }));
    } catch {
      // Ignore storage write failures for MVP resilience.
    }
  }, [baselineAnalysis.brandName, session]);

  const handleCreateScenario = async (scenarioInput: ScenarioInput) => {
    setIsGeneratingScenario(true);
    setScenarioError(null);

    try {
      const generatedScenario = await generateScenario(baselineAnalysis.brandName, baselineAnalysis, scenarioInput);
      setSession({
        sessionId: buildSessionId(),
        baselineAnalysis,
        scenarioInput,
        generatedScenario,
        finalRevisedStrategy: []
      });
      setCurrentStep(2);
    } catch {
      setScenarioError('We could not create a scenario right now. Please try again.');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleScenarioChange = (generatedScenario: GeneratedScenario) => {
    setSession((current) => ({ ...current, generatedScenario }));
  };

  const handleManagementDecisionChange = (selectedManagementDecision: string) => {
    setSession((current) => ({
      ...current,
      userPrediction: current.userPrediction
        ? { ...current.userPrediction, selectedManagementDecision }
        : { ...createDefaultPrediction(), selectedManagementDecision }
    }));
  };

  const handleManagementResponseDetailsChange = (managementResponseDetails: string) => {
    setSession((current) => ({
      ...current,
      userPrediction: current.userPrediction
        ? { ...current.userPrediction, managementResponseDetails }
        : { ...createDefaultPrediction(), managementResponseDetails }
    }));
  };

  const handleApplyScenario = () => {
    setSession((current) => ({
      ...current,
      userPrediction: current.userPrediction || {
        ...createDefaultPrediction(),
        selectedManagementDecision: current.generatedScenario?.managementOptions?.[0] || ''
      },
      scenarioEvaluation: undefined,
      finalRevisedStrategy: current.finalRevisedStrategy || []
    }));
    setCurrentStep(3);
  };

  const handlePredictionSubmit = (userPrediction: UserPrediction) => {
    setSession((current) => ({
      ...current,
      userPrediction,
      strategyActions: current.strategyActions || createDefaultActions(),
      scenarioEvaluation: undefined,
      finalRevisedStrategy: current.finalRevisedStrategy || []
    }));
    setCurrentStep(4);
  };

  const handleStrategySubmit = (strategyActions: StrategyAction[]) => {
    setSession((current) => ({
      ...current,
      strategyActions,
      scenarioEvaluation: undefined
    }));
    setCurrentStep(5);
  };

  const handleRunStressTest = async () => {
    if (!session.generatedScenario || !session.userPrediction || !session.strategyActions) return;

    setIsEvaluatingScenario(true);
    setScenarioError(null);

    try {
      const scenarioEvaluation = await evaluateScenario(
        baselineAnalysis.brandName,
        baselineAnalysis,
        session.scenarioInput,
        session.generatedScenario,
        session.userPrediction,
        session.strategyActions
      );

      setSession((current) => ({
        ...current,
        scenarioEvaluation,
        finalRevisedStrategy: current.finalRevisedStrategy?.length ? current.finalRevisedStrategy : scenarioEvaluation.suggestedStrategyRevisions
      }));
      setCurrentStep(6);
    } catch {
      setScenarioError('We could not complete the AI stress test right now. Please try again.');
    } finally {
      setIsEvaluatingScenario(false);
    }
  };

  const handleRevisionStatusChange = (revisionId: string, status: StrategyRevision['status']) => {
    setSession((current) => {
      const revisions = (current.finalRevisedStrategy || []).map((revision) => revision.id === revisionId ? { ...revision, status } : revision);
      return {
        ...current,
        finalRevisedStrategy: revisions
      };
    });
  };

  const handleRevisionEdit = (revisionId: string, text: string) => {
    setSession((current) => {
      const revisions = (current.finalRevisedStrategy || []).map((revision) => revision.id === revisionId ? { ...revision, text, status: 'edited' } : revision);
      return {
        ...current,
        finalRevisedStrategy: revisions
      };
    });
  };

  const handleResetScenario = () => {
    if (typeof window !== 'undefined') {
      const storageKey = buildStorageKey(baselineAnalysis.brandName, session.sessionId);
      window.localStorage.removeItem(storageKey);
    }

    setSession({
      sessionId: buildSessionId(),
      baselineAnalysis,
      scenarioInput: defaultScenarioInput
    });
    setCurrentStep(1);
    setScenarioError(null);
  };

  const finalizedRevisions = syncAcceptedRevisions(session.finalRevisedStrategy || []);

  return (
    <section className="brand-card brand-card-pad brand-scenario-lab" aria-labelledby="scenario-lab-title">
      <div className="brand-scenario-header">
        <div className="brand-section-title" style={{ marginBottom: 0 }}>
          <div>
            <p className="brand-microcopy">Scenario Lab</p>
            <h3 className="brand-heading" id="scenario-lab-title">Test a scenario</h3>
          </div>
        </div>
        <button type="button" className="brand-button-light" onClick={handleResetScenario}>
          Reset scenario
        </button>
      </div>

      <p className="brand-copy" style={{ marginTop: '12px' }}>
        Explore how a brand-specific event could affect brand equity and determine how the strategy should respond.
      </p>

      <div className="brand-scenario-steps" aria-label="Scenario Lab steps">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const state = currentStep === stepNumber ? 'current' : currentStep > stepNumber ? 'complete' : 'upcoming';

          return (
            <div
              key={label}
              className={`brand-scenario-step brand-scenario-step-${state}`}
              style={{ '--scenario-step-color': stepColors[index] } as React.CSSProperties}
            >
              <span className="brand-scenario-step-number">{stepNumber}</span>
              <span className="brand-copy-sm">{label}</span>
            </div>
          );
        })}
      </div>

      {scenarioError ? <ErrorDisplay message={scenarioError} /> : null}

      {currentStep === 1 && (
        <ScenarioSelector
          value={session.scenarioInput}
          onCreateScenario={handleCreateScenario}
        />
      )}

      {isGeneratingScenario && (
        <LoadingIndicator
          elapsedSeconds={0}
          title="Creating scenario..."
          description="Generating a brand-specific hypothetical event for your analysis."
          note="This step builds the scenario before you predict the impact."
        />
      )}

      {session.generatedScenario && currentStep >= 2 && !isGeneratingScenario && (
        <ScenarioEditor
          baselineAnalysis={baselineAnalysis}
          scenarioInput={session.scenarioInput}
          scenario={session.generatedScenario}
          selectedManagementDecision={session.userPrediction?.selectedManagementDecision || ''}
          managementResponseDetails={session.userPrediction?.managementResponseDetails || ''}
          onScenarioChange={handleScenarioChange}
          onManagementDecisionChange={handleManagementDecisionChange}
          onManagementResponseDetailsChange={handleManagementResponseDetailsChange}
          onApply={handleApplyScenario}
        />
      )}

      {session.userPrediction && currentStep >= 3 && (
        <CBBEPredictionForm
          baselineAnalysis={baselineAnalysis}
          selectedManagementDecision={session.userPrediction.selectedManagementDecision}
          managementResponseDetails={session.userPrediction.managementResponseDetails}
          initialValue={session.userPrediction}
          onSubmit={handlePredictionSubmit}
          isSubmitted={currentStep > 3}
        />
      )}

      {session.strategyActions && currentStep >= 4 && session.userPrediction && (
        <StrategyActionsForm
          initialValue={session.strategyActions}
          onSubmit={handleStrategySubmit}
          isSubmitted={currentStep > 4}
        />
      )}

      {currentStep >= 5 && session.userPrediction && session.strategyActions && !session.scenarioEvaluation && (
        <div className="brand-subtle-card brand-card-pad brand-scenario-panel" style={{ '--scenario-panel-color': 'var(--accent-5)' } as React.CSSProperties}>
          <p className="brand-microcopy brand-scenario-step-label">Step 5</p>
          <h4 className="brand-heading" style={{ fontSize: '1.4rem' }}>Ready to critique your response</h4>
          <p className="brand-copy-sm">
            Run the AI stress test to compare your prediction with an evidence-aware estimate built from the original baseline analysis.
          </p>
          <div className="brand-scenario-actions-row">
            <button type="button" className="brand-button-light" onClick={handleRunStressTest} disabled={isEvaluatingScenario}>
              {isEvaluatingScenario ? 'Running stress test...' : 'Run AI stress test'}
            </button>
          </div>
        </div>
      )}

      {isEvaluatingScenario && (
        <LoadingIndicator
          elapsedSeconds={0}
          title="Running AI stress test..."
          description="Comparing your prediction with an evidence-aware scenario estimate."
          note="This step critiques the reasoning and estimates effects across the six CBBE dimensions."
        />
      )}

      {session.scenarioEvaluation && session.userPrediction && session.generatedScenario && (
        <ScenarioComparison
          baselineAnalysis={baselineAnalysis}
          scenario={session.generatedScenario}
          userPrediction={session.userPrediction}
          evaluation={session.scenarioEvaluation}
          revisedStrategy={session.finalRevisedStrategy || []}
          finalizedRevisions={finalizedRevisions}
          onRevisionStatusChange={handleRevisionStatusChange}
          onRevisionEdit={handleRevisionEdit}
        />
      )}
    </section>
  );
};

export default ScenarioLab;
