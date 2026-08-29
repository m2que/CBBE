
import type {
  CBBEData,
  GeminiModelOption,
  GeneratedScenario,
  MarketOverview,
  ScenarioEvaluation,
  ScenarioInput,
  StrategyAction,
  UserPrediction
} from '../types';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '../lib/cbbe';

export { AVAILABLE_MODELS, DEFAULT_MODEL };

export const generateCBBEDashboard = async (brandName: string, model: GeminiModelOption = DEFAULT_MODEL): Promise<CBBEData> => {
  const response = await fetch('/api/cbbe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brandName, model })
  });

  if (!response.ok) {
    throw new Error('Failed to generate dashboard');
  }

  return response.json();
};

export const generateMarketOverview = async (brandName: string, model: GeminiModelOption = DEFAULT_MODEL): Promise<MarketOverview> => {
  const response = await fetch('/api/market-overview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brandName, model })
  });

  if (!response.ok) {
    throw new Error('Failed to generate market overview');
  }

  return response.json();
};

export const generateScenario = async (
  brandName: string,
  baselineAnalysis: CBBEData,
  scenarioInput: ScenarioInput,
  model: GeminiModelOption = DEFAULT_MODEL
): Promise<GeneratedScenario> => {
  const response = await fetch('/api/cbbe-scenario', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'generate',
      brandName,
      baselineAnalysis,
      scenarioInput,
      model
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate scenario');
  }

  const payload = await response.json();
  return payload.scenario;
};

export const evaluateScenario = async (
  brandName: string,
  baselineAnalysis: CBBEData,
  scenarioInput: ScenarioInput,
  generatedScenario: GeneratedScenario,
  userPrediction: UserPrediction,
  strategyActions: StrategyAction[],
  model: GeminiModelOption = DEFAULT_MODEL
): Promise<ScenarioEvaluation> => {
  const response = await fetch('/api/cbbe-scenario', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'evaluate',
      brandName,
      baselineAnalysis,
      scenarioInput,
      generatedScenario,
      userPrediction,
      strategyActions,
      model
    })
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate scenario');
  }

  const payload = await response.json();
  return payload.evaluation;
};
