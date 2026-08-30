import type {
  CBBEData,
  CBBEDimensionKey,
  GeneratedScenario,
  GeminiModelOption,
  ScenarioDirection,
  ScenarioEvaluation,
  ScenarioInput,
  StrategyAction,
  StrategyRevision,
  UserPrediction
} from '../types';

export const DEFAULT_SCENARIO_MODEL: GeminiModelOption = 'gemini-2.5-flash';

export const SCENARIO_TYPES = [
  'product_or_service_failure',
  'product_recall_or_safety_incident',
  'brand_scandal',
  'misleading_claim_or_greenwashing_accusation',
  'data_or_privacy_breach',
  'viral_customer_complaint',
  'new_disruptive_competitor',
  'cultural_or_consumer_trend_shift',
  'rebranding_or_identity_change',
  'price_increase_or_perceived_value_deterioration',
  'custom_scenario'
] as const;

export const SCENARIO_SEVERITIES = ['low', 'medium', 'high'] as const;
export const SCENARIO_TIME_HORIZONS = ['immediate', 'six_months', 'one_to_two_years'] as const;
export const SCENARIO_DIRECTIONS = ['decrease', 'no_material_change', 'increase'] as const;
export const SCENARIO_ACTIONS = ['generate', 'evaluate'] as const;

const DIMENSION_KEYS: CBBEDimensionKey[] = ['salience', 'performance', 'imagery', 'judgements', 'feelings', 'resonance'];

export const getDimensionKeys = (): CBBEDimensionKey[] => [...DIMENSION_KEYS];

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const cleanText = (value: unknown, maxLength: number): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
};

const cleanTruncatedText = (value: unknown, maxLength: number): string => {
  const cleaned = cleanText(value, maxLength + 40);
  if (cleaned.length <= maxLength) return cleaned;

  const sentenceWithinLimit = cleaned.slice(0, maxLength).match(/^(.+[.!?])\s/u);
  if (sentenceWithinLimit?.[1]) {
    return sentenceWithinLimit[1].trim();
  }

  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > Math.floor(maxLength * 0.6)) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
};

const cleanWordLimitedText = (value: unknown, maxWords: number, maxLength: number): string => {
  const cleaned = cleanText(value, maxLength + 80);
  if (!cleaned) return '';

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords && cleaned.length <= maxLength) {
    return cleaned;
  }

  return words.slice(0, maxWords).join(' ').trim().replace(/[,:;\-]+$/u, '');
};

const cleanSentenceLimitedText = (value: unknown, maxWords: number, maxLength: number): string => {
  const cleaned = cleanText(value, maxLength + 120);
  if (!cleaned) return '';

  const finalizeSentence = (input: string): string => {
    let output = input.trim();

    output = output.replace(/\([^)]*$/u, '').trim();
    output = output.replace(/\b(?:e|i)\.$/iu, '').trim();
    output = output.replace(/\b(?:e\.g|i\.e)\.?$/iu, '').trim();
    output = output.replace(/[,:;\-]+$/u, '').trim();

    if (!output) return '';
    return /[.!?]$/.test(output) ? output : `${output}.`;
  };

  const sentences = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned];
  let chosen = '';

  for (const sentence of sentences) {
    const candidate = sentence.trim();
    const wordCount = candidate.split(/\s+/).filter(Boolean).length;
    if (wordCount <= maxWords && candidate.length <= maxLength) {
      chosen = candidate;
      break;
    }
  }

  if (chosen) {
    return finalizeSentence(chosen);
  }

  const shortened = cleanWordLimitedText(cleaned, maxWords, maxLength);
  if (!shortened) return '';
  return finalizeSentence(shortened);
};

const cleanTextList = (value: unknown, maxItems: number, maxLength: number): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
};

const shortenDecisionOption = (value: string): string => {
  const cleaned = cleanText(value, 220);
  if (!cleaned) return '';

  const normalized = cleaned
    .replace(/\([^)]*$/u, '')
    .replace(/\b(?:e\.g\.?|i\.e\.?)$/iu, '')
    .replace(/[,:;\-]+$/u, '')
    .trim();

  const sentences = normalized.match(/[^.!?]+[.!?]?/g) || [normalized];
  const preferredSentence = sentences
    .map((sentence) => sentence.trim())
    .find((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 8)
    || sentences[0]?.trim()
    || normalized;

  return cleanSentenceLimitedText(preferredSentence, 22, 200);
};

const buildFallbackManagementOptions = (): string[] => {
  return [
    'Deny the claim publicly and defend current standards.',
    'Investigate independently before making a broader response.',
    'Acknowledge concerns and announce visible corrective action.'
  ];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isGeminiModelOption = (value: unknown): value is GeminiModelOption => {
  return value === 'gemini-2.5-flash' || value === 'gemini-2.5-pro';
};

export const isScenarioAction = (value: unknown): value is (typeof SCENARIO_ACTIONS)[number] => {
  return typeof value === 'string' && (SCENARIO_ACTIONS as readonly string[]).includes(value);
};

export const isScenarioType = (value: unknown): value is ScenarioInput['scenarioType'] => {
  return typeof value === 'string' && (SCENARIO_TYPES as readonly string[]).includes(value);
};

export const isScenarioSeverity = (value: unknown): value is ScenarioInput['severity'] => {
  return typeof value === 'string' && (SCENARIO_SEVERITIES as readonly string[]).includes(value);
};

export const isScenarioTimeHorizon = (value: unknown): value is ScenarioInput['timeHorizon'] => {
  return typeof value === 'string' && (SCENARIO_TIME_HORIZONS as readonly string[]).includes(value);
};

export const isScenarioDirection = (value: unknown): value is ScenarioDirection => {
  return typeof value === 'string' && (SCENARIO_DIRECTIONS as readonly string[]).includes(value);
};

export const summarizeBaselineAnalysis = (baselineAnalysis: CBBEData): string => {
  return DIMENSION_KEYS.map((key) => `${key}: ${baselineAnalysis[key].score}/100 - ${cleanText(baselineAnalysis[key].analysis, 280)}`).join('\n');
};

export const sanitizeScenarioInput = (value: unknown): ScenarioInput | null => {
  if (!isRecord(value)) return null;

  const scenarioType = isScenarioType(value.scenarioType) ? value.scenarioType : null;
  const severity = isScenarioSeverity(value.severity) ? value.severity : null;
  const timeHorizon = isScenarioTimeHorizon(value.timeHorizon) ? value.timeHorizon : null;

  if (!scenarioType || !severity || !timeHorizon) return null;

  const customScenarioLabel = cleanText(value.customScenarioLabel, 80);

  if (scenarioType === 'custom_scenario' && !customScenarioLabel) {
    return null;
  }

  return {
    scenarioType,
    customScenarioLabel,
    severity,
    timeHorizon,
    affectedSegment: '',
    additionalContext: ''
  };
};

export const sanitizeGeneratedScenario = (value: unknown, brandName: string): GeneratedScenario => {
  const record = isRecord(value) ? value : {};
  const managementOptions = cleanTextList(record.managementOptions, 3, 160)
    .map(shortenDecisionOption)
    .filter((option) => option.split(/\s+/).filter(Boolean).length >= 5)
    .slice(0, 3);

  return {
    warningLabel: `Hypothetical scenario built from analysis for ${brandName}.`,
    headline: cleanTruncatedText(record.headline, 140) || `Hypothetical scenario for ${brandName}`,
    narrative: cleanTruncatedText(record.narrative, 700) || `In this scenario, ${brandName} faces a hypothetical event that tests current brand equity.`,
    trigger: cleanSentenceLimitedText(record.trigger, 40, 280),
    brandContradiction: cleanSentenceLimitedText(record.brandContradiction, 40, 280),
    stakeholders: cleanTextList(record.stakeholders, 4, 56),
    amplification: cleanSentenceLimitedText(record.amplification, 40, 280),
    immediateConsequences: cleanTextList(record.immediateConsequences, 3, 110),
    importantUncertainty: cleanSentenceLimitedText(record.importantUncertainty, 40, 280),
    managementDecisionPrompt: 'Select a response to test.',
    managementOptions: managementOptions.length === 3 ? managementOptions : buildFallbackManagementOptions()
  };
};

export const sanitizeUserPrediction = (value: unknown): UserPrediction | null => {
  if (!isRecord(value) || !isRecord(value.dimensions)) return null;

  const dimensions = {} as UserPrediction['dimensions'];

  for (const key of DIMENSION_KEYS) {
    const item = value.dimensions[key];
    if (!isRecord(item) || !isScenarioDirection(item.direction)) return null;

    const predictedScore = typeof item.predictedScore === 'number' ? clamp(Math.round(item.predictedScore), 1, 100) : null;
    if (predictedScore === null) return null;

    dimensions[key] = {
      direction: item.direction,
      predictedScore,
      reasoning: cleanText(item.reasoning, 240)
    };
  }

  const greatestRisk = cleanText(value.greatestRisk, 300);
  const greatestOpportunity = cleanText(value.greatestOpportunity, 300);
  const likelyStable = cleanText(value.likelyStable, 300);
  const overallReasoning = cleanText(value.overallReasoning, 320);
  const selectedManagementDecision = cleanText(value.selectedManagementDecision, 220);
  const managementResponseDetails = cleanText(value.managementResponseDetails, 240);

  if (!selectedManagementDecision) {
    return null;
  }

  return {
    selectedManagementDecision,
    managementResponseDetails,
    dimensions,
    greatestRisk,
    greatestOpportunity,
    likelyStable,
    overallReasoning
  };
};

export const sanitizeStrategyActions = (value: unknown): StrategyAction[] | null => {
  if (!Array.isArray(value)) return null;

  const actions = value
    .filter(isRecord)
    .map((item, index) => ({
      id: cleanText(item.id, 40) || `action-${index + 1}`,
      action: cleanText(item.action, 220),
      reason: cleanText(item.reason, 220),
      expectedEffect: cleanText(item.expectedEffect, 220),
      riskTradeOff: cleanText(item.riskTradeOff, 220)
    }))
    .filter((item) => item.action);

  if (actions.length < 1 || actions.length > 3) return null;
  if (actions.some((item) => item.reason.length < 12 || item.expectedEffect.length < 12 || item.riskTradeOff.length < 12)) return null;

  return actions;
};

export const sanitizeBaselineAnalysis = (value: unknown): CBBEData | null => {
  if (!isRecord(value)) return null;
  const brandName = cleanText(value.brandName, 200);
  if (!brandName) return null;

  const summary = isRecord(value.summary)
    ? {
        analysis: cleanText(value.summary.analysis, 1500),
        strategicRecommendations: cleanText(value.summary.strategicRecommendations, 1500)
      }
    : null;

  if (!summary) return null;

  const categories = {} as Pick<CBBEData, CBBEDimensionKey>;

  for (const key of DIMENSION_KEYS) {
    const item = value[key];
    if (!isRecord(item) || typeof item.score !== 'number') return null;
    categories[key] = {
      score: clamp(Math.round(item.score), 1, 100),
      analysis: cleanText(item.analysis, 1500)
    };
  }

  return {
    brandName,
    ...categories,
    summary,
    marketOverview: undefined,
    references: []
  };
};

const extractJsonObject = (jsonText: string): string => {
  let cleanedJsonText = jsonText.trim();

  if (cleanedJsonText.startsWith('```json')) {
    cleanedJsonText = cleanedJsonText.substring(7, cleanedJsonText.length - 3).trim();
  } else if (cleanedJsonText.startsWith('```')) {
    cleanedJsonText = cleanedJsonText.substring(3, cleanedJsonText.length - 3).trim();
  }

  const firstBrace = cleanedJsonText.indexOf('{');
  const lastBrace = cleanedJsonText.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return cleanedJsonText.slice(firstBrace, lastBrace + 1);
  }

  return cleanedJsonText;
};

const parseJsonText = (jsonText: string): unknown => {
  const cleanedJsonText = extractJsonObject(jsonText);

  try {
    return JSON.parse(cleanedJsonText);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown JSON parse error';
    throw new Error(`Scenario JSON parse failed: ${reason}`);
  }
};

const ensureGeneratedScenarioShape = (scenario: GeneratedScenario, brandName: string): GeneratedScenario => {
  if (!scenario.headline || !scenario.narrative) {
    throw new Error(`Scenario generate response missing required fields for ${brandName}`);
  }

  return scenario;
};

export const parseScenarioGenerateResponse = (jsonText: string, brandName: string): GeneratedScenario => {
  const parsed = parseJsonText(jsonText);
  return ensureGeneratedScenarioShape(sanitizeGeneratedScenario(parsed, brandName), brandName);
};

export const parseScenarioEvaluateResponse = (jsonText: string, baselineAnalysis: CBBEData, strategyActions: StrategyAction[]): ScenarioEvaluation => {
  const parsed = parseJsonText(jsonText);
  const record = isRecord(parsed) ? parsed : {};

  const dimensions = {} as ScenarioEvaluation['dimensions'];

  for (const key of DIMENSION_KEYS) {
    const item = isRecord(record.dimensions) && isRecord(record.dimensions[key]) ? record.dimensions[key] : {};
    const direction = isScenarioDirection(item.direction) ? item.direction : 'no_material_change';
    const score = typeof item.score === 'number' ? clamp(Math.round(item.score), 1, 100) : baselineAnalysis[key].score;
    const confidence = item.confidence === 'high' || item.confidence === 'medium' || item.confidence === 'low' ? item.confidence : 'low';

    dimensions[key] = {
      score,
      direction,
      reasoning: cleanText(item.reasoning, 500),
      confidence,
      strategicImplication: cleanText(item.strategicImplication, 320)
    };
  }

  const suggestedStrategyRevisions = cleanTextList(record.suggestedStrategyRevisions, 6, 220).map((text, index) => ({
    id: `revision-${index + 1}`,
    text,
    status: 'pending' as const
  }));

  const actionCritiques = strategyActions.map((action, index) => {
    const critiqueItems = Array.isArray(record.actionCritiques) ? record.actionCritiques : [];
    const matching = critiqueItems[index];
    const critiqueRecord = isRecord(matching) ? matching : {};

    return {
      actionId: action.id,
      critique: cleanText(critiqueRecord.critique, 320) || 'No specific critique was returned for this action.'
    };
  });

  return {
    scenarioSummary: cleanText(record.scenarioSummary, 500),
    strongReasoning: cleanTextList(record.strongReasoning, 6, 220),
    questionableAssumptions: cleanTextList(record.questionableAssumptions, 6, 220),
    missingConsiderations: cleanTextList(record.missingConsiderations, 6, 220),
    unintendedConsequences: cleanTextList(record.unintendedConsequences, 6, 220),
    dimensions,
    actionCritiques,
    suggestedStrategyRevisions,
    evidenceNeeded: cleanTextList(record.evidenceNeeded, 6, 220),
    limitations: cleanTextList(record.limitations, 6, 220)
  };
};

export const buildScenarioGeneratePrompt = (brandName: string, baselineAnalysis: CBBEData, scenarioInput: ScenarioInput): string => {
  const scenarioLabel = scenarioInput.scenarioType === 'custom_scenario'
    ? scenarioInput.customScenarioLabel || 'custom scenario'
    : scenarioInput.scenarioType.replaceAll('_', ' ');

  return `Return strict JSON only with this exact shape:
{
  "headline": string,
  "narrative": string,
  "trigger": string,
  "brandContradiction": string,
  "stakeholders": string[],
  "amplification": string,
  "immediateConsequences": string[],
  "importantUncertainty": string,
  "managementDecisionPrompt": string,
  "managementOptions": string[]
}

Task:
- Generate one concrete, brand-specific hypothetical scenario for ${brandName}.
- Use the original CBBE analysis as the baseline context.
- Scenario type: ${scenarioLabel}
- Severity: ${scenarioInput.severity}
- Time horizon: ${scenarioInput.timeHorizon.replaceAll('_', ' ')}

Safety rules:
- The scenario is hypothetical, not real.
- Use wording like "In this scenario" or "An allegation emerges".
- Do not claim the event actually happened.
- Do not invent sources, URLs, quotations, named accusers, statistics, or specific real-world evidence.
- Keep any allegation unverified.
- Avoid sensational or defamatory detail.

Quality rules:
- Make the event specific to the brand's positioning, promise, customers, and vulnerabilities.
- Include trigger, contradiction, stakeholders, amplification, immediate consequences, uncertainty, and a management decision prompt with exactly 3 distinct response options.
- Keep the narrative concrete and decision-useful.
- Set managementDecisionPrompt to exactly: "Select a response to test."
- The 3 management options must each be one complete sentence.
- Each management option must be concise, concrete, and ideally 12 to 16 words.
- Do not write paragraphs, fragments, or options that end mid-thought.
- Each option should describe a materially different management response.

Baseline summary:
Brand: ${brandName}
${summarizeBaselineAnalysis(baselineAnalysis)}
Summary: ${cleanText(baselineAnalysis.summary.analysis, 900)}
Strategy: ${cleanText(baselineAnalysis.summary.strategicRecommendations, 900)}`;
};

export const buildScenarioEvaluatePrompt = (
  brandName: string,
  baselineAnalysis: CBBEData,
  scenarioInput: ScenarioInput,
  generatedScenario: GeneratedScenario,
  userPrediction: UserPrediction,
  strategyActions: StrategyAction[]
): string => {
  const strategyText = strategyActions.map((action, index) => `${index + 1}. Action: ${action.action}\nReason: ${action.reason}\nExpected effect: ${action.expectedEffect}\nRisk or trade-off: ${action.riskTradeOff}`).join('\n\n');

  return `Return strict JSON only with this exact shape:
{
  "scenarioSummary": string,
  "strongReasoning": string[],
  "questionableAssumptions": string[],
  "missingConsiderations": string[],
  "unintendedConsequences": string[],
  "dimensions": {
    "salience": { "score": number, "direction": "decrease" | "no_material_change" | "increase", "reasoning": string, "confidence": "low" | "medium" | "high", "strategicImplication": string },
    "performance": { "score": number, "direction": "decrease" | "no_material_change" | "increase", "reasoning": string, "confidence": "low" | "medium" | "high", "strategicImplication": string },
    "imagery": { "score": number, "direction": "decrease" | "no_material_change" | "increase", "reasoning": string, "confidence": "low" | "medium" | "high", "strategicImplication": string },
    "judgements": { "score": number, "direction": "decrease" | "no_material_change" | "increase", "reasoning": string, "confidence": "low" | "medium" | "high", "strategicImplication": string },
    "feelings": { "score": number, "direction": "decrease" | "no_material_change" | "increase", "reasoning": string, "confidence": "low" | "medium" | "high", "strategicImplication": string },
    "resonance": { "score": number, "direction": "decrease" | "no_material_change" | "increase", "reasoning": string, "confidence": "low" | "medium" | "high", "strategicImplication": string }
  },
  "suggestedStrategyRevisions": string[],
  "evidenceNeeded": string[],
  "limitations": string[]
}

Instructions:
- Treat the original CBBE analysis as the baseline.
- Treat the scenario as hypothetical.
- Critique the user's reasoning before making recommendations.
- Evaluate effects separately for all six CBBE dimensions.
- Distinguish supported reasoning, assumptions, and uncertainty.
- Avoid invented facts, sources, and market claims.
- Preserve uncertainty when the effect cannot be determined confidently.
- Use the same 1-100 scale as the baseline.
- Do not silently replace the user's response; critique it and suggest revisions.

Brand: ${brandName}
Scenario type: ${scenarioInput.scenarioType === 'custom_scenario' ? scenarioInput.customScenarioLabel || 'custom scenario' : scenarioInput.scenarioType.replaceAll('_', ' ')}
Severity: ${scenarioInput.severity}
Time horizon: ${scenarioInput.timeHorizon.replaceAll('_', ' ')}

Baseline summary:
${summarizeBaselineAnalysis(baselineAnalysis)}
Summary: ${cleanText(baselineAnalysis.summary.analysis, 900)}
Strategy: ${cleanText(baselineAnalysis.summary.strategicRecommendations, 900)}

Hypothetical scenario:
Headline: ${generatedScenario.headline}
Narrative: ${generatedScenario.narrative}
Trigger: ${generatedScenario.trigger}
Brand contradiction: ${generatedScenario.brandContradiction}
Stakeholders: ${generatedScenario.stakeholders.join(', ')}
Amplification: ${generatedScenario.amplification}
Immediate consequences: ${generatedScenario.immediateConsequences.join('; ')}
Important uncertainty: ${generatedScenario.importantUncertainty}
Management decision prompt: ${generatedScenario.managementDecisionPrompt}
Selected management response: ${userPrediction.selectedManagementDecision}
Management response details: ${userPrediction.managementResponseDetails || 'No additional detail provided.'}

User prediction:
${DIMENSION_KEYS.map((key) => `${key}: direction=${userPrediction.dimensions[key].direction}, score=${userPrediction.dimensions[key].predictedScore}, reasoning=${userPrediction.dimensions[key].reasoning || 'none'}`).join('\n')}
Greatest risk: ${userPrediction.greatestRisk || 'Not provided.'}
Greatest opportunity: ${userPrediction.greatestOpportunity || 'Not provided.'}
Likely stable: ${userPrediction.likelyStable || 'Not provided.'}
Overall reasoning: ${userPrediction.overallReasoning || 'Not provided.'}

${strategyText ? `Proposed strategic actions:
${strategyText}` : 'There are no separate strategic actions in this flow. Evaluate the selected management response and the predicted score changes directly.'}`;
};

export const buildScenarioError = (status: number, error: string) => ({ status, error });

export const syncAcceptedRevisions = (revisions: StrategyRevision[]): StrategyRevision[] => {
  return revisions.filter((revision) => revision.status === 'accepted' || revision.status === 'edited');
};
