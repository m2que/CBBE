import React from 'react';
import type { CBBECategory } from '../types';

interface CategoryCardProps {
  title: string;
  level: number;
  data: CBBECategory;
}

const levelColors = {
  1: 'text-[#1f4b8f]',
  2: 'text-[#c39a5b]',
  3: 'text-[#87612a]',
  4: 'text-[#183159]',
};

const levelBgColors = {
  1: 'bg-[#1f4b8f]',
  2: 'bg-[#c39a5b]',
  3: 'bg-[#87612a]',
  4: 'bg-[#183159]',
};

const ScoreCircle: React.FC<{ score: number; level: number }> = ({ score, level }) => {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = levelColors[level as keyof typeof levelColors] || 'text-[#5f6b7a]';

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
          className={colorClass}
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
    <div className="brand-subtle-card flex h-full flex-col">
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
