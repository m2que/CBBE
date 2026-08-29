
export type ReferenceCategory = 
  | 'official_brand' 
  | 'government' 
  | 'industry_databases' 
  | 'news_media' 
  | 'academic_research' 
  | 'marketing_reports';

export interface Reference {
  title: string;
  url: string;
  category: ReferenceCategory;
  relevanceNote?: string;
}

export interface CBBECategory {
  score: number;
  analysis: string;
}

export interface CBBESummary {
  analysis: string;
  strategicRecommendations: string;
}

export interface MarketOverviewQuantitativeSource {
  title: string;
  url: string;
  sourceType: 'Grand View Research';
  evidenceUsed: string;
  categoryLabel?: string;
}

export interface MarketOverviewQualitativeSource {
  title: string;
  url: string;
  sourceType: 'Deloitte' | 'PwC' | 'EY' | 'KPMG';
  evidenceUsed: string;
  categoryLabel?: string;
}

export interface MarketOverviewQuantitativeSizing {
  summary: string;
  marketSize?: string;
  cagr?: string;
  forecastPeriod?: string;
  keySegments?: string[];
  regionalNotes?: string[];
  sources: MarketOverviewQuantitativeSource[];
  sourceUnavailable?: boolean;
}

export interface MarketOverviewQualitativeTrends {
  summary: string;
  macroTrends: string[];
  consumerBehaviorInsights: string[];
  strategicImplications: string[];
  sources: MarketOverviewQualitativeSource[];
  sourceUnavailable?: boolean;
}

export interface MarketOverview {
  marketCategory: string;
  quantitativeSizing: MarketOverviewQuantitativeSizing;
  qualitativeTrends: MarketOverviewQualitativeTrends;
  limitations: string[];
}

export interface CBBEData {
  brandName: string;
  salience: CBBECategory;
  performance: CBBECategory;
  imagery: CBBECategory;
  judgements: CBBECategory;
  feelings: CBBECategory;
  resonance: CBBECategory;
  summary: CBBESummary;
  marketOverview?: MarketOverview;
  references: Reference[];
}

export type GeminiModelOption = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export type CBBEDimensionKey = 'salience' | 'performance' | 'imagery' | 'judgements' | 'feelings' | 'resonance';

export type ScenarioType =
  | 'product_or_service_failure'
  | 'product_recall_or_safety_incident'
  | 'brand_scandal'
  | 'misleading_claim_or_greenwashing_accusation'
  | 'data_or_privacy_breach'
  | 'viral_customer_complaint'
  | 'new_disruptive_competitor'
  | 'cultural_or_consumer_trend_shift'
  | 'rebranding_or_identity_change'
  | 'price_increase_or_perceived_value_deterioration'
  | 'custom_scenario';

export type ScenarioSeverity = 'low' | 'medium' | 'high';

export type ScenarioTimeHorizon = 'immediate' | 'six_months' | 'one_to_two_years';

export type ScenarioDirection = 'decrease' | 'no_material_change' | 'increase';

export interface ScenarioInput {
  scenarioType: ScenarioType;
  customScenarioLabel?: string;
  severity: ScenarioSeverity;
  timeHorizon: ScenarioTimeHorizon;
  affectedSegment: string;
  additionalContext: string;
}

export interface GeneratedScenario {
  warningLabel: string;
  headline: string;
  narrative: string;
  trigger: string;
  brandContradiction: string;
  stakeholders: string[];
  amplification: string;
  immediateConsequences: string[];
  importantUncertainty: string;
  managementDecisionPrompt: string;
  managementOptions: string[];
}

export interface ScenarioDimensionPrediction {
  direction: ScenarioDirection;
  predictedScore: number | '';
  reasoning: string;
}

export interface UserPrediction {
  selectedManagementDecision: string;
  managementResponseDetails?: string;
  dimensions: Record<CBBEDimensionKey, ScenarioDimensionPrediction>;
  greatestRisk: string;
  greatestOpportunity: string;
  likelyStable: string;
  overallReasoning: string;
}

export interface StrategyAction {
  id: string;
  action: string;
  reason: string;
  expectedEffect: string;
  riskTradeOff: string;
}

export interface ScenarioDimensionEvaluation {
  score: number;
  direction: ScenarioDirection;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
  strategicImplication: string;
}

export interface ActionCritique {
  actionId: string;
  critique: string;
}

export interface StrategyRevision {
  id: string;
  text: string;
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
}

export interface ScenarioEvaluation {
  scenarioSummary: string;
  strongReasoning: string[];
  questionableAssumptions: string[];
  missingConsiderations: string[];
  unintendedConsequences: string[];
  dimensions: Record<CBBEDimensionKey, ScenarioDimensionEvaluation>;
  actionCritiques: ActionCritique[];
  suggestedStrategyRevisions: StrategyRevision[];
  evidenceNeeded: string[];
  limitations: string[];
}

export interface ScenarioSession {
  sessionId: string;
  baselineAnalysis: CBBEData;
  scenarioInput: ScenarioInput;
  generatedScenario?: GeneratedScenario;
  userPrediction?: UserPrediction;
  strategyActions?: StrategyAction[];
  scenarioEvaluation?: ScenarioEvaluation;
  finalRevisedStrategy?: StrategyRevision[];
 }
