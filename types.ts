
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

export interface CBBEData {
  brandName: string;
  salience: CBBECategory;
  performance: CBBECategory;
  imagery: CBBECategory;
  judgements: CBBECategory;
  feelings: CBBECategory;
  resonance: CBBECategory;
  summary: CBBESummary;
  references: Reference[];
}

export type GeminiModelOption = 'gemini-2.5-flash' | 'gemini-2.5-pro';
