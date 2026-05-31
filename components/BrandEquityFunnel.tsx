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
      color: 'bg-[linear-gradient(135deg,#334155,#0f766e)]',
      widthClass: 'w-1/2'
    },
    {
      name: 'Judgements & Feelings',
      items: [
        { name: 'Judgements', score: data.judgements.score },
        { name: 'Feelings', score: data.feelings.score }
      ],
      color: 'bg-[linear-gradient(135deg,#9a3412,#d97706)]',
      widthClass: 'w-2/3'
    },
    {
      name: 'Performance & Imagery',
      items: [
        { name: 'Performance', score: data.performance.score },
        { name: 'Imagery', score: data.imagery.score }
      ],
      color: 'bg-[linear-gradient(135deg,#0f766e,#1d4ed8)]',
      widthClass: 'w-5/6'
    },
    {
      name: 'Salience',
      items: [{ name: 'Salience', score: data.salience.score }],
      color: 'bg-[linear-gradient(135deg,#115e59,#0f766e)]',
      widthClass: 'w-full'
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-3 py-4">
        {levels.map((level) => (
            <div key={level.name} className={`${level.widthClass} flex overflow-hidden rounded-2xl border border-white/30 shadow-[0_18px_40px_rgba(61,41,20,0.12)] transition-all duration-300 ease-in-out`}>
                {level.items.map((item, itemIndex) => (
                    <div
                      key={item.name}
                      className={`flex-1 p-3 text-center text-white ${level.color} ${level.items.length > 1 && itemIndex === 0 ? 'border-r border-white/20' : ''}`}
                      title={`${item.name}: ${item.score}/100`}
                    >
                         <span className="text-sm font-semibold tracking-tight opacity-90 sm:text-base">{item.name}</span>
                         <span className="mt-1 block font-serif text-xl font-bold sm:text-3xl">{item.score}</span>
                     </div>
                ))}
            </div>
        ))}
    </div>
  );
};

export default BrandEquityFunnel;
