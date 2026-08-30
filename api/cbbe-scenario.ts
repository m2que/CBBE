import { GoogleGenAI } from '@google/genai';
import type { CBBEData, GeneratedScenario, ScenarioEvaluation, StrategyAction, UserPrediction } from '../types';
import {
  buildScenarioEvaluatePrompt,
  buildScenarioGeneratePrompt,
  DEFAULT_SCENARIO_MODEL,
  isGeminiModelOption,
  isScenarioAction,
  parseScenarioEvaluateResponse,
  parseScenarioGenerateResponse,
  sanitizeBaselineAnalysis,
  sanitizeGeneratedScenario,
  sanitizeScenarioInput,
  sanitizeStrategyActions,
  sanitizeUserPrediction
} from '../lib/cbbeScenario';

type ScenarioRequestBody = {
  action?: unknown;
  model?: unknown;
  brandName?: unknown;
  baselineAnalysis?: unknown;
  scenarioInput?: unknown;
  generatedScenario?: unknown;
  userPrediction?: unknown;
  strategyActions?: unknown;
};

type VercelRequest = {
  method?: string;
  body?: ScenarioRequestBody;
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

const getApiKey = (): string | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? apiKey : null;
};

const validateBrandName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, 200);
  return cleaned || null;
};

const sendValidationError = (res: VercelResponse, error: string) => {
  return res.status(400).json({ error });
};

const generateScenario = async (
  ai: GoogleGenAI,
  brandName: string,
  baselineAnalysis: CBBEData,
  scenarioInput: NonNullable<ReturnType<typeof sanitizeScenarioInput>>,
  model: string
): Promise<GeneratedScenario> => {
  const response = await ai.models.generateContent({
    model,
    contents: buildScenarioGeneratePrompt(brandName, baselineAnalysis, scenarioInput),
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  return parseScenarioGenerateResponse(response.text, brandName);
};

const evaluateScenario = async (
  ai: GoogleGenAI,
  brandName: string,
  baselineAnalysis: CBBEData,
  scenarioInput: NonNullable<ReturnType<typeof sanitizeScenarioInput>>,
  generatedScenario: GeneratedScenario,
  userPrediction: UserPrediction,
  strategyActions: StrategyAction[],
  model: string
): Promise<ScenarioEvaluation> => {
  const response = await ai.models.generateContent({
    model,
    contents: buildScenarioEvaluatePrompt(brandName, baselineAnalysis, scenarioInput, generatedScenario, userPrediction, strategyActions),
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });

  return parseScenarioEvaluateResponse(response.text, baselineAnalysis, strategyActions);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, model, brandName, baselineAnalysis, scenarioInput, generatedScenario, userPrediction, strategyActions } = req.body ?? {};

  if (!isScenarioAction(action)) {
    return sendValidationError(res, 'Invalid scenario action.');
  }

  const normalizedBrandName = validateBrandName(brandName);
  if (!normalizedBrandName) {
    return sendValidationError(res, 'Brand name is required.');
  }

  const normalizedBaseline = sanitizeBaselineAnalysis(baselineAnalysis);
  if (!normalizedBaseline) {
    return sendValidationError(res, 'Baseline analysis is required and must be valid.');
  }

  const normalizedScenarioInput = sanitizeScenarioInput(scenarioInput);
  if (!normalizedScenarioInput) {
    return sendValidationError(res, 'Scenario input is invalid.');
  }

  const selectedModel = isGeminiModelOption(model) ? model : DEFAULT_SCENARIO_MODEL;
  const apiKey = getApiKey();

  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    if (action === 'generate') {
      const scenario = await generateScenario(ai, normalizedBrandName, normalizedBaseline, normalizedScenarioInput, selectedModel);
      return res.status(200).json({ scenario });
    }

    const normalizedGeneratedScenario = sanitizeGeneratedScenario(generatedScenario, normalizedBrandName);
    const normalizedUserPrediction = sanitizeUserPrediction(userPrediction);
    const normalizedStrategyActions = Array.isArray(strategyActions) && strategyActions.length === 0
      ? []
      : sanitizeStrategyActions(strategyActions);

    if (!normalizedUserPrediction) {
      return sendValidationError(res, 'User prediction is invalid or incomplete.');
    }

    if (!normalizedStrategyActions) {
      return sendValidationError(res, 'Strategy actions are invalid or incomplete.');
    }

    const evaluation = await evaluateScenario(
      ai,
      normalizedBrandName,
      normalizedBaseline,
      normalizedScenarioInput,
      normalizedGeneratedScenario,
      normalizedUserPrediction,
      normalizedStrategyActions,
      selectedModel
    );

    return res.status(200).json({ evaluation });
  } catch (error) {
    console.error('Scenario lab request failed:', error);
    return res.status(500).json({ error: 'Failed to process scenario request.' });
  }
}
