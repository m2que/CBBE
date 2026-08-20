
import React from 'react';
import type { CBBEData, Reference, ReferenceCategory } from '../types';
import CategoryCard from './CategoryCard';
import BrandEquityFunnel from './BrandEquityFunnel';
import RadarScoreChart from './RadarScoreChart';
import BrandIcon from './BrandIcon';

interface DashboardDisplayProps {
  data: CBBEData;
}

const DashboardDisplay: React.FC<DashboardDisplayProps> = ({ data }) => {
  const categories = [
    { name: 'Salience', level: 1, data: data.salience },
    { name: 'Performance', level: 2, data: data.performance },
    { name: 'Imagery', level: 2, data: data.imagery },
    { name: 'Judgements', level: 3, data: data.judgements },
    { name: 'Feelings', level: 3, data: data.feelings },
    { name: 'Resonance', level: 4, data: data.resonance },
  ];

  // Group references by category
  const groupedReferences = (data.references || []).reduce((acc, ref) => {
    if (!acc[ref.category]) acc[ref.category] = [];
    acc[ref.category].push(ref);
    return acc;
  }, {} as Record<ReferenceCategory, Reference[]>);

  const referenceCategories: { key: ReferenceCategory; label: string; color: string }[] = [
    { key: 'official_brand', label: 'Official Brand', color: 'var(--accent-strong)' },
    { key: 'government', label: 'Government', color: 'var(--navy-deep)' },
    { key: 'industry_databases', label: 'Industry Database', color: '#87612a' },
    { key: 'news_media', label: 'News Media', color: 'var(--muted)' },
    { key: 'academic_research', label: 'Academic Research', color: 'var(--accent)' },
    { key: 'marketing_reports', label: 'Marketing Report', color: 'var(--ink)' },
  ];

  const hasReferences = data.references && data.references.length > 0;
  const hasScoreExplanation = categories.some((cat) => cat.data.analysis);

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="brand-title" id="dashboard" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', textAlign: 'center' }}>
        CBBE Profile for <span style={{ color: 'var(--accent-strong)' }}>{data.brandName}</span>
      </h2>

      <div className="brand-section-grid">
        <div className="brand-card brand-card-pad">
          <h3 className="brand-heading" style={{ marginBottom: '16px', textAlign: 'center' }}>Brand Equity Pyramid</h3>
          <BrandEquityFunnel data={data} />
        </div>
        <div className="brand-card brand-card-pad">
           <h3 className="brand-heading" style={{ marginBottom: '16px' }}>Equity Score Overview</h3>
           <div className="h-80 md:h-96">
            <RadarScoreChart data={data} />
           </div>
        </div>
      </div>
      
      <div className="brand-category-grid">
        {categories.map((cat) => (
          <CategoryCard key={cat.name} title={cat.name} level={cat.level} data={cat.data} />
        ))}
      </div>

      <div className="brand-section-grid">
        <div className="brand-card brand-card-pad">
            <div className="brand-section-title">
                <BrandIcon name="icon-marketlearn" />
                <h3 className="brand-heading">Executive Summary</h3>
            </div>
            <p className="brand-copy">{data.summary.analysis}</p>
        </div>
        <div className="brand-card brand-card-pad">
            <div className="brand-section-title">
                <BrandIcon name="icon-bpm" style={{ color: 'var(--accent)' }} />
                <h3 className="brand-heading">Strategic Recommendations</h3>
            </div>
            <p className="brand-copy">{data.summary.strategicRecommendations}</p>
        </div>
      </div>

      {hasScoreExplanation && (
        <div className="brand-card brand-card-pad">
          <div className="brand-section-title">
            <BrandIcon name="icon-marketlearn" />
            <h3 className="brand-heading">How To Read The CBBE Score</h3>
          </div>
          <p className="brand-copy">
            Each score reflects the strength of the brand on a CBBE dimension from 1-100. The short analysis in each card explains the evidence used to justify that score, and the references section gives students at least one grounded source they can cite in a report.
          </p>
        </div>
      )}

      {hasReferences && (
        <div className="brand-card brand-card-pad" id="references">
            <div className="brand-section-title">
                <BrandIcon name="icon-bea" />
                <h3 className="brand-heading">Data Sources & References</h3>
            </div>
            <div className="brand-ref-grid">
                {referenceCategories.map((catType) => {
                    const refs = groupedReferences[catType.key];
                    if (!refs || refs.length === 0) return null;

                    return (
                        <div key={catType.key} className="brand-stack-12">
                            <span className="brand-ref-tag" style={{ color: catType.color }}>
                                {catType.label}
                            </span>
                             <ul className="brand-ref-list">
                                  {refs.map((ref, idx) => (
                                      <li key={idx} className="brand-ref-item">
                                          <div className="brand-ref-dot"></div>
                                          <div className="brand-stack-8">
                                             <a 
                                                href={ref.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="brand-ref-link"
                                            >
                                                {ref.title || ref.url}
                                            </a>
                                            {ref.relevanceNote && (
                                              <p className="brand-copy-sm">{ref.relevanceNote}</p>
                                            )}
                                          </div>
                                      </li>
                                 ))}
                             </ul>
                         </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDisplay;
