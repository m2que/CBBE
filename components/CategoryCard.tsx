import React from 'react';
import type { CBBECategory } from '../types';

interface CategoryCardProps {
  title: string;
  level: number;
  data: CBBECategory;
}

const levelColors = {
  1: 'border-teal-700',
  2: 'border-amber-600',
  3: 'border-orange-600',
  4: 'border-slate-700',
};

const levelBgColors = {
  1: 'bg-teal-700',
  2: 'bg-amber-600',
  3: 'bg-orange-600',
  4: 'bg-slate-700',
};

const ScoreCircle: React.FC<{ score: number; level: number }> = ({ score, level }) => {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = levelColors[level as keyof typeof levelColors] || 'border-gray-500';

  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full" viewBox="0 0 60 60">
        <circle
          className="text-[rgba(113,86,56,0.18)]"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="28"
          cx="30"
          cy="30"
        />
        <circle
          className={colorClass.replace('border-', 'text-')}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="28"
          cx="30"
          cy="30"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xl font-bold text-slate-900">
        {score}
      </span>
    </div>
  );
};

const CategoryCard: React.FC<CategoryCardProps> = ({ title, level, data }) => {
  return (
    <div className={`flex h-full flex-col rounded-[22px] border bg-[rgba(255,252,247,0.92)] shadow-[0_20px_60px_rgba(61,41,20,0.08)] transition-all duration-300 ${levelColors[level as keyof typeof levelColors]}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${levelBgColors[level as keyof typeof levelColors]}`}></span>
          <h3 className="font-serif text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <ScoreCircle score={data.score} level={level} />
      </div>
      <div className="flex-grow border-t border-[rgba(113,86,56,0.14)] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Score drivers</p>
        <p className="text-sm leading-7 text-slate-600">{data.analysis}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
