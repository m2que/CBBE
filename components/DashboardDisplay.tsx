
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
  const quantitative = data.marketOverview?.quantitativeSizing;
  const qualitative = data.marketOverview?.qualitativeTrends;
  const hasMarketOverview = Boolean(data.marketOverview && quantitative && qualitative);

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
                <BrandIcon name="icon-cbbe" />
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

      {hasReferences && (
        <div className="brand-card brand-card-pad" id="references">
            <div className="brand-section-title">
                <BrandIcon name="icon-cbbe" />
                <h3 className="brand-heading">Data Sources & References</h3>
            </div>
            <div className="brand-stack-16">
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

      {hasMarketOverview && (
        <div className="brand-card brand-card-pad">
          <div className="brand-section-title">
            <BrandIcon name="icon-cbbe" />
            <h3 className="brand-heading">Market Overview</h3>
          </div>
          <div className="brand-stack-16">
            <div className="brand-stack-8">
              <p className="brand-microcopy">Market Category</p>
              <p className="brand-copy">{data.marketOverview?.marketCategory}</p>
            </div>

            <div className="brand-section-grid brand-section-grid-compact">
              <div className="brand-subtle-card brand-card-pad">
                <div className="brand-stack-12">
                  <p className="brand-microcopy">Market Size</p>
                  <p className="brand-copy">{quantitative?.sourceUnavailable ? 'No market-size source was found for this query.' : quantitative?.summary}</p>
                  {quantitative?.keySegments?.length > 0 && (
                    <div className="brand-stack-8">
                      <p className="brand-microcopy">Key Segments</p>
                      <ul className="brand-ref-list">
                        {quantitative.keySegments.map((segment) => (
                          <li key={segment} className="brand-ref-item">
                            <div className="brand-ref-dot"></div>
                            <p className="brand-copy-sm">{segment}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {quantitative?.regionalNotes?.length > 0 && (
                    <div className="brand-stack-8">
                      <p className="brand-microcopy">Regional Growth</p>
                      <ul className="brand-ref-list">
                        {quantitative.regionalNotes.map((note) => (
                          <li key={note} className="brand-ref-item">
                            <div className="brand-ref-dot"></div>
                            <p className="brand-copy-sm">{note}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="brand-subtle-card brand-card-pad">
                <div className="brand-stack-12">
                  <p className="brand-microcopy">Trends</p>
                  <p className="brand-copy">{qualitative?.sourceUnavailable ? 'No Deloitte, PwC, EY, or KPMG trend source was found for this query.' : qualitative?.summary}</p>
                  <div className="brand-stack-8">
                    <p className="brand-microcopy">Highlights</p>
                    <ul className="brand-ref-list">
                      {[...(qualitative?.macroTrends || []), ...(qualitative?.consumerBehaviorInsights || []), ...(qualitative?.strategicImplications || [])].slice(0, 6).map((item) => (
                        <li key={item} className="brand-ref-item">
                          <div className="brand-ref-dot"></div>
                          <p className="brand-copy-sm">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {((quantitative?.sources.length || 0) + (qualitative?.sources.length || 0)) > 0 && (
              <div className="brand-subtle-card brand-card-pad">
                <div className="brand-stack-12">
                  <p className="brand-microcopy">References</p>
                  <ul className="brand-ref-list">
                    {[...(quantitative?.sources || []), ...(qualitative?.sources || [])].map((source) => (
                      <li key={source.url} className="brand-ref-item">
                        <div className="brand-ref-dot"></div>
                        <div className="brand-stack-8">
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="brand-ref-link">{source.title}</a>
                          <p className="brand-copy-sm">{source.evidenceUsed}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {data.marketOverview?.limitations.filter((item) => !/unavailable from the required source set/i.test(item)).length ? (
              <div className="brand-stack-8">
                <p className="brand-microcopy">Limitations</p>
                <ul className="brand-ref-list">
                  {data.marketOverview.limitations.filter((item) => !/unavailable from the required source set/i.test(item)).map((item) => (
                    <li key={item} className="brand-ref-item">
                      <div className="brand-ref-dot"></div>
                      <p className="brand-copy-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardDisplay;
