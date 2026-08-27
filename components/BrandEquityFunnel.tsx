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
      color: 'var(--accent-5)',
      widthClass: 'w-1/2'
    },
    {
      name: 'Judgements & Feelings',
      items: [
        { name: 'Judgements', score: data.judgements.score },
        { name: 'Feelings', score: data.feelings.score }
      ],
      color: 'var(--accent-4)',
      widthClass: 'w-2/3'
    },
    {
      name: 'Performance & Imagery',
      items: [
        { name: 'Performance', score: data.performance.score },
        { name: 'Imagery', score: data.imagery.score }
      ],
      color: 'var(--accent-2)',
      widthClass: 'w-5/6'
    },
    {
      name: 'Salience',
      items: [{ name: 'Salience', score: data.salience.score }],
      color: 'var(--accent)',
      widthClass: 'w-full'
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-3 py-4">
        {levels.map((level) => (
            <div key={level.name} className={`${level.widthClass} flex overflow-hidden`} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-subtle)', transition: 'all 300ms ease-in-out' }}>
                {level.items.map((item, itemIndex) => (
                    <div
                      key={item.name}
                      className="flex-1 p-3 text-center text-white"
                      title={`${item.name}: ${item.score}/100`}
                      style={{
                        backgroundColor: level.color,
                        borderRight: level.items.length > 1 && itemIndex === 0 ? '1px solid rgba(255,255,255,0.22)' : undefined
                      }}
                    >
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', opacity: 0.92 }}>{item.name}</span>
                          <span style={{ display: 'block', marginTop: '4px', fontFamily: '"Inter", system-ui, sans-serif', fontSize: '1.75rem', fontWeight: 800 }}>{item.score}</span>
                     </div>
                ))}
            </div>
        ))}
    </div>
  );
};

export default BrandEquityFunnel;
