import React from 'react';
import type { CBBEData } from '../types';

interface BrandEquityFunnelProps {
  data: CBBEData;
}

const BrandEquityFunnel: React.FC<BrandEquityFunnelProps> = ({ data }) => {
  const levels = [
     {
      name: 'Resonance',
      items: [{ name: 'Resonance', score: data.resonance.score }],
      color: 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
      widthClass: 'w-1/2'
    },
    {
      name: 'Judgements & Feelings',
      items: [
        { name: 'Judgements', score: data.judgements.score },
        { name: 'Feelings', score: data.feelings.score }
      ],
      color: 'bg-gradient-to-r from-purple-500 to-violet-500',
      widthClass: 'w-2/3'
    },
    {
      name: 'Performance & Imagery',
      items: [
        { name: 'Performance', score: data.performance.score },
        { name: 'Imagery', score: data.imagery.score }
      ],
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      widthClass: 'w-5/6'
    },
    {
      name: 'Salience',
      items: [{ name: 'Salience', score: data.salience.score }],
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      widthClass: 'w-full'
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-2 py-4">
        {levels.map((level) => (
            <div key={level.name} className={`${level.widthClass} flex rounded-md overflow-hidden shadow-lg transition-all duration-300 ease-in-out`}>
                {level.items.map((item, itemIndex) => (
                    <div
                      key={item.name}
                      className={`flex-1 p-3 text-center text-white ${level.color} ${level.items.length > 1 && itemIndex === 0 ? 'border-r border-white/20' : ''}`}
                      title={`${item.name}: ${item.score}/100`}
                    >
                         <span className="text-sm sm:text-base font-semibold tracking-tight opacity-90">{item.name}</span>
                         <span className="block text-xl sm:text-3xl font-bold mt-1">{item.score}</span>
                    </div>
                ))}
            </div>
        ))}
    </div>
  );
};

export default BrandEquityFunnel;