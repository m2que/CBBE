
import React from 'react';
import type { CBBEData, Reference, ReferenceCategory } from '../types';
import CategoryCard from './CategoryCard';
import BrandEquityFunnel from './BrandEquityFunnel';
import RadarScoreChart from './RadarScoreChart';
import { BookOpenIcon, TargetIcon, LinkIcon } from './icons';

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
    { key: 'official_brand', label: 'Official Brand', color: 'bg-[rgba(15,118,110,0.1)] text-teal-800 border-[rgba(15,118,110,0.18)]' },
    { key: 'government', label: 'Government', color: 'bg-[rgba(30,64,175,0.08)] text-blue-800 border-[rgba(30,64,175,0.16)]' },
    { key: 'industry_databases', label: 'Industry Database', color: 'bg-[rgba(217,119,6,0.12)] text-amber-800 border-[rgba(217,119,6,0.2)]' },
    { key: 'news_media', label: 'News Media', color: 'bg-[rgba(190,24,93,0.08)] text-rose-800 border-[rgba(190,24,93,0.16)]' },
    { key: 'academic_research', label: 'Academic Research', color: 'bg-[rgba(88,28,135,0.08)] text-purple-800 border-[rgba(88,28,135,0.16)]' },
    { key: 'marketing_reports', label: 'Marketing Report', color: 'bg-[rgba(71,85,105,0.08)] text-slate-700 border-[rgba(71,85,105,0.16)]' },
  ];

  const hasReferences = data.references && data.references.length > 0;
  const hasScoreExplanation = categories.some((cat) => cat.data.analysis);

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
        CBBE Profile for <span className="text-teal-800">{data.brandName}</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_24px_80px_rgba(61,41,20,0.08)]">
          <h3 className="mb-4 text-center font-serif text-xl font-semibold text-slate-900">Brand Equity Funnel</h3>
          <BrandEquityFunnel data={data} />
        </div>
        <div className="lg:col-span-2 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_24px_80px_rgba(61,41,20,0.08)]">
           <h3 className="mb-4 font-serif text-xl font-semibold text-slate-900">Equity Score Overview</h3>
           <div className="h-80 md:h-96">
            <RadarScoreChart data={data} />
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.name} title={cat.name} level={cat.level} data={cat.data} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
            <div className="flex items-center gap-3 mb-3">
                <BookOpenIcon className="h-6 w-6 text-teal-800"/>
                <h3 className="font-serif text-xl font-semibold text-slate-900">Executive Summary</h3>
            </div>
            <p className="leading-8 text-slate-600">{data.summary.analysis}</p>
        </div>
        <div className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
            <div className="flex items-center gap-3 mb-3">
                <TargetIcon className="h-6 w-6 text-amber-700"/>
                <h3 className="font-serif text-xl font-semibold text-slate-900">Strategic Recommendations</h3>
            </div>
            <p className="leading-8 text-slate-600">{data.summary.strategicRecommendations}</p>
        </div>
      </div>

      {hasScoreExplanation && (
        <div className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <BookOpenIcon className="h-6 w-6 text-teal-800" />
            <h3 className="font-serif text-xl font-semibold text-slate-900">How To Read The CBBE Score</h3>
          </div>
          <p className="leading-8 text-slate-600">
            Each score reflects the strength of the brand on a CBBE dimension from 1-100. The short analysis in each card explains the evidence used to justify that score, and the references section gives students at least one grounded source they can cite in a report.
          </p>
        </div>
      )}

      {hasReferences && (
        <div className="mt-8 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
            <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="h-6 w-6 text-teal-800" />
                <h3 className="font-serif text-xl font-semibold text-slate-900">Data Sources & References</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {referenceCategories.map((catType) => {
                    const refs = groupedReferences[catType.key];
                    if (!refs || refs.length === 0) return null;

                    return (
                        <div key={catType.key} className="flex flex-col gap-3">
                            <span className={`text-xs uppercase tracking-wider font-bold px-2 py-1 rounded border w-fit ${catType.color}`}>
                                {catType.label}
                            </span>
                             <ul className="space-y-2">
                                 {refs.map((ref, idx) => (
                                     <li key={idx} className="flex items-start gap-2 break-all text-sm text-slate-600">
                                         <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"></div>
                                         <div className="space-y-1">
                                            <a 
                                                href={ref.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-teal-800 hover:underline"
                                            >
                                                {ref.title || ref.url}
                                            </a>
                                            {ref.relevanceNote && (
                                              <p className="text-xs leading-relaxed text-slate-500">{ref.relevanceNote}</p>
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
