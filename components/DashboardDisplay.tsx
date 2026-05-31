
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
    { key: 'official_brand', label: 'Official Brand', color: 'bg-emerald-900/50 text-emerald-300 border-emerald-700' },
    { key: 'government', label: 'Government', color: 'bg-blue-900/50 text-blue-300 border-blue-700' },
    { key: 'industry_databases', label: 'Industry Database', color: 'bg-amber-900/50 text-amber-300 border-amber-700' },
    { key: 'news_media', label: 'News Media', color: 'bg-red-900/50 text-red-300 border-red-700' },
    { key: 'academic_research', label: 'Academic Research', color: 'bg-purple-900/50 text-purple-300 border-purple-700' },
    { key: 'marketing_reports', label: 'Marketing Report', color: 'bg-cyan-900/50 text-cyan-300 border-cyan-700' },
  ];

  const hasReferences = data.references && data.references.length > 0;
  const hasScoreExplanation = categories.some((cat) => cat.data.analysis);

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-3xl font-bold text-center">
        CBBE Profile for <span className="text-cyan-400">{data.brandName}</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-300 text-center">Brand Equity Funnel</h3>
          <BrandEquityFunnel data={data} />
        </div>
        <div className="lg:col-span-2 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
           <h3 className="text-xl font-semibold mb-4 text-gray-300">Equity Score Overview</h3>
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
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <BookOpenIcon className="h-6 w-6 text-cyan-400"/>
                <h3 className="text-xl font-semibold text-gray-200">Executive Summary</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">{data.summary.analysis}</p>
        </div>
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <TargetIcon className="h-6 w-6 text-violet-500"/>
                <h3 className="text-xl font-semibold text-gray-200">Strategic Recommendations</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">{data.summary.strategicRecommendations}</p>
        </div>
      </div>

      {hasScoreExplanation && (
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <BookOpenIcon className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-semibold text-gray-200">How To Read The CBBE Score</h3>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Each score reflects the strength of the brand on a CBBE dimension from 1-100. The short analysis in each card explains the evidence used to justify that score, and the references section gives students at least one grounded source they can cite in a report.
          </p>
        </div>
      )}

      {hasReferences && (
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="h-6 w-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-gray-200">Data Sources & References</h3>
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
                                     <li key={idx} className="flex items-start gap-2 text-sm text-gray-400 break-all">
                                         <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                                         <div className="space-y-1">
                                           <a 
                                               href={ref.url} 
                                               target="_blank" 
                                               rel="noopener noreferrer"
                                               className="hover:text-cyan-400 hover:underline transition-colors"
                                           >
                                               {ref.title || ref.url}
                                           </a>
                                           {ref.relevanceNote && (
                                             <p className="text-xs text-gray-500 leading-relaxed">{ref.relevanceNote}</p>
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
