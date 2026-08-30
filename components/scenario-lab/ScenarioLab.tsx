import React, { useEffect, useMemo, useState } from 'react';
import type {
  CBBEData,
  GeneratedScenario,
  ScenarioInput,
  ScenarioSession,
  UserPrediction
} from '../../types';
import { evaluateScenario, generateScenario } from '../../services/geminiService';
import ErrorDisplay from '../ErrorDisplay';
import LoadingIndicator from '../LoadingIndicator';
import { sanitizeGeneratedScenario } from '../../lib/cbbeScenario';
import ScenarioSelector from './ScenarioSelector';
import ScenarioEditor from './ScenarioEditor';
import CBBEPredictionForm from './CBBEPredictionForm';
import ScenarioComparison from './ScenarioComparison';

const STORAGE_VERSION = 'v3';

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

const buildSessionId = (): string => {
  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const buildStorageKey = (brandName: string, sessionId: string): string => {
  const safeBrand = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `marketlearn:cbbe-scenario:${STORAGE_VERSION}:${safeBrand}:${sessionId}`;
};

const getStartingStep = (session: ScenarioSession): number => {
  if (session.scenarioEvaluation) return 4;
  if (session.userPrediction) return 3;
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
      ? (() => {
          const mergedPrediction = {
            ...createDefaultPrediction(),
            ...parsed.session.userPrediction,
            selectedManagementDecision: typeof parsed.session.userPrediction.selectedManagementDecision === 'string'
              ? parsed.session.userPrediction.selectedManagementDecision
              : ''
          };

          if (!normalizedGeneratedScenario) return mergedPrediction;

          const availableOptions = normalizedGeneratedScenario.managementOptions || [];
          const hasValidSelection = availableOptions.includes(mergedPrediction.selectedManagementDecision);

          return {
            ...mergedPrediction,
            selectedManagementDecision: hasValidSelection ? mergedPrediction.selectedManagementDecision : ''
          };
        })()
      : undefined;

    return {
      ...parsed.session,
      baselineAnalysis,
      generatedScenario: normalizedGeneratedScenario,
      userPrediction: normalizedUserPrediction,
      strategyActions: undefined,
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
  const [evaluationStartedAt, setEvaluationStartedAt] = useState<number>(0);
  const [evaluationElapsedSeconds, setEvaluationElapsedSeconds] = useState<number>(0);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const stepLabels = useMemo(() => [
    'Choose scenario',
    'Review and customize event',
    'Predict the impact',
    'Compare results'
  ], []);

  const stepColors = useMemo(() => [
    'var(--accent)',
    'var(--accent-2)',
    'var(--accent-4)',
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

  useEffect(() => {
    if (!isEvaluatingScenario || !evaluationStartedAt) {
      setEvaluationElapsedSeconds(0);
      return;
    }

    setEvaluationElapsedSeconds(Math.max(1, Math.floor((Date.now() - evaluationStartedAt) / 1000)));

    const timer = window.setInterval(() => {
      setEvaluationElapsedSeconds(Math.max(1, Math.floor((Date.now() - evaluationStartedAt) / 1000)));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [evaluationStartedAt, isEvaluatingScenario]);

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
      scenarioEvaluation: undefined,
      finalRevisedStrategy: current.finalRevisedStrategy || []
    }));
    setCurrentStep(4);
    void handleRunStressTest(userPrediction);
  };

  const handleRunStressTest = async (predictionOverride?: UserPrediction) => {
    const prediction = predictionOverride || session.userPrediction;
    if (!session.generatedScenario || !prediction) return;

    setIsEvaluatingScenario(true);
    setEvaluationStartedAt(Date.now());
    setScenarioError(null);

    try {
      const scenarioEvaluation = await evaluateScenario(
        baselineAnalysis.brandName,
        baselineAnalysis,
        session.scenarioInput,
        session.generatedScenario,
        prediction,
        []
      );

      setSession((current) => ({
        ...current,
        userPrediction: prediction,
        scenarioEvaluation,
        finalRevisedStrategy: current.finalRevisedStrategy?.length ? current.finalRevisedStrategy : scenarioEvaluation.suggestedStrategyRevisions
      }));
      setCurrentStep(4);
    } catch {
      setScenarioError('We could not complete the AI stress test right now. Please try again.');
    } finally {
      setIsEvaluatingScenario(false);
      setEvaluationStartedAt(0);
    }
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

      {isEvaluatingScenario && (
        <LoadingIndicator
          elapsedSeconds={evaluationElapsedSeconds}
          title="Rerunning analysis..."
          description="Generating an updated scenario dashboard from the selected management response and your predicted score changes."
          note="This creates a new results view with AI-estimated CBBE effects across the six dimensions."
        />
      )}

      {session.scenarioEvaluation && session.userPrediction && session.generatedScenario && (
        <ScenarioComparison
          baselineAnalysis={baselineAnalysis}
          scenario={session.generatedScenario}
          userPrediction={session.userPrediction}
          evaluation={session.scenarioEvaluation}
          revisedStrategy={session.finalRevisedStrategy || []}
        />
      )}

      {scenarioError && currentStep >= 4 ? <ErrorDisplay message={scenarioError} /> : null}
      {scenarioError && currentStep < 4 ? <ErrorDisplay message={scenarioError} /> : null}
    </section>
  );
};

export default ScenarioLab;
