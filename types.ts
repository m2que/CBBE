
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
}

export interface MarketOverviewQualitativeSource {
  title: string;
  url: string;
  sourceType: 'Deloitte' | 'PwC' | 'EY' | 'KPMG';
  evidenceUsed: string;
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
