
import React from 'react';
import type { CBBECategory } from '../types';

interface CategoryCardProps {
  title: string;
  level: number;
  data: CBBECategory;
}

const levelColors = {
  1: 'border-blue-500',
  2: 'border-indigo-500',
  3: 'border-purple-500',
  4: 'border-violet-500',
};

const levelBgColors = {
  1: 'bg-blue-500',
  2: 'bg-indigo-500',
  3: 'bg-purple-500',
  4: 'bg-violet-500',
};

const ScoreCircle: React.FC<{ score: number, level: number }> = ({ score, level }) => {
    const circumference = 2 * Math.PI * 28; // 2 * pi * r
    const offset = circumference - (score / 100) * circumference;
    const colorClass = levelColors[level as keyof typeof levelColors] || 'border-gray-500';

    return (
      <div className="relative h-20 w-20">
        <svg className="h-full w-full" viewBox="0 0 60 60">
          <circle
            className="text-gray-700"
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
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white">
          {score}
        </span>
      </div>
    );
};

const CategoryCard: React.FC<CategoryCardProps> = ({ title, level, data }) => {
  return (
    <div className={`bg-gray-800/60 rounded-lg border ${levelColors[level as keyof typeof levelColors]} shadow-lg flex flex-col transition-all duration-300 h-full`}>
      <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${levelBgColors[level as keyof typeof levelColors]}`}></span>
              <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
          </div>
          <ScoreCircle score={data.score} level={level}/>
      </div>
      <div className="p-4 border-t border-gray-700 flex-grow">
        <p className="text-gray-400 text-sm leading-relaxed">{data.analysis}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
